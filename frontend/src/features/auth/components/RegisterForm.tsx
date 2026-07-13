import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from '@/shared/ui/field';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { InputGroup, InputGroupButton, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group.tsx';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Separator } from '@/shared/ui/separator';
import { Spinner } from '@/shared/ui/spinner.tsx';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  type RegisterBody as RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { useRegister } from '@/features/auth/hooks/useRegister';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'BIDDER',
    },
    mode: "onChange"
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = form;

  const registerMutation = useRegister((res) => {
    navigate(authPaths.verifyEmail(), {
      state: {
        userId: res.data.userId,
        email: res.data.email,
      },
    });
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Sign up
        </CardTitle>
        <CardDescription className="text-sm">
          Already have an account?{' '}
          <Link
            to={authPaths.login()}
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            Sign in
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username" className="text-sm font-medium">
                Username
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <User size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  {...register('username')}
                />
              </InputGroup>
              <FieldDescription className="mb-0 text-xs leading-tight">
                3–20 characters. You can use letters, numbers, and underscores
                only.
              </FieldDescription>
              {errors.username && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.username.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-sm font-medium">
                Email
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  {...register('email')}
                />
              </InputGroup>
              <FieldDescription className="mb-0 text-xs leading-tight">
                Please enter your valid email. We will send an OTP to verify
                your account.
              </FieldDescription>
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
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
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
              <FieldDescription className="mb-0 text-xs leading-tight">
                Use 6–100 characters with at least 1 uppercase letter, 1 number,
                and 1 special character.
              </FieldDescription>
              {errors.password && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.password.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirm Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  required
                  {...register('confirmPassword')}
                />
                <InputGroupButton
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (showConfirmPassword) => !showConfirmPassword,
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </InputGroupButton>
              </InputGroup>
              {errors.confirmPassword && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.confirmPassword.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel className="text-sm font-medium">Role</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field, fieldState }) => (
                  <>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="BIDDER" id="bidder" />
                        <label
                          htmlFor="bidder"
                          className="cursor-pointer text-sm"
                        >
                          Bidder
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="SELLER" id="seller" />
                        <label
                          htmlFor="seller"
                          className="cursor-pointer text-sm"
                        >
                          Seller
                        </label>
                      </div>
                    </RadioGroup>
                    {fieldState.error && (
                      <FieldError className="text-xs leading-tight text-red-500">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </>
                )}
              />
            </Field>
            <label
              htmlFor="terms"
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(!!checked)}
              />
              <span className="text-sm">I agree to Terms & Conditions</span>
            </label>
            <Separator />
            <Button
              type="submit"
              disabled={!isValid || !agreeTerms || registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Signing up ...
                </div>
              ) : (
                'Sign up'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          By clicking “Sign up”, you agree to our Terms of Service and Privacy
          Policy, and confirm that you have read and understood our policies.
        </p>
      </CardFooter>
    </Card>
  );
}
