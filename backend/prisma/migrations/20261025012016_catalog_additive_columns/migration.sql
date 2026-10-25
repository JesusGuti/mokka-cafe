-- Catálogo (E2.0): columnas aditivas y unicidad de nombres.
-- Los índices sobre expresiones (lower(...)) y parciales no se pueden declarar en
-- schema.prisma, por eso viven solo aquí. Si ya existen nombres duplicados que solo
-- difieren en mayúsculas, los CREATE UNIQUE INDEX fallan y la migración completa se
-- revierte: hay que renombrarlos antes de migrar.

-- DropIndex
DROP INDEX "product_categories_name_key";

-- AlterTable
ALTER TABLE "product_categories" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "archivedAt" TIMESTAMPTZ(3),
ADD COLUMN     "availabilityChangedAt" TIMESTAMPTZ(3),
ADD COLUMN     "availabilityChangedById" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_availabilityChangedById_fkey" FOREIGN KEY ("availabilityChangedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex: nombre de categoría único sin distinguir mayúsculas ("Calientes" == "calientes").
CREATE UNIQUE INDEX "product_categories_name_lower_key" ON "product_categories" (lower("name"));

-- CreateIndex: nombre de producto único por categoría entre productos activos
-- (los archivados no bloquean el nombre; restaurar uno debe validar el duplicado en el caso de uso).
CREATE UNIQUE INDEX "products_category_name_lower_key"
  ON "products" ("categoryId", lower("name")) WHERE "archivedAt" IS NULL;
