import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/shared/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@/shared/ui/input-group';
import { Button } from '@/shared/ui/button'
import {
  type ChangePasswordBody,
  changePasswordSchema,
} from '@/features/setting/schemas/change-password.schema';
import { Spinner } from '@/shared/ui/spinner';
import { useChangePassword } from '@/features/setting/hooks/security/useChangePassword.ts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext.tsx';
import { authPaths } from '@/features/auth/constants/auth.routes.ts';

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { logoutAll } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ChangePasswordBody>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = form;

  const changePasswordMutation = useChangePassword(async () => {
    reset();

    await logoutAll();

    navigate(authPaths.login(), {
      replace: true,
    });
  });

  const onSubmit = async (data: ChangePasswordBody) => {
    changePasswordMutation.mutate(data);
  };


  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Change Password
        </CardTitle>
        <CardDescription className="text-sm">
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="currentPassword"
                className="text-sm font-medium"
              >
                Current Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  {...register('currentPassword')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </InputGroupButton>
              </InputGroup>
              {errors.currentPassword && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.currentPassword.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...register('newPassword')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
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
                Confirm New Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
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
              className="w-full"
              disabled={!isValid || changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Updating password...
                </div>
              ) : (
                'Update Password'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-muted-foreground w-full text-center text-sm">
          Your password will be updated immediately after confirmation.
        </p>
      </CardFooter>
    </Card>
  );
}