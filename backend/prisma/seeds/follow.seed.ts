import type { PrismaClient } from '@generated/prisma/client';
import { FollowStatus, Role } from '@generated/prisma/enums';

export async function seedFollows(prisma: PrismaClient): Promise<void> {
  const bidders = await prisma.user.findMany({
    where: {
      role: Role.BIDDER,
    },
    select: {
      userId: true,
      username: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

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

  if (bidders.length === 0 || sellers.length === 0) {
    throw new Error('Bidders or sellers not found');
  }

  const followsPerBidder = 80;

  const statusPool: FollowStatus[] = [
    ...Array(40).fill(FollowStatus.ACTIVE),
    ...Array(16).fill(FollowStatus.PENDING),
    ...Array(16).fill(FollowStatus.BLOCKED),
    ...Array(4).fill(FollowStatus.INACTIVE),
    ...Array(4).fill(FollowStatus.DECLINED),
  ];

  for (let i = 0; i < bidders.length; i++) {
    const bidder = bidders[i];

    for (let j = 0; j < followsPerBidder; j++) {
      const sellerIndex = (i * followsPerBidder + j) % sellers.length;
      const seller = sellers[sellerIndex];

      await prisma.follow.create({
        data: {
          followerId: bidder.userId,
          sellerId: seller.userId,
          status: statusPool[j],
        },
      });
    }
  }
}
