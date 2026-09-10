import { randomUUID } from 'node:crypto';
import { UserRole } from '@generated/prisma/enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import { resetDatabase } from '../utils/reset-database';
import { authHeader } from '../utils/auth-header';
import request from 'supertest';
import type { App } from 'supertest/types';

interface IngredientResponseBody {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
  currentStockQty: number;
  minStockThreshold: number | null;
}

type IngredientPayload = {
  name: string;
  unit: string;
  categoryId: string;
  minStockThreshold?: number;
};

describe('Ingredients (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let module: TestingModule;
  let auth: string;
  let categoryId: string;

  const createIngredientPayload = (
    payload: Partial<IngredientPayload> = {},
  ): IngredientPayload => ({
    name: `Ingrediente ${randomUUID()}`,
    unit: 'Kilo',
    categoryId,
    ...payload,
  });

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

    const category = await prisma.ingredientCategory.create({
      data: { id: randomUUID(), name: `Categoria ${randomUUID()}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST ingredients', () => {
    it('crea un ingrediente y lo puede recuperar por id', async () => {
      const payload = createIngredientPayload({ minStockThreshold: 5 });

      const createRes = await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(payload)
        .expect(201);

      const created = createRes.body as IngredientResponseBody;

      // Body plano esperado por IngredientResponseDto — no la entidad de
      // dominio cruda (que serializaría como { props: {...} }).
      expect(created).not.toHaveProperty('props');
      expect(created.id).toBeDefined();
      expect(created.name).toBe(payload.name);
      expect(created.unit).toBe(payload.unit);
      expect(created.categoryId).toBe(categoryId);
      expect(created.currentStockQty).toBe(0);
      expect(created.minStockThreshold).toBe(5);

      await request(app.getHttpServer())
        .get(`/ingredients/${created.id}`)
        .set('Authorization', auth)
        .expect(200)
        .expect((res) => {
          expect((res.body as IngredientResponseBody).name).toBe(payload.name);
        });
    });

    it('crea un ingrediente sin minStockThreshold y lo persiste como null', async () => {
      const payload = createIngredientPayload();
      delete payload.minStockThreshold;

      const createRes = await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(payload)
        .expect(201);

      expect(
        (createRes.body as IngredientResponseBody).minStockThreshold,
      ).toBeNull();
    });

    it('rechaza payloads inválidos con 400', async () => {
      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(createIngredientPayload({ name: 'a' }))
        .expect(400);

      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(createIngredientPayload({ categoryId: 'no-es-un-uuid' }))
        .expect(400);

      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(createIngredientPayload({ minStockThreshold: -1 }))
        .expect(400);
    });

    it('rechaza una categoría inexistente con 404', async () => {
      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(createIngredientPayload({ categoryId: randomUUID() }))
        .expect(404);
    });

    it('rechaza nombre repetido con 409', async () => {
      const payload = createIngredientPayload({ name: 'Café en grano' });

      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(payload)
        .expect(409);
    });

    it('rechaza la creación de un rol que no sea ADMIN con 403', async () => {
      const nonAdminAuth = authHeader(module, { role: UserRole.MESERO });

      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', nonAdminAuth)
        .send(createIngredientPayload())
        .expect(403);
    });

    it('rechaza requests sin token con 401', async () => {
      await request(app.getHttpServer())
        .post('/ingredients')
        .send(createIngredientPayload())
        .expect(401);
    });
  });

  describe('/GET ingredients', () => {
    it('lista los ingredientes creados', async () => {
      await request(app.getHttpServer())
        .post('/ingredients')
        .set('Authorization', auth)
        .send(createIngredientPayload())
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/ingredients')
        .set('Authorization', auth)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  describe('/GET ingredients/:id', () => {
    it('devuelve 404 si el ingrediente no existe', async () => {
      await request(app.getHttpServer())
        .get(`/ingredients/${randomUUID()}`)
        .set('Authorization', auth)
        .expect(404);
    });
  });
});
