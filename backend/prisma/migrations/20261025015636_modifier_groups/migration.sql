-- Catálogo (E2.0): grupos de opciones (ver docs/features/catalogo/decisions.md, D-17).
-- Reemplaza `product_modifiers` (producto ↔ opción) por `product_modifier_groups`
-- (producto ↔ grupo) y hace que cada `modifiers` pertenezca a un grupo.
--
-- Rompedora a propósito: solo es segura con las tablas vacías (el módulo de
-- modificadores aún no existía). El bloque de abajo falla con un mensaje claro en vez de
-- perder datos o dar un error críptico de NOT NULL.
-- Los índices sobre lower(...) y los CHECK no se pueden declarar en schema.prisma,
-- por eso viven solo aquí.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "modifiers")
     OR EXISTS (SELECT 1 FROM "product_modifiers")
     OR EXISTS (SELECT 1 FROM "order_item_modifiers")
     OR EXISTS (SELECT 1 FROM "modifier_recipes") THEN
    RAISE EXCEPTION 'modifier_groups: hay datos en modifiers/product_modifiers/order_item_modifiers/modifier_recipes; hay que migrarlos a mano a grupos antes de aplicar.';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "product_modifiers" DROP CONSTRAINT "product_modifiers_modifierId_fkey";

-- DropForeignKey
ALTER TABLE "product_modifiers" DROP CONSTRAINT "product_modifiers_productId_fkey";

-- AlterTable
ALTER TABLE "modifiers" ADD COLUMN     "groupId" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "product_modifiers";

-- CreateTable
CREATE TABLE "modifier_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_modifier_groups" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier_price_changes" (
    "id" TEXT NOT NULL,
    "modifierId" TEXT NOT NULL,
    "oldPriceCents" INTEGER NOT NULL,
    "newPriceCents" INTEGER NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modifier_price_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_modifier_groups_groupId_idx" ON "product_modifier_groups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "product_modifier_groups_productId_groupId_key" ON "product_modifier_groups"("productId", "groupId");

-- CreateIndex
CREATE INDEX "modifier_price_changes_modifierId_changedAt_idx" ON "modifier_price_changes"("modifierId", "changedAt");

-- CreateIndex
CREATE INDEX "modifiers_groupId_sortOrder_idx" ON "modifiers"("groupId", "sortOrder");

-- AddForeignKey
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "modifier_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "modifier_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_price_changes" ADD CONSTRAINT "modifier_price_changes_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "modifiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_price_changes" ADD CONSTRAINT "modifier_price_changes_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex: nombre de grupo único sin distinguir mayúsculas.
CREATE UNIQUE INDEX "modifier_groups_name_lower_key" ON "modifier_groups" (lower("name"));

-- CreateIndex: nombre de opción único dentro de su grupo, sin distinguir mayúsculas.
CREATE UNIQUE INDEX "modifiers_group_name_lower_key" ON "modifiers" ("groupId", lower("name"));

-- Reglas de coherencia (la fuente de verdad es el caso de uso, esto es la red de seguridad).
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_min_select_check" CHECK ("minSelect" >= 0);
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_max_select_check"
  CHECK ("maxSelect" IS NULL OR ("maxSelect" >= 1 AND "maxSelect" >= "minSelect"));
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_price_check" CHECK ("priceCents" >= 0);
