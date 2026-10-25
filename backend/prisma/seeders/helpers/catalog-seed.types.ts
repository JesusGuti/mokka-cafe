import type { Prisma } from '@generated/prisma/client';

// Los campos escalares se derivan de los tipos de Prisma para que el seed no se
// desincronice del schema. Las relaciones se expresan por **nombre** (no por id),
// que es lo que hace legible el seed; por eso no se usan los tipos de Prisma tal cual.

export type CategorySeed = Pick<Prisma.ProductCategoryCreateInput, 'name'>;

export type ModifierSeed = Pick<
  Prisma.ModifierUncheckedCreateInput,
  'name' | 'priceCents' | 'isActive'
>;

export type GroupSeed = Pick<
  Prisma.ModifierGroupCreateInput,
  'name' | 'isActive'
> &
  Required<Pick<Prisma.ModifierGroupCreateInput, 'minSelect' | 'maxSelect'>> & {
    modifiers: ModifierSeed[];
  };

export type PriceChangeSeed = Pick<
  Prisma.ProductPriceChangeUncheckedCreateInput,
  'oldPriceCents' | 'newPriceCents'
>;

export type ProductSeed = Pick<
  Prisma.ProductUncheckedCreateInput,
  'name' | 'description' | 'priceCents' | 'isAvailable'
> & {
  /** Nombre de la categoría. */
  category: string;
  archived?: boolean;
  /** Nombres de los grupos, en el orden en que se muestran. */
  groups?: string[];
  priceHistory?: PriceChangeSeed[];
};
