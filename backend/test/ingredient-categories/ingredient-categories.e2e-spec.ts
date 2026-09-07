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

interface IngredientCategoryResponseBody {
  id: string;
  name: string;
}

type IngredientCategoryPayload = {
  name: string;
};

const createIngredientCategoryPayload = (
  payload: Partial<IngredientCategoryPayload> = {},
): IngredientCategoryPayload => ({
  name: faker.commerce.department() + randomUUID(),
  ...payload,
});

describe('Ingredient categories (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let module: TestingModule;
  let auth: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = module.get(PrismaService);
    auth = authHeader(module);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST ingredient-categories', () => {
    it('crea una categoría y la puede recuperar por id', async () => {
      const payload = createIngredientCategoryPayload();

      const createRes = await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send(payload)
        .expect(201);

      const created = createRes.body as IngredientCategoryResponseBody;

      expect(created.id).toBeDefined();
      expect(created.name).toBe(payload.name);

      await request(app.getHttpServer())
        .get(`/ingredient-categories/${created.id}`)
        .set('Authorization', auth)
        .expect(200)
        .expect((res) => {
          expect((res.body as IngredientCategoryResponseBody).name).toBe(
            payload.name,
          );
        });
    });

    it('rechaza payloads inválidos con 400', async () => {
      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send({ name: 'a' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send({})
        .expect(400);
    });

    it('rechaza nombre repetido con 409', async () => {
      const payload = createIngredientCategoryPayload({ name: 'Lácteos' });

      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send(payload)
        .expect(409);
    });

    it('rechaza la creación de un rol que no sea ADMIN con 403', async () => {
      const nonAdminAuth = authHeader(module, { role: UserRole.MESERO });

      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', nonAdminAuth)
        .send(createIngredientCategoryPayload())
        .expect(403);
    });

    it('rechaza requests sin token con 401', async () => {
      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .send(createIngredientCategoryPayload())
        .expect(401);
    });
  });

  describe('/GET ingredient-categories', () => {
    it('lista las categorías creadas', async () => {
      await request(app.getHttpServer())
        .post('/ingredient-categories')
        .set('Authorization', auth)
        .send(createIngredientCategoryPayload())
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/ingredient-categories')
        .set('Authorization', auth)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    it('permite listar a un usuario autenticado que no sea ADMIN', async () => {
      const nonAdminAuth = authHeader(module, { role: UserRole.CAJERO });

      await request(app.getHttpServer())
        .get('/ingredient-categories')
        .set('Authorization', nonAdminAuth)
        .expect(200);
    });

    it('rechaza requests sin token con 401', async () => {
      await request(app.getHttpServer())
        .get('/ingredient-categories')
        .expect(401);
    });
  });

  describe('/GET ingredient-categories/:id', () => {
    it('devuelve 404 si la categoría no existe', async () => {
      await request(app.getHttpServer())
        .get(`/ingredient-categories/${randomUUID()}`)
        .set('Authorization', auth)
        .expect(404);
    });
  });
});
