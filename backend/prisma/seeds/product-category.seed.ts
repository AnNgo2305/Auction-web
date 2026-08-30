import type { PrismaClient } from '@generated/prisma/client';
import { Role } from '@generated/prisma/client';

const categoryTemplates = [
  { name: 'Electronics', color: '#3B82F6' },
  { name: 'Gaming', color: '#8B5CF6' },
  { name: 'New', color: '#10B981' },
  { name: 'Used', color: '#F59E0B' },
  { name: 'Like New', color: '#06B6D4' },
  { name: 'Featured', color: '#EF4444' },
  { name: 'Clearance', color: '#F97316' },
  { name: 'Popular', color: '#EC4899' },
  { name: 'Vintage', color: '#A855F7' },
  { name: 'Premium', color: '#14B8A6' },
  { name: 'Limited Edition', color: '#E11D48' },
  { name: 'Collectibles', color: '#7C3AED' },
  { name: 'Accessories', color: '#0891B2' },
  { name: 'Home', color: '#65A30D' },
  { name: 'Outdoor', color: '#16A34A' },
  { name: 'Sports', color: '#2563EB' },
  { name: 'Fashion', color: '#DB2777' },
  { name: 'Rare', color: '#CA8A04' },
  { name: 'Bundle', color: '#9333EA' },
  { name: 'Discount', color: '#DC2626' },
  { name: 'Best Seller', color: '#059669' },
  { name: 'Recently Added', color: '#0284C7' },
  { name: 'Second Hand', color: '#78716C' },
  { name: 'Imported', color: '#4F46E5' },
  { name: 'Local', color: '#15803D' },
];

export async function seedCategories(prisma: PrismaClient): Promise<void> {
  const sellers = await prisma.user.findMany({
    where: {
      role: Role.SELLER,
    },
    select: {
      userId: true,
      username: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  if (sellers.length === 0) {
    throw new Error('Sellers not found');
  }

  for (const seller of sellers) {
    // Random 10 - 20 categories per seller
    const categoryCount = Math.floor(Math.random() * 11) + 10;

    const shuffledCategories = [...categoryTemplates].sort(
      () => Math.random() - 0.5,
    );

    const selectedCategories = shuffledCategories.slice(0, categoryCount);

    for (const category of selectedCategories) {
      await prisma.category.create({
        data: {
          name: category.name,
          color: category.color,
          createdById: seller.userId,
        },
      });
    }
  }
}
