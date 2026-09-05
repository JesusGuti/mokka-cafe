import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Pool } from 'pg';

/**
 * Trunca todas las tablas de la base de test. Pensado para correr antes de
 * levantar el backend para los e2e de Playwright del frontend (que no pasan
 * por Jest, así que no tienen el globalSetup/reset-database.ts de
 * backend/test/). Misma guarda que ese archivo: nunca debe poder apuntar a
 * la base de desarrollo por accidente. Carga `.env.test` explícito (no el
 * `.env` de desarrollo) sin importar qué NODE_ENV traiga el proceso llamante.
 */
async function main() {
  config({ path: resolve(__dirname, '../.env.test'), override: true });

  const url = process.env.DATABASE_URL ?? '';
  if (!url.includes('test')) {
    throw new Error(
      `db:test:reset debe apuntar a una base de datos de test. DATABASE_URL actual: "${url}". ` +
        'Corré este script con NODE_ENV=test (ver backend/.env.test).',
    );
  }

  const pool = new Pool({ connectionString: url });

  try {
    const { rows } = await pool.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';`,
    );

    if (rows.length === 0) return;

    const tableNames = rows.map((r) => `"public"."${r.tablename}"`).join(', ');
    await pool.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
    console.log(`✅ Base de test reseteada (${rows.length} tablas).`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('❌ No se pudo resetear la base de test:', error);
  process.exit(1);
});
