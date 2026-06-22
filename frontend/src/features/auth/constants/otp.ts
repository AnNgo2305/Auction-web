export const OTP_TYPE = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

export type OtpType = keyof typeof OTP_TYPE;

export const OTP: Record<OtpType, { title: string; description: string }> = {
  VERIFY_EMAIL: {
    title: 'Verify Email',
    description:
      'Enter the 6-digit OTP code sent to your email address to verify your email',
  },

  RESET_PASSWORD: {
    title: 'Reset Password',
    description:
      'Enter the 6-digit OTP code sent to your email to continue resetting your password',
  },
};
