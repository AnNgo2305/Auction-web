import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { User, Mail, Phone, Cake, VenusAndMars } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldError } from '@/shared/ui/field';
import {
  updateProfileSchema,
  type UpdateProfileBody,
} from '@/features/profile/schemas/update-profile.schema';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';

type EditProfileFormProps = {
  email: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  bio: string | null;
  dateOfBirth: string | Date | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
};

const GENDER_OPTIONS = [
  {
    label: 'Male',
    value: 'MALE',
  },
  {
    label: 'Female',
    value: 'FEMALE',
  },
  {
    label: 'Other',
    value: 'OTHER',
  },
] as const;

export function EditProfileForm({
  email,
  username,
  fullName,
  phoneNumber,
  bio,
  dateOfBirth,
  gender,
}: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<UpdateProfileBody>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: fullName ?? '',
      phoneNumber: phoneNumber ?? '',
      bio: bio ?? '',
      dateOfBirth: dateOfBirth
        ? new Date(dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: gender ?? undefined,
    },
    mode: 'onChange',
  });

  const updateProfileMutation = useUpdateProfile((res) => {
    reset({
      fullName: res.data.fullName ?? '',
      phoneNumber: res.data.phoneNumber ?? '',
      bio: res.data.bio ?? '',
      dateOfBirth: res.data.dateOfBirth
        ? new Date(res.data.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: res.data.gender ?? undefined,
    });
  });

  const onSubmit = (values: UpdateProfileBody) => {
    updateProfileMutation.mutate({
      fullName: values.fullName || null,
      phoneNumber: values.phoneNumber || null,
      bio: values.bio || null,
      dateOfBirth: values.dateOfBirth
        ? new Date(values.dateOfBirth).toISOString()
        : null,
      gender: values.gender ?? null,
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
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
                  value={email}
                  id="email"
                  readOnly
                  className="bg-muted h-full py-0 text-2xl leading-normal"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="username" className="text-sm font-medium">
                Username
              </FieldLabel>
              <InputGroup className="h-14">
                <InputGroupAddon>
                  <User size={30} />
                </InputGroupAddon>
                <InputGroupInput
                  value={username}
                  id="username"
                  readOnly
                  className="bg-muted h-full py-0 text-2xl leading-normal"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="fullName" className="text-sm font-medium">
                Full name
              </FieldLabel>
              <InputGroup className="h-14">
                <InputGroupAddon>
                  <User size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('fullName')}
                />
              </InputGroup>
              {errors.fullName && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.fullName.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="phoneNumber" className="text-sm font-medium">
                Phone number
              </FieldLabel>
              <InputGroup className="h-14">
                <InputGroupAddon>
                  <Phone size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  {...register('phoneNumber')}
                />
              </InputGroup>
              {errors.phoneNumber && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.phoneNumber.message}
                </FieldError>
              )}
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium"
                >
                  Date of birth
                </FieldLabel>
                <InputGroup className="h-14">
                  <InputGroupAddon>
                    <Cake size={16} />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                </InputGroup>
                {errors.dateOfBirth && (
                  <FieldError className="text-xs leading-tight text-red-500">
                    {errors.dateOfBirth.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="gender" className="text-sm font-medium">
                  Gender
                </FieldLabel>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <div className="relative">
                      <VenusAndMars className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-14 pl-10">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {GENDER_OPTIONS.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.gender && (
                  <FieldError className="text-xs leading-tight text-red-500">
                    {errors.gender.message}
                  </FieldError>
                )}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="bio" className="text-sm font-medium">
                Bio
              </FieldLabel>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
                className="min-h-32 resize-none"
                {...register('bio')}
              />
              {errors.bio && (
                <FieldError className="text-xs leading-tight text-red-500">
                  {errors.bio.message}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
