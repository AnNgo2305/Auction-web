import { ADDRESS_TYPE, type AddressType } from '@/shared/types/address';
import { Building2, Globe, Home, MapPinHouse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type AddressCardProps = {
  streetAddress: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  addressType: AddressType;
};

function getAddressTypeIcon(addressType: AddressType) {
  switch (addressType) {
    case ADDRESS_TYPE.Home:
      return <Home className="h-5 w-5" />;
    case ADDRESS_TYPE.Work:
      return <Building2 className="h-5 w-5" />;
    case ADDRESS_TYPE.Others:
      return <MapPinHouse className="h-5 w-5" />;
  }
}

export function AddressCard({
  streetAddress,
  city,
  state,
  postalCode,
  country,
  addressType,
}: AddressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {getAddressTypeIcon(addressType)}
          {addressType}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPinHouse className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1 text-sm">
            <p>{streetAddress}</p>
            <p>
              {city}
              {state ? `, ${state}` : ''}
              {postalCode ? ` ${postalCode}` : ''}
            </p>
            <div className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{country}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

