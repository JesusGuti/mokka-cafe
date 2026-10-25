# Catálogo — Contrato de API (propuesto)

**Estado**: Aprobado · **Última actualización**: 2026-10-24

Ajustar nombres y formatos a las convenciones ya existentes (`ingredient-categories`, `ingredients`) al implementar. Todo requiere `Authorization: Bearer`. Precios siempre en **centavos enteros** (D-1). Los roles son `ADMIN`, `MESERO`, `CAJERO`.

## Categorías — `product-categories`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/product-categories` | ADMIN | Lista con `productCount` |
| POST | `/product-categories` | ADMIN | Crea `{ name }` |
| PATCH | `/product-categories/:id` | ADMIN | Edita `{ name }` |
| DELETE | `/product-categories/:id` | ADMIN | Borra si no tiene productos (D-3) |

## Productos — `products`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/products` | ADMIN | Query: `search`, `categoryId`, `status=active\|unavailable\|archived`. Sin paginación (D-14) |
| GET | `/products/:id` | ADMIN | Detalle con `modifierGroupIds` |
| POST | `/products` | ADMIN | `{ name, description?, priceCents, categoryId, isAvailable? }` |
| PATCH | `/products/:id` | ADMIN | Campos parciales |
| PATCH | `/products/:id/availability` | ADMIN, CAJERO, MESERO | `{ isAvailable }` (acción rápida, idempotente) |
| POST | `/products/:id/archive` | ADMIN | Archiva (D-2) |
| POST | `/products/:id/restore` | ADMIN | Restaura |
| PATCH | `/products/:id/order` y `/product-categories/:id/order` | ADMIN | Mover arriba/abajo (D-8 ✅) |
| PUT | `/products/:id/modifier-groups` | ADMIN | `{ groupIds: string[] }` — lista **ordenada**; reemplaza el conjunto completo, todo o nada (D-9, D-17) |
| GET | `/products/:id/price-history` | ADMIN | Historial de precios, más reciente primero (D-15) |

`PATCH /products/:id/availability` registra `availabilityChangedById` y `availabilityChangedAt` (AC-3.12).

## Grupos de opciones — `modifier-groups`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/modifier-groups` | ADMIN | Con sus opciones y `productCount`. Query: `isActive`, `search` |
| POST | `/modifier-groups` | ADMIN | `{ name, minSelect, maxSelect \| null }` |
| PATCH | `/modifier-groups/:id` | ADMIN | `{ name?, minSelect?, maxSelect?, isActive? }` |
| PATCH | `/modifier-groups/:id/order` | ADMIN | Mover arriba/abajo |
| DELETE | `/modifier-groups/:id` | ADMIN | Solo si nunca se usó ni está asociado; si no, `409` y se desactiva |

## Opciones — `modifiers`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/modifier-groups/:groupId/modifiers` | ADMIN | `{ name, priceCents }` (≥ 0, incremento sobre el precio base) |
| PATCH | `/modifiers/:id` | ADMIN | `{ name?, priceCents?, isActive? }` (no se cambia de grupo, AC-4.12) |
| PATCH | `/modifiers/:id/order` | ADMIN | Mover arriba/abajo dentro del grupo |
| DELETE | `/modifiers/:id` | ADMIN | Solo si nunca se usó; si no, `409` y se desactiva |
| GET | `/modifiers/:id/price-history` | ADMIN | Historial de precios (D-15) |

Reglas del grupo (validadas en backend): `minSelect ≥ 0`; `maxSelect` es `null` o `≥ max(1, minSelect)`; un grupo activo y obligatorio debe conservar ≥ `minSelect` opciones activas (AC-4.7).

## Menú para el POS — `GET /menu`

Roles: `ADMIN`, `MESERO`, `CAJERO`. Solo lectura, ya filtrado (D-6).

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Calientes",
      "products": [
        {
          "id": "uuid",
          "name": "Capuchino",
          "description": "Espuma densa de leche",
          "priceCents": 480,
          "isAvailable": true,
          "modifierGroups": [
            {
              "id": "uuid",
              "name": "Tamaño",
              "minSelect": 1,
              "maxSelect": 1,
              "modifiers": [
                { "id": "uuid", "name": "Chico", "priceCents": 0 },
                { "id": "uuid", "name": "Grande", "priceCents": 200 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Reglas de visibilidad: excluye productos archivados y grupos y opciones inactivos; excluye categorías sin productos visibles (AC-3.7). Productos `isAvailable: false` se **incluyen** para mostrarlos como "Agotado" (D-13). Orden: `sortOrder` y luego nombre (D-8 ✅), también para grupos y opciones.

## Errores (formato común)

| HTTP | Cuándo | Mensaje para la UI |
|---|---|---|
| 400 | Validación (campo faltante, precio inválido, largo excedido) | Detalle por campo |
| 401 | Token ausente/expirado/usuario inactivo | Redirigir a login |
| 403 | Rol sin permiso | "No tienes permiso…" |
| 404 | Recurso no existe (o fue eliminado) | "Ya no existe…" |
| 409 | Nombre duplicado; categoría con productos; archivar algo ya archivado (si se decide estricto) | Mensaje de negocio específico |

Regla: **nunca `500` por entrada de usuario.** Todo caso de la matriz del [test-plan](./test-plan.md) debe terminar en 4xx con mensaje accionable.

## Cambios de schema que implica (aprobados)

| Cambio | Motivo | Decisión |
|---|---|---|
| `Product.archivedAt DateTime?` | Archivar sin romper FKs | D-2 ✅ |
| Índice único funcional `lower(name)` en `ProductCategory` y `Modifier` | Unicidad real e insensible a mayúsculas, a prueba de concurrencia | D-4 ✅ |
| Índice único `(categoryId, lower(name))` en `Product` | Nombres únicos por categoría | D-5 ✅ |
| `ProductCategory.sortOrder Int` y `Product.sortOrder Int` | Orden personalizado en el POS | D-8 ✅ |
| Tabla `PriceChange` | Historial de cambios de precio | D-15 ✅ |
| `ModifierGroup` (nuevo) y `Modifier.groupId` obligatorio | Grupos de opciones con reglas min/max | D-17 ✅ |
| `ProductModifier` → `ProductModifierGroup (productId, groupId, sortOrder)` | Asociar producto a grupos | D-17 ✅ |
| `Modifier.sortOrder`, `Product.availabilityChangedById/At` | Orden de opciones; trazabilidad de agotados | D-8 ✅, D-10 ✅ |
