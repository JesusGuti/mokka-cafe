import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { resetDatabase } from '../utils/reset-database';

interface ProductResponseBody {
  id: string;
  name: string;
}

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

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
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('crea un producto y lo puede recuperar por id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Cappuccino', priceCents: 3200, category: 'bebidas' })
      .expect(201);
    const created = createRes.body as ProductResponseBody;

    expect(created.id).toBeDefined();

    await request(app.getHttpServer())
      .get(`/products/${created.id}`)
      .expect(200)
      .expect((res) => {
        expect((res.body as ProductResponseBody).name).toBe('Cappuccino');
      });
  });

  it('lista productos creados', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Latte', priceCents: 3000, category: 'bebidas' })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body).toHaveLength(1);
  });

  it('devuelve 404 si el producto no existe', async () => {
    await request(app.getHttpServer())
      .get('/products/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('rechaza payloads inválidos con 400', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'x', priceCents: -5 })
      .expect(400);
  });
});
