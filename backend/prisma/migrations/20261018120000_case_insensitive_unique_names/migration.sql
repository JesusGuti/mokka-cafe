-- La unicidad de nombres pasa a ser insensible a mayúsculas ("Leche" == "leche").
-- Prisma no puede expresar índices sobre expresiones en schema.prisma, por eso
-- se declaran solo aquí y los modelos ya no usan @unique en `name`.
-- Si ya existen nombres que solo difieren en mayúsculas, este índice falla:
-- hay que renombrarlos antes de migrar.

-- DropIndex
DROP INDEX "ingredient_categories_name_key";
DROP INDEX "ingredients_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_categories_name_lower_key" ON "ingredient_categories" (lower("name"));
CREATE UNIQUE INDEX "ingredients_name_lower_key" ON "ingredients" (lower("name"));
