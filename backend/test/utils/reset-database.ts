import type { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

/**
 * Trunca todas las tablas de la BD de test entre cada caso, para que
 * los tests E2E sean independientes entre sí. Nunca debe apuntar a la BD real:
 * el globalSetup de jest-e2e falla rápido si DATABASE_URL no es la de test.
 */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
  `;

  if (tables.length === 0) return;

  const tableNames = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
  );
}
