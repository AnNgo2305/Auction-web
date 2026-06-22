import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/shared/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/shared/ui/input-group';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { resetPasswordSchema, type ResetPasswordBody as ResetPasswordValues } from '@/features/auth/schemas/reset-password.schema';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { AUTH_ROUTES } from '@/features/auth/constants/auth.routes.ts';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [params] = useSearchParams();
  const resetPasswordToken = params.get('token');

  if (!resetPasswordToken) {
    return <Navigate to={AUTH_ROUTES.FORGOT_PASSWORD} replace />;
  }

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
      resetPasswordToken,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const resetPasswordMutation = useResetPassword(() => {
    navigate(AUTH_ROUTES.LOGIN, {
      replace: true,
    });
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    resetPasswordMutation.mutate({
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
      resetPasswordToken,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-sm">
          Create a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password" className="text-sm font-medium">
                New Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() =>
                    setShowNewPassword((showNewPassword) => !showNewPassword)
                  }
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </InputGroupButton>
              </InputGroup>
              {errors.newPassword && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.newPassword.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel
                htmlFor="confirmNewPassword"
                className="text-sm font-medium"
              >
                Confirm Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  {...register('confirmNewPassword')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </InputGroupButton>
              </InputGroup>
              {errors.confirmNewPassword && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.confirmNewPassword.message}
                </FieldError>
              )}
            </Field>
            <Button
              type="submit"
              disabled={!isValid || resetPasswordMutation.isPending}
              className="w-full"
            >
              {resetPasswordMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Resetting password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-muted-foreground w-full text-center text-sm">
          Your new password will be used the next time you sign in.
        </p>
      </CardFooter>
    </Card>
  );
}