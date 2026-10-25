import { Prisma, PrismaClient } from '@generated/prisma/client';
import {
  CategorySeed,
  GroupSeed,
  ProductSeed,
} from './helpers/catalog-seed.types';

// Precios en centavos de boliviano (Bs): 1200 = Bs 12,00.
//
// El set cubre a propósito los casos de borde de docs/features/catalogo/test-plan.md:
// una categoría sin productos visibles, un nombre de 80 caracteres, un producto sin
// descripción, uno agotado, uno archivado, precios "no redondos", un grupo inactivo,
// una opción inactiva y una opción gratuita.

const LONG_NAME =
  'Latte especial de temporada con canela, vainilla y espuma de leche de almendras.';

const categories: CategorySeed[] = [
  { name: 'Calientes' },
  { name: 'Fríos' },
  { name: 'Postres' },
  // Su único producto está archivado: el POS no debe mostrarla.
  { name: 'Snacks' },
];

const groups: GroupSeed[] = [
  {
    name: 'Tamaño',
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { name: 'Chico', priceCents: 0 },
      { name: 'Mediano', priceCents: 200 },
      { name: 'Grande', priceCents: 400 },
    ],
  },
  {
    name: 'Leche',
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { name: 'Entera', priceCents: 0 },
      { name: 'Deslactosada', priceCents: 0 },
      { name: 'Avena', priceCents: 300 },
    ],
  },
  {
    name: 'Extras',
    minSelect: 0,
    maxSelect: null,
    modifiers: [
      { name: 'Extra shot', priceCents: 300 },
      { name: 'Crema batida', priceCents: 200 },
      { name: 'Sirope de vainilla', priceCents: 0 },
      { name: 'Sirope de caramelo', priceCents: 150, isActive: false },
    ],
  },
  // Grupo inactivo asociado a un producto: no debe aparecer en el menú.
  {
    name: 'Promo de verano',
    minSelect: 0,
    maxSelect: 1,
    isActive: false,
    modifiers: [{ name: 'Combo con postre', priceCents: 800 }],
  },
];

const products: ProductSeed[] = [
  // Calientes
  {
    category: 'Calientes',
    name: 'Espresso',
    description: 'Cuerpo intenso y crema dorada',
    priceCents: 1200,
  },
  {
    category: 'Calientes',
    name: 'Americano',
    description: 'Espresso largo, suave y limpio',
    priceCents: 1400,
    groups: ['Tamaño', 'Extras'],
  },
  {
    category: 'Calientes',
    name: 'Capuchino',
    description: 'Espuma densa de leche',
    priceCents: 1800,
    groups: ['Tamaño', 'Extras'],
  },
  {
    category: 'Calientes',
    name: 'Latte',
    description: 'Suave y cremoso',
    priceCents: 2000,
    groups: ['Tamaño', 'Leche', 'Extras'],
    priceHistory: [{ oldPriceCents: 1900, newPriceCents: 2000 }],
  },
  {
    category: 'Calientes',
    name: 'Mocca',
    description: 'Café con chocolate y leche vaporizada',
    priceCents: 2200,
    groups: ['Tamaño', 'Leche', 'Extras', 'Promo de verano'],
  },
  {
    category: 'Calientes',
    name: 'Chocolate caliente',
    description: 'Chocolate boliviano con leche',
    priceCents: 1850,
    groups: ['Tamaño'],
  },
  { category: 'Calientes', name: 'Té de hierbas', priceCents: 1000 },
  {
    category: 'Calientes',
    name: LONG_NAME,
    description: 'Disponible por tiempo limitado',
    priceCents: 2500,
    groups: ['Tamaño', 'Leche', 'Extras'],
  },
  // Fríos
  {
    category: 'Fríos',
    name: 'Cold Brew',
    description: 'Extracción en frío por 12 horas',
    priceCents: 1950,
    groups: ['Tamaño'],
  },
  {
    category: 'Fríos',
    name: 'Iced Latte',
    description: 'Con hielo y un shot extra',
    priceCents: 2100,
    groups: ['Extras'],
  },
  {
    category: 'Fríos',
    name: 'Frappé de caramelo',
    description: 'Cremoso, con salsa de caramelo',
    priceCents: 2450,
    groups: ['Tamaño', 'Extras'],
  },
  {
    category: 'Fríos',
    name: 'Limonada con menta',
    description: 'Refrescante, con hielo',
    priceCents: 1500,
    groups: ['Tamaño'],
  },
  {
    category: 'Fríos',
    name: 'Smoothie de frutilla',
    description: 'Frutilla, plátano y yogur',
    priceCents: 2300,
    // Agotado hoy: debe verse como "Agotado" en el POS.
    isAvailable: false,
  },
  // Postres
  {
    category: 'Postres',
    name: 'Brownie',
    description: 'Chocolate intenso con nueces',
    priceCents: 1500,
    groups: ['Extras'],
  },
  {
    category: 'Postres',
    name: 'Cheesecake de maracuyá',
    description: 'Base de galleta y cobertura de maracuyá',
    priceCents: 2200,
  },
  {
    category: 'Postres',
    name: 'Torta de zanahoria',
    description: 'Con frosting de queso crema',
    priceCents: 1999,
  },
  {
    category: 'Postres',
    name: 'Galleta de avena',
    priceCents: 800,
  },
  {
    category: 'Postres',
    name: 'Alfajor artesanal',
    description: 'Relleno de dulce de leche',
    priceCents: 650,
  },
  // Snacks (solo archivado)
  {
    category: 'Snacks',
    name: 'Sándwich de pollo',
    description: 'Ya no se ofrece',
    priceCents: 2800,
    archived: true,
  },
];

type IdByKey = Map<string, string>;

// Los índices únicos de nombre son sobre lower(name), así que se compara igual.
const nameKey = (name: string) => name.toLowerCase();
const scopedKey = (scopeId: string, name: string) =>
  `${scopeId}:${nameKey(name)}`;

async function getAdminUser(prisma: PrismaClient) {
  const adminEmail = 'admin@mokka.local';
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new Error(
      `seedCatalog necesita al usuario ${adminEmail}; corre seedUsers primero.`,
    );
  }

  return admin;
}

// Patrón de las funciones de abajo (idempotente y sin `await` en bucles): leer lo que
// ya existe, calcular en memoria lo que falta y escribirlo en un solo lote. No se usa
// `upsert` por nombre porque la unicidad es por índice sobre lower(name), no por @unique.

async function seedCategories(prisma: PrismaClient): Promise<IdByKey> {
  const existing = await prisma.productCategory.findMany({
    select: { id: true, name: true },
  });
  const known = new Set(existing.map((c) => nameKey(c.name)));

  const created = await prisma.productCategory.createManyAndReturn({
    data: categories
      .map((seed, sortOrder) => ({ name: seed.name, sortOrder }))
      .filter((category) => !known.has(nameKey(category.name))),
    select: { id: true, name: true },
  });

  return new Map([...existing, ...created].map((c) => [nameKey(c.name), c.id]));
}

async function seedGroups(prisma: PrismaClient): Promise<IdByKey> {
  const existing = await prisma.modifierGroup.findMany({
    select: { id: true, name: true },
  });
  const known = new Set(existing.map((g) => nameKey(g.name)));

  const created = await prisma.modifierGroup.createManyAndReturn({
    data: groups
      .map((seed, sortOrder) => ({
        name: seed.name,
        minSelect: seed.minSelect,
        maxSelect: seed.maxSelect,
        isActive: seed.isActive ?? true,
        sortOrder,
      }))
      .filter((group) => !known.has(nameKey(group.name))),
    select: { id: true, name: true },
  });

  return new Map([...existing, ...created].map((g) => [nameKey(g.name), g.id]));
}

async function seedModifiers(prisma: PrismaClient, groupIds: IdByKey) {
  const existing = await prisma.modifier.findMany({
    select: { groupId: true, name: true },
  });
  const known = new Set(existing.map((m) => scopedKey(m.groupId, m.name)));

  const data: Prisma.ModifierCreateManyInput[] = groups.flatMap((group) => {
    const groupId = groupIds.get(nameKey(group.name));
    if (!groupId) {
      throw new Error(`Grupo inexistente en el seed: ${group.name}`);
    }
    return group.modifiers.map((modifier, sortOrder) => ({
      groupId,
      name: modifier.name,
      priceCents: modifier.priceCents,
      isActive: modifier.isActive ?? true,
      sortOrder,
    }));
  });

  await prisma.modifier.createMany({
    data: data.filter((m) => !known.has(scopedKey(m.groupId, m.name))),
  });
}

interface ProductEntry {
  seed: ProductSeed;
  categoryId: string;
  sortOrder: number;
}

function toProductEntries(categoryIds: IdByKey): ProductEntry[] {
  const countPerCategory = new Map<string, number>();

  return products.map((seed) => {
    const categoryId = categoryIds.get(nameKey(seed.category));
    if (!categoryId) {
      throw new Error(`Categoría inexistente en el seed: ${seed.category}`);
    }
    const sortOrder = countPerCategory.get(categoryId) ?? 0;
    countPerCategory.set(categoryId, sortOrder + 1);
    return { seed, categoryId, sortOrder };
  });
}

function toProductData(
  { seed, categoryId, sortOrder }: ProductEntry,
  adminId: string,
): Prisma.ProductCreateManyInput {
  const isAvailable = seed.isAvailable ?? true;
  return {
    name: seed.name,
    description: seed.description ?? null,
    priceCents: seed.priceCents,
    categoryId,
    isAvailable,
    sortOrder,
    archivedAt: seed.archived ? new Date() : null,
    // Un producto agotado deja constancia de quién y cuándo lo marcó.
    availabilityChangedById: isAvailable ? null : adminId,
    availabilityChangedAt: isAvailable ? null : new Date(),
  };
}

async function seedProducts(
  prisma: PrismaClient,
  categoryIds: IdByKey,
  groupIds: IdByKey,
  adminId: string,
) {
  const entries = toProductEntries(categoryIds);

  const existing = await prisma.product.findMany({
    select: { id: true, categoryId: true, name: true },
  });
  const known = new Set(existing.map((p) => scopedKey(p.categoryId, p.name)));

  // No se confía en el índice único para saltar duplicados: es parcial
  // (solo productos activos), así que un archivado se duplicaría al re-sembrar.
  const missing = entries.filter(
    ({ seed, categoryId }) => !known.has(scopedKey(categoryId, seed.name)),
  );

  const created = await prisma.product.createManyAndReturn({
    data: missing.map((entry) => toProductData(entry, adminId)),
    select: { id: true, categoryId: true, name: true },
  });

  const productIds: IdByKey = new Map(
    [...existing, ...created].map((p) => [
      scopedKey(p.categoryId, p.name),
      p.id,
    ]),
  );
  const createdKeys = new Set(
    created.map((p) => scopedKey(p.categoryId, p.name)),
  );

  const productIdOf = ({ seed, categoryId }: ProductEntry): string => {
    const id = productIds.get(scopedKey(categoryId, seed.name));
    if (!id) {
      throw new Error(`Producto sin id tras sembrar: ${seed.name}`);
    }
    return id;
  };

  // Solo los productos recién creados reciben historial de precios.
  await prisma.productPriceChange.createMany({
    data: entries
      .filter(({ seed, categoryId }) =>
        createdKeys.has(scopedKey(categoryId, seed.name)),
      )
      .flatMap((entry) =>
        (entry.seed.priceHistory ?? []).map((change) => ({
          productId: productIdOf(entry),
          oldPriceCents: change.oldPriceCents,
          newPriceCents: change.newPriceCents,
          changedById: adminId,
        })),
      ),
  });

  // Las asociaciones se reintentan para todos; el único (productId, groupId) evita duplicados.
  await prisma.productModifierGroup.createMany({
    data: entries.flatMap((entry) =>
      (entry.seed.groups ?? []).map((groupName, sortOrder) => {
        const groupId = groupIds.get(nameKey(groupName));
        if (!groupId) {
          throw new Error(`Grupo inexistente en el seed: ${groupName}`);
        }
        return { productId: productIdOf(entry), groupId, sortOrder };
      }),
    ),
    skipDuplicates: true,
  });

  return created.length;
}

export async function seedCatalog(prisma: PrismaClient) {
  console.log('🌱 Seeding catalog...');

  if (LONG_NAME.length !== 80) {
    throw new Error(
      `LONG_NAME debe tener 80 caracteres, tiene ${LONG_NAME.length}.`,
    );
  }

  const admin = await getAdminUser(prisma);
  const categoryIds = await seedCategories(prisma);
  const groupIds = await seedGroups(prisma);
  await seedModifiers(prisma, groupIds);
  const createdProducts = await seedProducts(
    prisma,
    categoryIds,
    groupIds,
    admin.id,
  );

  console.log(
    `✅ Catalog ready: ${categories.length} categories, ${groups.length} groups, ${createdProducts} products created.`,
  );
}
