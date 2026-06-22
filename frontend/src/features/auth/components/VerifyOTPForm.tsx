import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/shared/ui/input-otp';
import { Separator } from '@/shared/ui/separator';
import { Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpSchema, type VerifyOtpBody as VerifyOTPValues} from '../schemas/verify-otp.schema';
import { OTP, OTP_TYPE, type OtpType } from '../constants/otp';
import { useVerifyEmailOTP } from '@/features/auth/hooks/useVerifyEmailOTP.ts';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTES } from '@/features/auth/constants/auth.routes.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';
import { toast } from 'sonner';
import { useVerifyResetPasswordlOTP } from '@/features/auth/hooks/useVerifyResetPasswordOTP.ts';
import { useResendOTPEmail } from '@/features/auth/hooks/useResendOTPEmail';
import { VERIFY_EMAIL_OTP_ERROR_MESSAGES } from '../constants/auth-error.messages.ts';
import { VERIFY_RESET_PASSWORD_OTP_ERROR_MESSAGES } from '../constants/auth-error.messages.ts';

type VerifyOTPFormProps = {
  type: OtpType;
};

type VerifyOTPState = {
  userId: string;
  email: string;
};

function getOtpErrorMessage(err: ApiResponseError, type: OtpType) {
  const code = err?.errorCode;

  switch (type) {
    case OTP_TYPE.VERIFY_EMAIL:
      return (
        (code && VERIFY_EMAIL_OTP_ERROR_MESSAGES[code]) ||
        VERIFY_EMAIL_OTP_ERROR_MESSAGES.DEFAULT
      );

    case OTP_TYPE.RESET_PASSWORD:
      return (
        (code && VERIFY_RESET_PASSWORD_OTP_ERROR_MESSAGES[code]) ||
        VERIFY_RESET_PASSWORD_OTP_ERROR_MESSAGES.DEFAULT
      );

    default:
      return 'Invalid OTP code';
  }
}

const isRedirectError = (code?: string) => {
  return code === 'USER_NOT_FOUND' || code === 'EMAIL_ALREADY_VERIFIED';
};

export function VerifyOTPForm({ type }: VerifyOTPFormProps) {
  const [emailSent, setEmailSent] = useState(false);
  const emailButtonLabel = `${emailSent ? 'Resend' : 'Send'} OTP`;
  const navigate = useNavigate();

  const config = OTP[type];
  const location = useLocation();
  const state = location.state as VerifyOTPState | undefined;
  const userId = state?.userId;
  const email = state?.email;

  if (!userId || !email) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  const form = useForm<Pick<VerifyOTPValues, 'code'>>({
    resolver: zodResolver(
      verifyOtpSchema.pick({
        code: true,
      }),
    ),
    defaultValues: {
      code: '',
    },
    mode: 'onChange',
  });
  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const verifyEmailOtpMutation = useVerifyEmailOTP(() => {
    navigate(AUTH_ROUTES.LOGIN, {
      replace: true,
    });
  });

  const verifyResetPasswordOtpMutation = useVerifyResetPasswordlOTP((res) => {
    const token = res.data.resetPasswordToken;

    navigate(`${AUTH_ROUTES.RESET_PASSWORD}?token=${token}`, { replace: true });
  });

  const mutationMap = {
    [OTP_TYPE.VERIFY_EMAIL]: verifyEmailOtpMutation,
    [OTP_TYPE.RESET_PASSWORD]: verifyResetPasswordOtpMutation,
  } as const;

  const resendOtpMutation = useResendOTPEmail(
    () => {
      setEmailSent(true);
    },
    (error) => {
      const code = error?.errorCode;
      if (code === 'USER_NOT_FOUND' || code === 'EMAIL_ALREADY_VERIFIED') {
        navigate(AUTH_ROUTES.LOGIN, { replace: true });
      }
    },
  );

  const onSubmit = async (data: Pick<VerifyOTPValues, 'code'>) => {
    try {
      const mutation = mutationMap[type];
      await mutation.mutateAsync({
        userId,
        type,
        code: data.code,
      });
    } catch (error: unknown) {
      const err = error as ApiResponseError;
      const message = getOtpErrorMessage(err, type);
      const code = err?.errorCode;

      if (isRedirectError(code)) {
        toast.error(message);
        navigate(AUTH_ROUTES.LOGIN, { replace: true });
        return;
      }

      setError('code', {
        type: 'server',
        message,
      });
    }
  };

  const handleSendEmail = () => {
    if (!userId || !email) {
      toast.error('Invalid verification session. Please try again.');
      navigate(AUTH_ROUTES.LOGIN, { replace: true, });
      return;
    }

    resendOtpMutation.mutate({
      email,
      type,
    });
  };

  const isVerifying = verifyEmailOtpMutation.isPending || verifyResetPasswordOtpMutation.isPending;

  return (
    <Card className="mx-auto w-full max-w-xl shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-semibold">{config.title}</CardTitle>
        <CardDescription className="text-sm">
          {config.description}
          {email && (
            <>
              <br />
              <span className="text-muted-foreground mt-1 inline-block">
                Verifying email:{' '}
                <span className="text-foreground font-medium">{email}</span>
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <div className="flex w-full justify-center">
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.code?.type === 'server') {
                        clearErrors('code');
                      }
                    }}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={0}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                      <InputOTPSlot
                        index={1}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                      <InputOTPSlot
                        index={2}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={3}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                      <InputOTPSlot
                        index={4}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                      <InputOTPSlot
                        index={5}
                        className="focus:ring-primary h-12 w-10 rounded-md border text-lg font-semibold focus:ring-2"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </div>
            {errors.code && (
              <p className="text-destructive mt-2 text-center text-sm">
                {errors.code.message}
              </p>
            )}
          </Field>
          <Separator className="my-4" />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSendEmail}
              disabled={resendOtpMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 font-medium"
            >
              {resendOtpMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  {emailSent ? 'Resending OTP ...' : 'Sending OTP ...'}
                </span>
              ) : (
                emailButtonLabel
              )}
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="flex-1 bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={watch('code')?.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Verifying OTP ...
                </span>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-muted-foreground w-full text-center text-sm">
          Can't find the OTP email? Check your spam or junk folder, then resend
          the code if needed.
        </p>
      </CardFooter>
    </Card>
  );
}
