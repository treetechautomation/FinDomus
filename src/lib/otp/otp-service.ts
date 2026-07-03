import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { getOTPProvider } from './mock-provider';
import { OTPVerification } from './otp-provider';
import { isWhatsappOtpEnabled } from '@/lib/billing/feature-flags-admin';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

function hashCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(code + salt).digest('hex');
}

export async function sendOTP(
  userId: string,
  phone: string,
  purpose: string
): Promise<{ otpId: string; expiresAt: string; canResend: boolean; waitSeconds: number }> {
  const otpEnabled = await isWhatsappOtpEnabled(userId);
  if (!otpEnabled) {
    return { otpId: 'mock-otp-id', expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60000).toISOString(), canResend: true, waitSeconds: 0 };
  }

  const existingSnap = await adminDb
    .collection('whatsapp_verifications')
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    const last = existingSnap.docs[0].data() as OTPVerification;
    const lastCreatedAt = new Date(last.createdAt).getTime();
    const elapsed = (Date.now() - lastCreatedAt) / 1000;
    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed);
      return { otpId: last.id, expiresAt: last.expiresAt, canResend: false, waitSeconds };
    }
  }

  const code = generateCode();
  const salt = crypto.randomUUID();
  const codeHash = hashCode(code, salt);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60000).toISOString();

  const ref = adminDb.collection('whatsapp_verifications').doc();
  const verification: OTPVerification = {
    id: ref.id,
    userId,
    phone,
    purpose,
    codeHash,
    salt,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await ref.set(verification as any);

  const provider = getOTPProvider();
  await provider.sendOTP(phone, code);

  return { otpId: ref.id, expiresAt, canResend: true, waitSeconds: 0 };
}

export async function verifyOTP(
  otpId: string,
  code: string,
  userId: string
): Promise<{ verified: boolean; remainingAttempts: number; reason?: string }> {
  const otpEnabled = await isWhatsappOtpEnabled(userId);
  if (!otpEnabled) {
    return { verified: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const ref = adminDb.collection('whatsapp_verifications').doc(otpId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { verified: false, remainingAttempts: 0, reason: 'OTP_NOT_FOUND' };
  }

  const verification = snap.data() as OTPVerification;

  if (verification.status === 'verified') {
    return { verified: true, remainingAttempts: 0 };
  }

  if (verification.status === 'blocked') {
    return { verified: false, remainingAttempts: 0, reason: 'OTP_BLOCKED' };
  }

  if (verification.status === 'expired') {
    return { verified: false, remainingAttempts: 0, reason: 'OTP_EXPIRED' };
  }

  if (Date.now() > new Date(verification.expiresAt).getTime()) {
    await ref.update({ status: 'expired' } as any);
    return { verified: false, remainingAttempts: 0, reason: 'OTP_EXPIRED' };
  }

  const newAttempts = verification.attempts + 1;
  const expectedHash = hashCode(code, verification.salt);

  if (expectedHash !== verification.codeHash) {
    if (newAttempts >= verification.maxAttempts) {
      await ref.update({ attempts: newAttempts, status: 'blocked' } as any);
      return { verified: false, remainingAttempts: 0, reason: 'OTP_BLOCKED' };
    }
    await ref.update({ attempts: newAttempts } as any);
    return { verified: false, remainingAttempts: verification.maxAttempts - newAttempts, reason: 'INVALID_CODE' };
  }

  await ref.update({ attempts: newAttempts, status: 'verified' } as any);
  return { verified: true, remainingAttempts: verification.maxAttempts - newAttempts };
}
