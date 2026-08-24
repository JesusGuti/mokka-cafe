import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { UserRole } from '@generated/prisma/enums';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import { resetDatabase } from '../utils/reset-database';

interface SignInResponseBody {
  accessToken: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let passwordHasher: PasswordHasher;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    passwordHasher = moduleFixture.get(PasswordHasher);
  });

  afterAll(async () => {
    await app.close();
  });

  const email = 'john.doe@example.com';
  const password = 'supersecret';

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: 'John Doe',
        email,
        passwordHash: await passwordHasher.hash(password),
        role: UserRole.ADMIN,
      },
    });
  });

  it('inicia sesión con credenciales correctas y persiste el último login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password })
      .expect(200);

    const body = res.body as SignInResponseBody;
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.lastLoginAt).not.toBeNull();
  });

  it('rechaza credenciales incorrectas con 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('rechaza payloads inválidos con 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);
  });
});
