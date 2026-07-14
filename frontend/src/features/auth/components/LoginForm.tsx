import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/shared/ui/field';
import { InputGroup, InputGroupButton, InputGroupAddon, InputGroupInput, } from '@/shared/ui/input-group';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginBody as LoginFormValues } from '@/features/auth/schemas/login.schema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { toast } from 'sonner';
import { useUser } from '@/shared/contexts/UserContext';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const loginMutation = useLogin((res) => {
    if (res.data.otpRequired) {
      toast.info(
        'Please click the "Send OTP" button to receive a verification code to your email before continuing.',
      );
      navigate(authPaths.verifyEmail(), {
        state: {
          userId: res.data.user.userId,
          email: res.data.user.email,
        },
      });
      return;
    }

    const {
      userId,
      email,
      username,
      role,
      profileImageUrl,
      coverImageUrl,
    } = res.data.user;

    setCurrentUser({
      userId,
      email,
      username,
      role,
      profileImageUrl,
      coverImageUrl,
    });

    toast.success(res.message);
    navigate('/');
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-sm">
          Don’t have an account?{' '}
          <Link
            to={authPaths.register()}
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            Sign up
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="text-sm font-medium">
                Email
              </FieldLabel>
              <InputGroup className="h-14">
                <InputGroupAddon>
                  <Mail size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  {...register('email')}
                  className="h-full py-0 text-2xl leading-normal"
                />
              </InputGroup>
              {errors.email && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.email.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="text-sm font-medium">
                Password
              </FieldLabel>
              <InputGroup className="h-14">
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="password"
                  {...register('password')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() =>
                    setShowPassword((showPassword) => !showPassword)
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </InputGroupButton>
              </InputGroup>
              {errors.password && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.password.message}
                </FieldError>
              )}
            </Field>
            <Button
              type="submit"
              disabled={!isValid || loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link
          to={authPaths.forgotPassword()}
          className="text-primary text-sm hover:underline"
        >
          Forgot password?
        </Link>
      </CardFooter>
    </Card>
  );
}
