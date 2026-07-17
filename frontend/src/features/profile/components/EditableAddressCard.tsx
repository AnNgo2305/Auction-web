import { Controller, type UseFormReturn } from 'react-hook-form';
import type { UpdateAddressesBody } from '@/features/profile/schemas/update-addresses.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Building2, MapPinned, Trash2, Map, Mail, Globe2 } from 'lucide-react';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/shared/ui/field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { ADDRESS_TYPE } from '@/shared/types/address';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group.tsx';

type EditableAddressCardProps = {
  form: UseFormReturn<UpdateAddressesBody>;
  index: number;
  onDelete: () => void;
};

export function EditableAddressCard({
  form,
  index,
  onDelete,
}: EditableAddressCardProps) {
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="text-center text-base">
          Address {index + 1}
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="absolute top-4 right-6"
        >
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`address-type-${index}`}>
              Address Type
            </FieldLabel>
            <Controller
              control={form.control}
              name={`addresses.${index}.addressType`}
              render={({ field }) => (
                <Select
                  key={`address-type-${index}`}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={`address-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ADDRESS_TYPE.Home}>Home</SelectItem>
                    <SelectItem value={ADDRESS_TYPE.Work}>Work</SelectItem>
                    <SelectItem value={ADDRESS_TYPE.Others}>Others</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>
              {form.formState.errors.addresses?.[index]?.addressType?.message}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`street-address-${index}`}>
              Street Address
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MapPinned className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id={`street-address-${index}`}
                {...form.register(`addresses.${index}.streetAddress`)}
                aria-invalid={
                  !!form.formState.errors.addresses?.[index]?.streetAddress
                }
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.addresses?.[index]?.streetAddress?.message}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`city-${index}`}>City</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Building2 className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id={`city-${index}`}
                {...form.register(`addresses.${index}.city`)}
                aria-invalid={!!form.formState.errors.addresses?.[index]?.city}
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.addresses?.[index]?.city?.message}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`state-${index}`}>State</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Map className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id={`state-${index}`}
                {...form.register(`addresses.${index}.state`)}
                aria-invalid={!!form.formState.errors.addresses?.[index]?.state}
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.addresses?.[index]?.state?.message}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`postal-code-${index}`}>
              Postal Code
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id={`postal-code-${index}`}
                {...form.register(`addresses.${index}.postalCode`)}
                aria-invalid={
                  !!form.formState.errors.addresses?.[index]?.postalCode
                }
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.addresses?.[index]?.postalCode?.message}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`country-${index}`}>Country</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Globe2 className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id={`country-${index}`}
                {...form.register(`addresses.${index}.country`)}
                aria-invalid={
                  !!form.formState.errors.addresses?.[index]?.country
                }
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.addresses?.[index]?.country?.message}
            </FieldError>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
