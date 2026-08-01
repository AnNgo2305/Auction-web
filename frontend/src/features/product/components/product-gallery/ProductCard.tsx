import { ArrowRight, User } from 'lucide-react';
import { Badge } from '@/shared/ui/badge.tsx';
import { Button } from '@/shared/ui/button.tsx';
import { Card, CardContent } from '@/shared/ui/card.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';

type ProductCategory = {
  categoryId: string;
  name: string;
};

type ProductCardProps = {
  productId: string;
  sellerId: string;
  name: string;
  sellerName: string;
  publicCategory: string;
  thumbnail: string | null;
  categories: ProductCategory[];
  createdAt: string;
  onViewDetails?: (productId: string) => void;
  onViewSeller?: (sellerId: string) => void;
};

export function ProductCard({
  productId,
  sellerId,
  name,
  sellerName,
  publicCategory,
  thumbnail,
  categories,
  createdAt,
  onViewDetails,
  onViewSeller,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}
      <div className="bg-muted relative aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            No image
          </div>
        )}

        <Badge className="absolute top-3 left-3">
          {publicCategory
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </Badge>
      </div>

      <CardContent className="space-y-4 p-4">
        {/* Product name */}
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold">
          {name}
        </h3>

        {/* Seller */}
        <div className="flex items-center gap-2 text-sm">
          <User className="text-muted-foreground size-4 shrink-0" />

          <Button
            variant="link"
            className="h-auto p-0 text-sm font-normal"
            onClick={() => onViewSeller?.(sellerId)}
          >
            {sellerName}
          </Button>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category.categoryId} variant="secondary">
                {category.name}
              </Badge>
            ))}

            {categories.length > 2 && (
              <Badge variant="secondary">+{categories.length - 2}</Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground text-xs">
            Created {formatIsoToDate(createdAt)}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="group"
            onClick={() => onViewDetails?.(productId)}
          >
            View Details
            <ArrowRight className="ml-1 size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
