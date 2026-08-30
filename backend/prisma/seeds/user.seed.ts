import * as bcrypt from 'bcrypt';
import type { PrismaClient } from '@generated/prisma/client';
import { Role } from '@generated/prisma/enums';

const DEFAULT_PASSWORD = 'An23052004@';

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  for (let i = 1; i <= 100; i++) {
    const number = i.toString().padStart(3, '0');

    await prisma.user.create({
      data: {
        email: `bidder${number}@example.com`,
        username: `bidder${number}`,
        password: hashedPassword,
        role: Role.BIDDER,
        isVerified: true,
      },
    });
  }

  for (let i = 1; i <= 100; i++) {
    const number = i.toString().padStart(3, '0');

    await prisma.user.create({
      data: {
        email: `seller${number}@example.com`,
        username: `seller${number}`,
        password: hashedPassword,
        role: Role.SELLER,
        isVerified: true,
      },
    });
  }
}
