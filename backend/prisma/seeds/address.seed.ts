import type { PrismaClient } from '@generated/prisma/client';
import { AddressType } from '@generated/prisma/enums';

export async function seedAddresses(prisma: PrismaClient): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      userId: true,
      username: true,
    },
  });

  for (const user of users) {
    await prisma.address.create({
      data: {
        userId: user.userId,
        streetAddress: `123 ${user.username} Street`,
        city: 'Ha Noi',
        state: 'Ha Noi',
        postalCode: '100000',
        country: 'Vietnam',
        addressType: AddressType.Home,
      },
    });

    await prisma.address.create({
      data: {
        userId: user.userId,
        streetAddress: `456 ${user.username} Avenue`,
        city: 'Ha Noi',
        state: 'Ha Noi',
        postalCode: '100000',
        country: 'Vietnam',
        addressType: AddressType.Work,
      },
    });

    await prisma.address.create({
      data: {
        userId: user.userId,
        streetAddress: `789 ${user.username} Road`,
        city: 'Ha Noi',
        state: 'Ha Noi',
        postalCode: '100000',
        country: 'Vietnam',
        addressType: AddressType.Others,
      },
    });
  }
}
