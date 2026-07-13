import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Field, FieldLabel } from '@/shared/ui/field';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { useForm } from 'react-hook-form';
import { forgotPasswordSchema, type ForgotPasswordBody as ForgotPasswordValues } from '@/features/auth/schemas/forgot-password.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import type { ApiResponseError } from '@/shared/types/error';
import { useNavigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import { FORGOT_PASSWORD_ERROR_MESSAGES } from '@/features/auth/constants/auth-error.messages';

export function ForgotPasswordForm() {
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isValid },
  } = form

  const forgotPasswordMutation = useForgotPassword((res) => {
    navigate(authPaths.verifyResetPassword(), {
      state: {
        userId: res.data.userId,
        email: res.data.email,
      },
    });
  });

  const onSubmit = async (data: ForgotPasswordValues): Promise<void> => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
    } catch (error: unknown) {
      const err = error as ApiResponseError;

      const message =
        (err?.errorCode && FORGOT_PASSWORD_ERROR_MESSAGES[err.errorCode]) ||
        FORGOT_PASSWORD_ERROR_MESSAGES.DEFAULT;

      setError('email', {
        type: 'server',
        message,
      });
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-semibold">
          Forgot Password
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your email address and we’ll send you a verification code to
          reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="email" className="text-sm font-medium">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              {...register('email', {
                onChange: () => {
                  if (errors.email?.type === 'server') {
                    clearErrors('email');
                  }
                },
              })}
            />
            {errors.email && (
              <p className="text-destructive mt-2 text-sm">
                {errors.email.message}
              </p>
            )}
          </Field>
          <p className="text-muted-foreground text-sm">
            Make sure you use the email associated with your account.
          </p>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || forgotPasswordMutation.isPending}
              className="min-w-35"
            >
              {forgotPasswordMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Sending OTP code ...
                </span>
              ) : (
                'Send OTP code'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-muted-foreground w-full text-center text-sm">
          If you don’t receive an email, check your spam folder.
        </p>
      </CardFooter>
    </Card>
  );
}
