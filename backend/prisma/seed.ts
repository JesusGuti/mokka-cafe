import 'dotenv/config';
import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './seeders/users.seeder';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding of the database...\n');

  try {
    await seedUsers(prisma);

    console.log('\n:✅ Seeding completed...');
  } catch (error: unknown) {
    console.error('❌ Seeding failed...: ', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
