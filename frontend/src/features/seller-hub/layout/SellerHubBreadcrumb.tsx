import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import { Fragment } from 'react';

function formatRouteName(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SellerHubBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Seller Hub</BreadcrumbItem>
        {breadcrumbs.map((segment) => (
          <Fragment key={segment}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{formatRouteName(segment)}</BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
