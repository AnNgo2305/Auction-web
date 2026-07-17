import { useEffect, useState } from 'react';
import  { ADDRESS_TYPE, type AddressType } from '@/shared/types/address';
import { Button } from '@/shared/ui/button';
import { Loader2, MapPinned, Pencil, Plus, X } from 'lucide-react';
import { AddressCard } from '@/features/profile/components/AddressCard';
import { EditableAddressCard } from '@/features/profile/components/EditableAddressCard';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  updateAddressesBodySchema,
  type UpdateAddressesBody,
} from '@/features/profile/schemas/update-addresses.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { useUpdateAddresses } from '@/features/profile/hooks/address/useUpdateAddresses.ts';

type UserAddressListProps = {
  userId: string;
  addresses: {
    addressId: string;
    streetAddress: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
    addressType: AddressType;
  }[];
  isInitialLoading: boolean;
  isOwner: boolean;
};

const MAX_ADDRESSES = 5;
const mapAddressesToFormValues = (
  addresses: UserAddressListProps['addresses'],
): UpdateAddressesBody['addresses'] => {
  return addresses.map((address) => ({
    streetAddress: address.streetAddress,
    city: address.city,
    state: address.state ?? null,
    postalCode: address.postalCode ?? null,
    country: address.country,
    addressType: address.addressType,
  }));
};

export function UserAddressList({ addresses, isInitialLoading, isOwner, userId }: UserAddressListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<UpdateAddressesBody>({
    resolver: zodResolver(updateAddressesBodySchema),
    defaultValues: {
      addresses: [],
    },
    mode: 'onChange'
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid, isDirty}
  } = form;


  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'addresses',
  });

  const updateAddressesMutation = useUpdateAddresses(userId);

  useEffect(() => {
    reset({
      addresses: mapAddressesToFormValues(addresses),
    });
  }, [addresses, form])

  if (isInitialLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-card p-6 shadow-sm"
          >
            <Skeleton className="mb-5 h-6 w-36" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleCancel = () => {
    if (addresses) {
      reset({
        addresses: mapAddressesToFormValues(addresses),
      });
    }
    setIsEditing(false);
  }

  const handleSave = handleSubmit(async (values) => {
    try {
      await updateAddressesMutation.mutateAsync(values);
      setIsEditing(false);
    } catch {}
  });

  const handleAddAddress = () => {
    if (fields.length >= MAX_ADDRESSES) return;

    append({
      streetAddress: '',
      city: '',
      state: null,
      postalCode: null,
      country: '',
      addressType: ADDRESS_TYPE.Home,
    });
  }

  const handleRemoveAddress = (index: number) => {
    remove(index);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Addresses</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your saved addresses
        </p>
        {isOwner &&
          (isEditing ? (
            <Button
              variant="ghost"
              className="gap-2 rounded-xl"
              onClick={handleCancel}
              disabled={updateAddressesMutation.isPending || !isDirty}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ))
        }
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        {isEditing ? (
          fields.length > 0 ? (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <EditableAddressCard
                  key={field.id}
                  form={form}
                  index={index}
                  onDelete={() => handleRemoveAddress(index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-2xl border border-dashed py-12 text-center">
              <p className="font-medium">No addresses yet</p>
              <p className="mt-1 text-sm">
                Click <strong>Add address</strong> to create your first address.
              </p>
            </div>
          )
        ) : (addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.addressId}
                {...address}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center">
            <MapPinned className="mx-auto mb-4 h-10 w-10 opacity-50" />
            <h3 className="text-foreground text-lg font-medium">
              No addresses yet
            </h3>
            <p className="mt-2 text-sm">
              {isOwner
                ? 'Click Edit to add your first address.'
                : "This user hasn't added any addresses."}
            </p>
          </div>
        ))}
        {isEditing && (
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAddress}
              disabled={
                updateAddressesMutation.isPending ||
                fields.length >= MAX_ADDRESSES
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add address
            </Button>
            <Button
              type="submit"
              disabled={
                updateAddressesMutation.isPending ||
                !isDirty ||
                !isValid
              }
            >
              {updateAddressesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {updateAddressesMutation.isPending
                ? 'Saving changes...'
                : 'Save changes'}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}