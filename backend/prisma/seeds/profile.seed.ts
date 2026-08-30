import type { PrismaClient } from '@generated/prisma/client';
import { Role, Gender } from '@generated/prisma/client';

export async function seedProfiles(prisma: PrismaClient): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      userId: true,
      username: true,
      role: true,
    },
  });

  for (const user of users) {
    const isAdmin = user.role === Role.ADMIN;
    const number = Number(user.username.slice(-3));

    await prisma.profile.create({
      data: {
        userId: user.userId,

        fullName: isAdmin
          ? 'Administrator'
          : user.role === Role.BIDDER
            ? `Bidder ${user.username.slice(-3)}`
            : `Seller ${user.username.slice(-3)}`,

        phoneNumber: isAdmin
          ? '0900000000'
          : `09${user.username.slice(-3)}00000`,

        gender: isAdmin
          ? Gender.OTHER
          : number % 2 === 0
            ? Gender.FEMALE
            : Gender.MALE,

        bio: isAdmin
          ? 'System Administrator'
          : user.role === Role.BIDDER
            ? 'Auction bidder'
            : 'Auction seller',
      },
    });
  }
}
