import type { GetProfileData } from '../types/get-profile.response';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card.tsx';
import { Field, FieldGroup, FieldLabel } from '@/shared/ui/field.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group.tsx';
import { User, Mail, Phone, Cake, VenusAndMars } from 'lucide-react';
import { Button } from '@/shared/ui/button.tsx';
import { Textarea } from '@/shared/ui/textarea.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface EditProfileFormProps extends Pick<
  GetProfileData,
  | 'email'
  | 'username'
  | 'fullName'
  | 'phoneNumber'
  | 'bio'
  | 'dateOfBirth'
  | 'gender'
> {}

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

export function EditProfileForm(props: EditProfileFormProps) {
  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-0.5 text-center">
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3">
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
                  value={props.email}
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
                  value={props.username}
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
                  defaultValue={props.fullName ?? ''}
                  placeholder="Enter your full name"
                />
              </InputGroup>
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
                  defaultValue={props.phoneNumber ?? ''}
                  placeholder="Enter your phone number"
                />
              </InputGroup>
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
                    defaultValue={props.dateOfBirth ?? ''}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="gender" className="text-sm font-medium">
                  Gender
                </FieldLabel>
                <div className="relative">
                  <VenusAndMars className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Select defaultValue={props.gender ?? undefined}>
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
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="bio" className="text-sm font-medium">
                Bio
              </FieldLabel>
              <Textarea
                id="bio"
                defaultValue={props.bio ?? ''}
                placeholder="Tell others about yourself..."
                className="min-h-32 resize-none"
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
