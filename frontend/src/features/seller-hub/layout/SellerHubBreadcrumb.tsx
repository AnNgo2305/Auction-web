import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

function formatRouteName(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SellerHubBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);

  const current = segments.at(-1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Seller Hub</BreadcrumbItem>
        {current && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{formatRouteName(current)}</BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
