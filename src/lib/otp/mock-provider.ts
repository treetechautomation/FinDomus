import { OTPProvider } from './otp-provider';

export class MockOTPProvider implements OTPProvider {
  async sendOTP(_phone: string, code: string): Promise<boolean> {
    console.log(`[MockOTP] Code: ${code} — sent to phone (mock)`);
    return true;
  }

  getProviderName(): string {
    return 'mock';
  }
}

let currentProvider: OTPProvider = new MockOTPProvider();

export function setOTPProvider(provider: OTPProvider): void {
  currentProvider = provider;
}

export function getOTPProvider(): OTPProvider {
  return currentProvider;
}
