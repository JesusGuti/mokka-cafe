import { execSync } from 'node:child_process';
import { config } from 'dotenv';
import { resolve } from 'node:path';

export default function globalSetup(): void {
  const envPath = resolve(__dirname, '../.env.test');
  config({ path: envPath, override: true });
  process.env.NODE_ENV = 'test';

  const url = process.env.DATABASE_URL ?? '';
  if (!url.includes('test')) {
    throw new Error(
      `Los tests E2E deben apuntar a una base de datos de test. DATABASE_URL actual: "${url}". ` +
        'Revisa backend/.env.test.',
    );
  }

  execSync('npx prisma migrate deploy', {
    cwd: resolve(__dirname, '..'),
    env: process.env,
    stdio: 'inherit',
  });
}
