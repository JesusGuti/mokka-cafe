import { randomUUID } from 'node:crypto';
import { UserRole } from '@generated/prisma/enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { authHeader } from '../utils/auth-header';
import { resetDatabase } from '../utils/reset-database';

interface CategoryBody {
  id: string;
  name: string;
  sortOrder: number;
  productCount?: number;
}

describe('Product categories (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let module: TestingModule;
  let auth: string;

  const http = () => request(app.getHttpServer());

  const createCategory = async (name: string): Promise<CategoryBody> => {
    const res = await http()
      .post('/product-categories')
      .set('Authorization', auth)
      .send({ name })
      .expect(201);
    return res.body as CategoryBody;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    // Mismas opciones que main.ts.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
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

  describe('POST /product-categories', () => {
    it('crea una categoría y la primera queda con sortOrder 0 (AC-1.1)', async () => {
      const created = await createCategory('Calientes');

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Calientes');
      expect(created.sortOrder).toBe(0);
    });

    it('una categoría nueva entra al final (AC-1.14)', async () => {
      await createCategory('Calientes');
      await createCategory('Frías');
      const third = await createCategory('Postres');

      expect(third.sortOrder).toBe(2);
    });

    it('recorta espacios del nombre', async () => {
      const created = await createCategory('  Calientes  ');

      expect(created.name).toBe('Calientes');
    });

    it('acepta un nombre de 50 caracteres aunque venga con espacios alrededor', async () => {
      const name = 'a'.repeat(50);

      const created = await createCategory(`  ${name}  `);

      expect(created.name).toBe(name);
    });

    it.each([
      ['vacío', { name: '' }],
      ['solo espacios', { name: '   ' }],
      ['de 51 caracteres', { name: 'a'.repeat(51) }],
      ['sin nombre', {}],
      ['con un tipo incorrecto', { name: 123 }],
      ['con campos no permitidos', { name: 'Calientes', sortOrder: 5 }],
    ])('rechaza un body %s con 400 (AC-1.5)', async (_label, body) => {
      await http()
        .post('/product-categories')
        .set('Authorization', auth)
        .send(body)
        .expect(400);
    });

    it('rechaza nombre duplicado con 409 y mensaje de negocio (AC-1.6)', async () => {
      await createCategory('Calientes');

      const res = await http()
        .post('/product-categories')
        .set('Authorization', auth)
        .send({ name: 'Calientes' })
        .expect(409);

      expect((res.body as { message: string }).message).toBe(
        'Ya existe una categoría con ese nombre',
      );
    });

    it('rechaza duplicado que solo difiere en mayúsculas y espacios con 409 (AC-1.6)', async () => {
      await createCategory('Calientes');

      await http()
        .post('/product-categories')
        .set('Authorization', auth)
        .send({ name: ' calientes ' })
        .expect(409);
    });

    it('responde 201 y 409 (nunca 500) ante dos requests concurrentes con el mismo nombre', async () => {
      const send = () =>
        http()
          .post('/product-categories')
          .set('Authorization', auth)
          .send({ name: 'Calientes' });

      const responses = await Promise.all([send(), send()]);

      expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
    });

    it('guarda emojis y caracteres especiales sin corromperlos (AC-1.9)', async () => {
      const created = await createCategory('Té & Café ☕');

      expect(created.name).toBe('Té & Café ☕');
    });

    it('guarda un intento de inyección como texto inerte (AC-1.10)', async () => {
      // Debe caber en los 50 caracteres permitidos para llegar a la base.
      const name = `<script>alert(1)</script> '; DROP TABLE x;--`;

      const created = await createCategory(name);

      expect(created.name).toBe(name);
      await expect(prisma.product.count()).resolves.toBe(0);
    });

    it.each([UserRole.MESERO, UserRole.CAJERO])(
      'rechaza el rol %s con 403',
      async (role) => {
        await http()
          .post('/product-categories')
          .set('Authorization', authHeader(module, { role }))
          .send({ name: 'Calientes' })
          .expect(403);
      },
    );

    it('rechaza requests sin token con 401', async () => {
      await http()
        .post('/product-categories')
        .send({ name: 'Calientes' })
        .expect(401);
    });
  });

  describe('GET /product-categories', () => {
    it('devuelve una lista vacía si no hay categorías', async () => {
      const res = await http()
        .get('/product-categories')
        .set('Authorization', auth)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('lista por sortOrder con la cantidad de productos de cada una (AC-1.4)', async () => {
      const hot = await createCategory('Calientes');
      const cold = await createCategory('Frías');
      await prisma.product.createMany({
        data: [
          { name: 'Espresso', priceCents: 1000, categoryId: hot.id },
          { name: 'Latte', priceCents: 1500, categoryId: hot.id },
        ],
      });

      const res = await http()
        .get('/product-categories')
        .set('Authorization', auth)
        .expect(200);

      const body = res.body as CategoryBody[];
      expect(body.map((c) => [c.name, c.productCount])).toEqual([
        ['Calientes', 2],
        ['Frías', 0],
      ]);
      expect(body[1].id).toBe(cold.id);
    });

    it.each([UserRole.MESERO, UserRole.CAJERO])(
      'rechaza el rol %s con 403',
      async (role) => {
        await http()
          .get('/product-categories')
          .set('Authorization', authHeader(module, { role }))
          .expect(403);
      },
    );

    it('rechaza requests sin token con 401', async () => {
      await http().get('/product-categories').expect(401);
    });
  });

  describe('PATCH /product-categories/:id', () => {
    it('renombra la categoría, conserva su orden y sus productos (AC-1.2)', async () => {
      await createCategory('Calientes');
      const cold = await createCategory('Frías');
      await prisma.product.create({
        data: { name: 'Frappé', priceCents: 2000, categoryId: cold.id },
      });

      const res = await http()
        .patch(`/product-categories/${cold.id}`)
        .set('Authorization', auth)
        .send({ name: '  Heladas ' })
        .expect(200);

      const body = res.body as CategoryBody;
      expect(body.name).toBe('Heladas');
      expect(body.sortOrder).toBe(1);
      await expect(
        prisma.product.count({ where: { categoryId: cold.id } }),
      ).resolves.toBe(1);
    });

    it('permite cambiar solo las mayúsculas del propio nombre', async () => {
      const created = await createCategory('calientes');

      await http()
        .patch(`/product-categories/${created.id}`)
        .set('Authorization', auth)
        .send({ name: 'Calientes' })
        .expect(200);
    });

    it('rechaza un nombre que usa otra categoría con 409 (AC-1.6)', async () => {
      await createCategory('Calientes');
      const cold = await createCategory('Frías');

      await http()
        .patch(`/product-categories/${cold.id}`)
        .set('Authorization', auth)
        .send({ name: 'CALIENTES' })
        .expect(409);
    });

    it('responde 404 "Esta categoría ya no existe" si fue eliminada (AC-1.8)', async () => {
      const res = await http()
        .patch(`/product-categories/${randomUUID()}`)
        .set('Authorization', auth)
        .send({ name: 'Frías' })
        .expect(404);

      expect((res.body as { message: string }).message).toBe(
        'Esta categoría ya no existe',
      );
    });

    it('responde 400 si el id no es un UUID', async () => {
      await http()
        .patch('/product-categories/no-es-un-uuid')
        .set('Authorization', auth)
        .send({ name: 'Frías' })
        .expect(400);
    });

    it('rechaza un body inválido con 400 y un id en el body', async () => {
      const created = await createCategory('Calientes');

      await http()
        .patch(`/product-categories/${created.id}`)
        .set('Authorization', auth)
        .send({ name: '' })
        .expect(400);

      await http()
        .patch(`/product-categories/${created.id}`)
        .set('Authorization', auth)
        .send({ id: randomUUID(), name: 'Frías' })
        .expect(400);
    });

    it('rechaza un rol que no sea ADMIN con 403', async () => {
      const created = await createCategory('Calientes');

      await http()
        .patch(`/product-categories/${created.id}`)
        .set('Authorization', authHeader(module, { role: UserRole.MESERO }))
        .send({ name: 'Frías' })
        .expect(403);
    });
  });

  describe('DELETE /product-categories/:id', () => {
    it('elimina una categoría sin productos (AC-1.3)', async () => {
      const created = await createCategory('Calientes');

      await http()
        .delete(`/product-categories/${created.id}`)
        .set('Authorization', auth)
        .expect(204);

      await expect(prisma.productCategory.count()).resolves.toBe(0);
    });

    it('bloquea con 409 y la cantidad si tiene productos, sin borrar nada (AC-1.7)', async () => {
      const hot = await createCategory('Calientes');
      await prisma.product.createMany({
        data: [
          { name: 'Espresso', priceCents: 1000, categoryId: hot.id },
          { name: 'Latte', priceCents: 1500, categoryId: hot.id },
        ],
      });

      const res = await http()
        .delete(`/product-categories/${hot.id}`)
        .set('Authorization', auth)
        .expect(409);

      expect((res.body as { message: string }).message).toBe(
        'Tiene 2 productos. Muévelos o archívalos primero',
      );
      await expect(prisma.productCategory.count()).resolves.toBe(1);
      await expect(prisma.product.count()).resolves.toBe(2);
    });

    it('cuenta también los productos archivados', async () => {
      const hot = await createCategory('Calientes');
      await prisma.product.create({
        data: {
          name: 'Espresso',
          priceCents: 1000,
          categoryId: hot.id,
          archivedAt: new Date(),
        },
      });

      await http()
        .delete(`/product-categories/${hot.id}`)
        .set('Authorization', auth)
        .expect(409);
    });

    it('responde 404 si la categoría no existe', async () => {
      await http()
        .delete(`/product-categories/${randomUUID()}`)
        .set('Authorization', auth)
        .expect(404);
    });

    it('responde 400 si el id no es un UUID', async () => {
      await http()
        .delete('/product-categories/no-es-un-uuid')
        .set('Authorization', auth)
        .expect(400);
    });

    it('rechaza un rol que no sea ADMIN con 403', async () => {
      const created = await createCategory('Calientes');

      await http()
        .delete(`/product-categories/${created.id}`)
        .set('Authorization', authHeader(module, { role: UserRole.CAJERO }))
        .expect(403);
    });
  });
});
