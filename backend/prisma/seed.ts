import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './seeders/users.seeder';

// `dotenv/config` solo carga `.env` (desarrollo). Para poder sembrar la
// base de test (usada por los e2e de Playwright) explícitamente con
// `NODE_ENV=test`, cargamos `.env.test` en ese caso — mismo criterio que
// `scripts/reset-test-db.ts` y `test/jest-e2e.global-setup.ts`.
config({
  path: resolve(
    __dirname,
    process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
  ),
});

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
