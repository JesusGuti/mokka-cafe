# Feature: Catálogo (menú)

**Estado**: ✅ Planeada y lista para iniciar · **Última actualización**: 2026-10-24 · **Épica**: E2 en [`backlog.md`](../../backlog.md)

## Objetivo

Que el admin mantenga el menú (categorías, productos, grupos de opciones) sin tocar la base de datos, y que el mesero lo vea **real** en el POS en vez del mock. Es prerequisito de pedidos (E4), cocina (E5) y recetas de inventario (E7.2).

## Historias incluidas

| HU | Resumen | Prio | Pts |
|---|---|---|---|
| E2.0 | Preparación técnica: migración, seed, helper de dinero | 🔴 | 3 |
| E2.1 | CRUD de categorías | 🔴 | 3 |
| E2.2 | CRUD de productos, archivar/restaurar, búsqueda | 🔴 | 3 |
| E2.7 | Historial de precios | 🔴 | 2 |
| E2.5 | POS usa menú real | 🔴 | 3 |
| E2.3 | Disponibilidad (ADMIN, CAJERO, MESERO) | 🟡 | 3 |
| E2.6 | Orden personalizado (`sortOrder`) | 🟡 | 3 |
| E2.4a | Grupos de opciones y opciones | 🔴 | 5 |
| E2.4b | Asociar grupos a productos y menú | 🔴 | 3 |
| E2.8 | Cierre: Playwright, checklist manual, limpieza | 🔴 | 2 |

**Total: 30 pts** (el backlog original decía 16: se sumaron grupos de opciones, `sortOrder`, historial de precios y preparación/cierre explícitos). Orden, sprints, tareas y riesgos: [sprint-plan.md](./sprint-plan.md).

## Dentro del alcance

- Pantallas de administración: categorías, productos, grupos de opciones y disponibilidad.
- Endpoint de lectura optimizado para el POS (menú agrupado por categoría).
- Eliminar `mock-products.ts` y conectar el POS a la API.
- Permisos: solo admin edita el menú y los precios; admin, cajero y mesero cambian la disponibilidad.

## Fuera del alcance (a propósito)

- **Congelar precio en el pedido** (`unitPriceCents`, `priceCentsAtOrder`): es de E4. Acá solo se garantiza que el precio del catálogo es correcto y que cambiarlo no afecta pedidos ya creados.
- **Recetas** (producto → ingredientes): E7.2.
- **Imágenes de producto**: el schema no las tiene. El POS actual funciona solo con texto. Se hará después, con almacenamiento en el servidor (D-16 en [decisions](./decisions.md)).
- **Impuestos**: no aplican por ahora (D-12). En E2.5 se retira la línea de impuesto 10 % del POS mock.
- **Mesas**: tiene su propia carpeta (`features/mesas`) porque es una feature independiente.

## Documentos

- [decisions.md](./decisions.md) — por qué se hizo así
- [acceptance-criteria.md](./acceptance-criteria.md) — criterios por HU (QA + UX)
- [sprint-plan.md](./sprint-plan.md) — orden, sprints, tareas, riesgos, DoR/DoD
- [test-plan.md](./test-plan.md) — cómo se prueba
- [ux-spec.md](./ux-spec.md) — flujos y estados de pantalla
- [api-contract.md](./api-contract.md) — endpoints y cambios de schema
- [open-questions.md](./open-questions.md) — supuestos pendientes (ninguna bloquea)

## Código relacionado (existente)

- Backend: `backend/src/modules/products/` (solo `create`, `get`, `list` en use-cases; falta update/delete). No existen aún módulos `product-categories`, `modifier-groups` ni `modifiers`.
- Schema: `Product`, `ProductCategory`, `Modifier`, `ProductModifier` en `backend/prisma/schema.prisma`.
- Frontend: `frontend/src/features/pos/` con `data/mock-products.ts`. Patrón a replicar para las pantallas admin: `frontend/src/features/ingredients/` (api / components / hooks / schemas / types).
