import { VerifyOTPForm } from '@/features/auth/components/VerifyOTPForm.tsx';
import { OTP_TYPE } from '@/shared/types/otp.ts';

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto flex items-center justify-center py-16">
      <VerifyOTPForm type={OTP_TYPE.VERIFY_EMAIL} />;
    </div>
  );
}
