import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { UserRole } from '@generated/prisma/enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import { resetDatabase } from '../utils/reset-database';
import { authHeader } from '../utils/auth-header';
import request from 'supertest';
import type { App } from 'supertest/types';

interface UserResponseBody {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  passwordHash?: string;
}

type UserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const VALID_PAYLOAD: UserPayload = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  role: UserRole.MESERO,
};

const createUserPayload = (payload: Partial<UserPayload> = {}) => ({
  ...VALID_PAYLOAD,
  ...payload,
});

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let auth: string;

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
    auth = authHeader(moduleFixture);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST users', () => {
    it('crea un usuario y lo puede recuperar por id', async () => {
      const userPayload = createUserPayload();

      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(201);

      const createdUser = createRes.body as UserResponseBody;

      expect(createdUser.id).toBeDefined();

      await request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .set('Authorization', auth)
        .expect(200)
        .expect((res) => {
          expect((res.body as UserResponseBody).name).toBe(userPayload.name);
        });
    });

    it('no expone passwordHash en la respuesta', async () => {
      const userPayload = createUserPayload();

      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(201);

      expect(createRes.body).not.toHaveProperty('passwordHash');

      const createdUser = createRes.body as UserResponseBody;

      await request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .set('Authorization', auth)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('crea el usuario activo por defecto y con el rol enviado', async () => {
      const userPayload = createUserPayload({ role: UserRole.ADMIN });

      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(201);

      const createdUser = createRes.body as UserResponseBody;

      expect(createdUser.isActive).toBe(true);
      expect(createdUser.role).toBe(UserRole.ADMIN);
    });

    it('rechaza payloads invalidos con 400', async () => {
      const invalidNamePayload = createUserPayload({ name: 'a' });
      const invalidEmailPayload = createUserPayload({ email: 'a.com' });
      const invalidPasswordPayload = createUserPayload({ password: 'abc' });
      const invalidRolePayload = createUserPayload({ role: undefined });

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(invalidNamePayload)
        .expect(400);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(invalidEmailPayload)
        .expect(400);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(invalidPasswordPayload)
        .expect(400);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(invalidRolePayload)
        .expect(400);
    });

    it('rechaza un rol fuera del enum con 400', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send({ ...createUserPayload(), role: 'GERENTE' })
        .expect(400);
    });

    it('rechaza email repetido con 409', async () => {
      const userPayload = createUserPayload({ email: 'prueba@gmail.com' });

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(409);
    });

    it('rechaza email repetido con distinto casing con 409', async () => {
      const userPayload = createUserPayload({ email: 'Prueba@Gmail.com' });

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(userPayload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(createUserPayload({ email: 'prueba@gmail.com' }))
        .expect(409);
    });
  });

  describe('/GET users', () => {
    it('lista los usuarios creados', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', auth)
        .send(createUserPayload())
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', auth)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  describe('/GET users/:id', () => {
    it('devuelve 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .get(`/users/${randomUUID()}`)
        .set('Authorization', auth)
        .expect(404);
    });
  });

  it('rechaza requests sin token con 401', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });
});
