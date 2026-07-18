import { ADDRESS_TYPE, type AddressType } from '@/shared/types/address';
import {
  Building2,
  Globe,
  Home,
  MapPin,
  MapPinHouse,
  MapPinned,
  Mail,
} from 'lucide-react';
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {getAddressTypeIcon(addressType)}
          {addressType}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <MapPinned className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Street Address
            </p>
            <p className="wrap-break-word">{streetAddress}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              City
            </p>
            <p>{city}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Building2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              State / Province
            </p>
            <p>{state ?? ''}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Postal Code
            </p>
            <p>{postalCode ?? ''}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Country
            </p>
            <p>{country ?? ''}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
