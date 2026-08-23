import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { formatIsoToDate } from '@/shared/utils/format-time';
import { useNavigate } from 'react-router-dom';
import type { ProductStatus, PublicCategory } from '@/shared/types/product';
import React from 'react';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { profilePaths } from '@/features/profile/constants/profile.routes.ts';

type ProductCategory = {
  categoryId: string;
  name: string;
};

type ProductBasicInformationCardProps = {
  name: string;
  description: string | null;
  stockQuantity: number;
  status: ProductStatus;
  publicCategory: PublicCategory;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
  isLoading?: boolean;
};

export function ProductInformationCard({
  name,
  description,
  stockQuantity,
  status,
  publicCategory,
  sellerId,
  sellerName,
  createdAt,
  updatedAt,
  categories,
  isLoading = false,
}: ProductBasicInformationCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border p-6 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-72" />
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const categoryLabel = publicCategory
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const statusLabel = status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="bg-background rounded-xl border p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">Name</p>
        <p className="text-lg font-semibold">{name}</p>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-muted-foreground text-sm">Description</p>
        <p className="text-sm whitespace-pre-wrap">
          {description ?? 'No description.'}
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <InfoItem
          label="Public Category"
          value={<Badge variant="secondary">{categoryLabel}</Badge>}
        />

        <InfoItem label="Stock Quantity" value={<span>{stockQuantity}</span>} />

        <InfoItem label="Status" value={<Badge>{statusLabel}</Badge>} />

        <InfoItem
          label="Seller"
          value={
            <Button
              variant="link"
              className="h-auto p-0 font-medium"
              onClick={() => void navigate(profilePaths.overview(sellerId))}
            >
              {sellerName}
            </Button>
          }
        />

        <InfoItem label="Created" value={formatIsoToDate(createdAt)} />

        <InfoItem label="Last Updated" value={formatIsoToDate(updatedAt)} />
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-muted-foreground text-sm">Categories</p>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category.categoryId} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

type InfoItemProps = {
  label: string;
  value: React.ReactNode;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <div>{value}</div>
    </div>
  );
}
