export interface OTPProvider {
  sendOTP(phone: string, code: string): Promise<boolean>;
  getProviderName(): string;
}

export interface OTPVerification {
  id: string;
  userId: string;
  phone: string;
  purpose: string;
  codeHash: string;
  salt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'verified' | 'expired' | 'blocked';
  createdAt: string;
}
