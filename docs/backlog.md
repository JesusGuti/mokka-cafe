# Backlog — Mokka Café

> Contexto de negocio: [`project-context.md`](./project-context.md). Modelo de datos: [`database-design.md`](./database-design.md). Este documento traduce ambos en historias de usuario (HU) programables y una estimación de sprints.

## Cómo leer este backlog

- **Formato de HU**: "Como `<rol>`, quiero `<acción>`, para `<beneficio>`", con criterios de aceptación (AC) breves — no exhaustivos; se afinan al entrar a sprint.
- **Prioridad**: 🔴 Must (bloquea el MVP descrito en `project-context.md` §2) · 🟡 Should (valioso pero no bloqueante) · ⚪ Post-MVP (fuera del alcance actual, documentado para no perderlo).
- **Puntos**: estimación relativa (Fibonacci: 1-2-3-5-8-13), no horas. Sirven para comparar tamaño entre HUs, no para prometer fechas por sí solos.
- **⚠️**: la HU depende de una pregunta todavía sin responder por el cliente (ver `project-context.md` §2). Se puede empezar el diseño técnico, pero no cerrar el detalle final sin esa respuesta.

## Estado actual (punto de partida, no HUs nuevas)

- Backend: módulo `products` con arquitectura hexagonal como plantilla — solo `create` implementado (falta `list`/`update`/`delete`). Schema completo en Prisma (todo el dominio: catálogo, pedidos, pagos, inventario). Sin autenticación todavía.
- Frontend: pantalla de POS (`/pos`) con datos mock, sin conexión a la API real, sin login, sin las demás pantallas (cocina, caja, admin).

---

## Épica 1 — Autenticación y roles

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E1.1 | Como miembro del staff, quiero iniciar sesión con email y contraseña, para que el sistema sepa quién hace cada acción. | Login devuelve token de sesión; `passwordHash` con bcrypt/argon2; error claro en credenciales inválidas. | 🔴 | 5 |
| E1.2 | Como admin, quiero crear/editar/desactivar cuentas de staff, para gestionar el equipo sin tocar la base de datos. | CRUD de `User`; asignar `role`; desactivar con `isActive`, no borrar (hay FKs `Restrict` en `Order`/`Payment`). | 🔴 | 5 |
| E1.3 ⚠️ | Como sistema, quiero restringir acciones según el rol (mesero/cajero/admin), para que cada quien solo haga lo que le corresponde. | Guard de Nest por rol; mapa explícito de qué endpoint requiere qué rol. | 🔴 | 5 |

**Subtotal: 15 pts**

---

## Épica 2 — Catálogo (menú)

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E2.1 | Como admin, quiero crear/editar categorías de producto, para organizar el menú. | CRUD `ProductCategory`; nombre único. | 🔴 | 3 |
| E2.2 | Como admin, quiero crear/editar productos con precio, descripción y categoría, para mantener el menú actualizado. | Completar `list`/`update`/`delete` sobre lo ya iniciado en `products`. | 🔴 | 3 |
| E2.3 | Como admin, quiero marcar un producto como no disponible temporalmente, para ocultarlo del POS sin borrarlo. | Toggle `isAvailable`; no aparece en el POS si está apagado. | 🟡 | 2 |
| E2.4 | Como admin, quiero crear modificadores (extras) con precio propio y asociarlos a productos, para ofrecer personalizaciones. | CRUD `Modifier` + `ProductModifier`. | 🔴 | 5 |
| E2.5 | Como mesero, quiero ver el menú real (no mock) organizado por categoría en el POS, para tomar pedidos con datos verdaderos. | Reemplaza `mock-products.ts` por `features/pos/api/get-products.ts`. | 🔴 | 3 |

**Subtotal: 16 pts**

---

## Épica 3 — Mesas

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E3.1 | Como admin, quiero registrar las mesas del local (número, capacidad), para asignarlas a pedidos. | CRUD `Table`; `number` único. | 🔴 | 2 |
| E3.2 | Como mesero, quiero ver qué mesas están libres/ocupadas, para saber dónde tomar el siguiente pedido. | Estado derivado: mesa ocupada si tiene un `Order` con `closedAt = null`. | 🟡 | 3 |

**Subtotal: 5 pts**

---

## Épica 4 — Toma de pedidos (POS)

El núcleo del sistema — sin esto no hay producto.

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E4.1 | Como mesero, quiero abrir un pedido nuevo para una mesa, para empezar a registrar lo que piden. | `Order.create` con `orderType = DINE_IN`, `tableId`, `waiterId` del usuario logueado. | 🔴 | 5 |
| E4.2 | Como mesero, quiero agregar productos con cantidad al pedido, para reflejar lo que el cliente ordenó. | `OrderItem.create`; `unitPriceCents` congelado al momento del pedido (no referencia viva a `Product`). | 🔴 | 5 |
| E4.3 | Como mesero, quiero agregar modificadores a un ítem del pedido, para personalizar la orden. | `OrderItemModifier` con `priceCentsAtOrder` congelado. | 🔴 | 3 |
| E4.4 | Como mesero, quiero agregar una nota especial a un ítem, para comunicar pedidos puntuales a cocina (ej. "sin hielo"). | Campo `notes` libre en `OrderItem`. | 🟡 | 2 |
| E4.5 | Como mesero, quiero agregar más productos a un pedido ya abierto (incluso con rondas ya cobradas), para atender pedidos que crecen durante la visita. | Nuevos `OrderItem` sobre un `Order` con `closedAt = null`, sin afectar ítems ya entregados/pagados. | 🔴 | 3 |
| E4.6 ⚠️ | Como mesero, quiero cancelar un ítem antes de que cocina lo empiece, para corregir errores de captura. | `OrderItemStatus = CANCELLED`; si ya había descuento de inventario, genera `InventoryMovement` tipo `ADJUSTMENT` de reversión. | 🟡 | 3 |

**Subtotal: 21 pts**

---

## Épica 5 — Cocina (KDS)

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E5.1 | Como cocina, quiero ver los ítems pedidos agrupados por pedido, para saber qué preparar. | Vista/endpoint de `OrderItem`s activos (no `DELIVERED`/`CANCELLED`), ordenados por antigüedad. | 🔴 | 5 |
| E5.2 | Como cocina, quiero avanzar el estado de un ítem (recibido → en preparación → listo → entregado), para que mesero/caja vean el avance. | Transición válida de `OrderItemStatus`; un tap por ítem, no por pedido completo. | 🔴 | 5 |
| E5.3 | Como mesero, quiero ver el estado de cada ítem de mis pedidos, para informar al cliente. | Reutiliza el mismo endpoint de estado, filtrado por mesero/mesa. | 🟡 | 3 |

**Nota técnica a decidir temprano**: "ver en vivo" implica *polling* (simple, suficiente para un solo local) o *WebSockets* (más trabajo, mejor UX). Recomendaría polling cada pocos segundos para el MVP — evita meter infraestructura de sockets antes de tener el flujo funcionando.

**Subtotal: 13 pts**

---

## Épica 6 — Cobro y pagos

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E6.1 | Como cajero, quiero registrar un cobro para un pedido (efectivo o QR), para cerrar la cuenta del cliente. | `Payment.create`; `cashierId` del usuario logueado. | 🔴 | 5 |
| E6.2 | Como cajero, quiero registrar varios cobros para el mismo pedido (rondas), para cobrar según decida el cliente. | Varios `Payment` por `Order`; `Order` sigue abierto entre rondas. | 🔴 | 3 |
| E6.3 | Como cajero, quiero anular un cobro registrado por error, para corregir la caja. | `Payment.voidedAt`; se excluye de totales cobrados. | 🟡 | 2 |
| E6.4 ⚠️ | Como cajero, quiero dividir la cuenta en casos excepcionales, para atender grupos. | Confirmado como caso *excepcional*, no flujo principal (`project-context.md` §2) — validar con el cliente si de verdad entra al MVP o se puede posponer. | ⚪ | 5 |
| E6.5 | Como sistema, quiero cerrar el pedido (`closedAt`) cuando todo está pagado, para liberar la mesa. | Se fija `closedAt` cuando suma de `Payment.amountCents` (no anulados) cubre el total. | 🔴 | 3 |

**Riesgo a resolver, no HU todavía**: el mock del POS ya calcula un 10% de "Impuesto", pero `project-context.md` no menciona impuestos en ningún lado — confirmar con el cliente si aplica antes de construir E6, porque cambia el cálculo del total a cobrar.

**Subtotal (sin E6.4): 13 pts** — con división de cuenta: 18 pts

---

## Épica 7 — Inventario

La pieza más compleja técnicamente, y explícitamente dentro del alcance del MVP (`project-context.md` §2: "inventario granular por ingrediente").

| ID | Historia | Criterios de aceptación | Prioridad | Puntos |
|---|---|---|---|---|
| E7.1 | Como admin, quiero registrar ingredientes (nombre, unidad, categoría, stock mínimo), para llevar el catálogo de insumos. | CRUD `Ingredient` + `IngredientCategory`. | 🔴 | 3 |
| E7.2 ⚠️ | Como admin, quiero definir la receta de un producto (qué ingredientes y cuánto consume), para habilitar el descuento de stock. | CRUD `Recipe`; depende de si el cliente ya tiene las recetas definidas o hay que ayudarles a levantarlas (afecta tiempo real, no solo el desarrollo). | 🔴 | 5 |
| E7.3 | Como admin, quiero registrar modificadores que también consumen insumo (ej. "Extra Shot"), para que el stock sea preciso. | CRUD `ModifierRecipe`. | 🟡 | 3 |
| E7.4 | Como admin, quiero registrar entradas de inventario por lote (compra), con vencimiento y costo, para rastrear insumos reales. | `InventoryLot.create`; genera `InventoryMovement` tipo `ENTRY`. | 🔴 | 5 |
| E7.5 ⚠️ | Como sistema, quiero descontar stock al vender un producto, eligiendo lote por FEFO, para mantener el inventario preciso. | Resuelve `Recipe` + `ModifierRecipe` del ítem vendido; genera `InventoryMovement` tipo `SALE`; todo en una transacción con la actualización de `currentStockQty`/`quantityRemaining` (decisión de diseño #8). Depende de si el descuento debe ser automático o manual — confirmar con cliente. | 🔴 | 8 |
| E7.6 | Como admin, quiero aplicar un descuento a un producto por proximidad de vencimiento de su lote, para venderlo antes de perderlo. | `InventoryLot.discountPercent` → se refleja en `OrderItem.discountCents` al vender de ese lote. | 🟡 | 5 |
| E7.7 | Como admin, quiero registrar mermas/desperdicio manualmente, para que el stock refleje la realidad. | `InventoryMovement` tipo `WASTE`. | 🟡 | 3 |
| E7.8 ⚠️ | Como admin, quiero ver alertas de insumos bajo el stock mínimo, para reabastecer a tiempo. | Pendiente de confirmar con el cliente si es un requisito real del MVP. | ⚪ | 3 |

**Subtotal (sin E7.8): 32 pts** — con alertas: 35 pts

---

## Épica 8 — Reportes (post-MVP)

No mencionado como requisito del MVP en `project-context.md`, pero se vuelve natural una vez que hay datos de ventas e inventario reales. Documentado para no perderlo, no comprometido en la primera estimación.

| ID | Historia | Prioridad | Puntos |
|---|---|---|---|
| E8.1 | Como admin, quiero un reporte de ingresos vs. costos por período, para entender la rentabilidad. | ⚪ | 8 |
| E8.2 | Como admin, quiero un reporte de mermas/pérdidas por vencimiento, para reducir desperdicio. | ⚪ | 5 |
| E8.3 | Como admin, quiero ver qué modificadores/extras se venden más, para decisiones de menú. | ⚪ | 3 |

---

## Resumen de puntos (MVP: épicas 1-7, sin las marcadas ⚪)

| Épica | Puntos |
|---|---|
| 1 — Auth y roles | 15 |
| 2 — Catálogo | 16 |
| 3 — Mesas | 5 |
| 4 — Toma de pedidos | 21 |
| 5 — Cocina | 13 |
| 6 — Cobro y pagos | 13 |
| 7 — Inventario | 32 |
| **Total MVP** | **≈ 115 pts** |

---

## Estimación de sprints

La conversión de puntos a sprints depende de **cuánta gente y cuánto tiempo** hay disponible — sin ese dato el número es solo decoración. Dos escenarios típicos para un proyecto así (sprint de 2 semanas):

| Escenario | Velocidad estimada | Sprints para MVP (≈115 pts) | Duración |
|---|---|---|---|
| Solo developer, tiempo parcial (~10-15 h/semana) | ~8-10 pts/sprint | ~12-14 sprints | ~6-7 meses |
| Solo developer, tiempo completo (~30-35 h/semana) | ~18-20 pts/sprint | ~6-7 sprints | ~3-3.5 meses |
| Par de developers en paralelo | ~30-35 pts/sprint | ~4 sprints | ~2 meses |

Esto es una estimación tipo "orden de magnitud" para planear, no un compromiso — la velocidad real solo se conoce después de correr 1-2 sprints y medir cuántos puntos se completan de verdad. Recomendaría fijar el escenario real (¿cuánta gente, cuánto tiempo por semana?) y recalcular con eso.

**Sugerencia de orden de sprints** (no obligatorio, pero evita bloqueos): Épica 1 (auth) primero porque `waiterId`/`cashierId` ya son obligatorios en el schema — sin login no se puede crear ni un `Order` de prueba. Luego 2 y 3 (catálogo/mesas, son prerequisito de datos). Luego 4 y 5 juntas (toma de pedido + cocina forman un solo flujo end-to-end demostrable). Luego 6 (cobro). Épica 7 (inventario) puede avanzar en paralelo desde el principio si hay más de una persona, porque no depende de 4/5/6 — solo de 2 (necesita `Product` para `Recipe`).

---

## Antes de arrancar sprint 1

Preguntas de `project-context.md` §2 que bloquean o cambian el tamaño de HUs específicas (marcadas ⚠️ arriba):

1. Descuento de stock automático vs. manual (E7.5 — cambia de 8 a posiblemente 3 pts si es manual).
2. Si las recetas ya están definidas por el cliente (E7.2 — si no, hay trabajo de levantamiento que no es desarrollo).
3. Roles y permisos exactos (E1.3 — el diseño técnico puede empezar, el detalle no se puede cerrar).
4. Si modificar/cancelar un pedido es necesidad real (E4.6).
5. Alertas de stock mínimo (E7.8 — decide si entra al MVP o queda post-MVP).
6. Si existe impuesto sobre las ventas (afecta el cálculo de E6.1 — el mock del POS ya asume 10%, sin confirmar con el cliente).
