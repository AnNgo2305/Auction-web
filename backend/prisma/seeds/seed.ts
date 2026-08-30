import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';
import { seedUsers } from './user.seed';
import { seedProfiles } from './profile.seed';
import { seedAddresses } from './address.seed';
import { seedFollows } from './follow.seed';
import { seedCategories } from './product-category.seed';

const mySQLAdapter = new PrismaMariaDb({
  host: process.env.MYSQL_DB_HOST,
  port: Number(process.env.MYSQL_DB_PORT),
  user: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_DATABASE_NAME,
  connectionLimit: 10,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  idleTimeout: 60000,
});

const prisma = new PrismaClient({
  adapter: mySQLAdapter,
  errorFormat: 'pretty',
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  },
});

async function main() {
  console.log('🌱 Starting database seed...\n');

  await seedUsers(prisma);
  await seedProfiles(prisma);
  await seedAddresses(prisma);
  await seedFollows(prisma);
  await seedCategories(prisma);


  console.log('\n🌱 Database seed completed!');
}

main()
  .catch((error) => {
    console.error('❌ Database seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
