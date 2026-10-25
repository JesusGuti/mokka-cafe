# Catálogo — Plan Scrum

**Estado**: Listo para iniciar · **Última actualización**: 2026-10-24

## 1. Product Goal

> El admin mantiene el menú completo (categorías, productos, grupos de opciones) sin tocar la base de datos, y cualquier miembro del staff lo ve **real** en el POS, con agotados al día.

## 2. Qué está cerrado y qué no

**Todas las decisiones de producto están cerradas** (ver [decisions.md](./decisions.md) D-1 a D-18). No queda ninguna pregunta que bloquee el inicio.

| Tema | Resultado |
|---|---|
| Archivar productos (`archivedAt`) | ✅ D-2 |
| Categoría con productos no se borra | ✅ D-3 |
| Unicidad de nombres (sin importar mayúsculas) | ✅ D-4, D-5 |
| `sortOrder` en categorías, productos, grupos y opciones | ✅ D-8 |
| Historial de precios (`ProductPriceChange`, `ModifierPriceChange`) | ✅ D-15 |
| Disponibilidad: ADMIN, CAJERO y MESERO; precios solo ADMIN | ✅ D-10 |
| Grupos de opciones con min/max (tamaños, leche, extras) | ✅ D-17 |
| Bs, sin impuestos, "Agotado" visible, sin paginación, imágenes después | ✅ D-11 a D-14, D-16 |

**Supuestos que usamos sin confirmar** (se corrigen barato si el cliente discrepa; ninguno bloquea):

| Supuesto | Dónde |
|---|---|
| Largos máximos: categoría 50, producto 80, descripción 200 caracteres | AC-1.5, AC-2.9 |
| Tope de precio de producto: Bs 100.000,00 | D-11 |
| Producto con precio 0 no permitido (opciones sí) | AC-2.7 |
| El precio de una opción es el **incremento** sobre el precio base | D-17 |
| Lo que cambia la disponibilidad se registra con quién y cuándo | D-10, AC-3.12 |

**Fuera de este plan** (decidido, pero se hace en otras features): validar min/max al guardar ítems del pedido y congelar precios (E4.3/E4.2), recetas de las opciones (E7.3), imágenes (después), pantalla de historial de precios (después).

## 3. Backlog ordenado

Puntos relativos (Fibonacci). La velocidad real se conoce tras el primer sprint; por eso el orden importa más que el corte.

| # | ID | Historia | Pts | Acumulado | Depende de | Hito |
|---|---|---|---|---|---|---|
| 1 | **E2.0** | Preparación técnica: migración con todos los cambios de schema, seed, helper de dinero (Bs) | 3 | 3 | — | |
| 2 | **E2.1** | CRUD de categorías | 3 | 6 | E2.0 | |
| 3 | **E2.2** | CRUD de productos + archivar/restaurar + búsqueda y filtros | 3 | 9 | E2.1 | |
| 4 | **E2.7** | Historial de precios | 2 | 11 | E2.2 | |
| 5 | **E2.5** | POS con menú real (+ quitar impuesto 10 %) | 3 | 14 | E2.1, E2.2 | **M1: el POS ya no usa mock** |
| 6 | **E2.3** | Disponibilidad (ADMIN, CAJERO, MESERO) con Deshacer | 3 | 17 | E2.2, E2.5 | **M2: agotados al día** |
| 7 | **E2.6** | Reordenar categorías y productos | 3 | 20 | E2.1, E2.2 | |
| 8 | **E2.4a** | Grupos de opciones y opciones (CRUD, reglas min/max) | 5 | 25 | E2.0 | |
| 9 | **E2.4b** | Asociar grupos a productos + menú con grupos | 3 | 28 | E2.4a, E2.2 | **M3: grupos de opciones** |
| 10 | **E2.8** | Cierre: flujos Playwright, checklist manual en tablet, limpieza | 2 | 30 | todo | **Done de la feature** |

Original: 16 pts. Ahora: **30 pts**. Crece por tres decisiones: grupos de opciones (+3, 5→8), `sortOrder` (+3), historial de precios (+2), más preparación y cierre (+5) que antes no estaban explícitos.

### Cómo cortar en sprints

Sprints de 2 semanas (según el backlog). Dibuja la línea donde acaba tu capacidad:

| Capacidad por sprint | Reparto |
|---|---|
| ~8–10 pts (parcial) | S1: #1–#3 (9) · S2: #4–#5 (5, sobra margen, se añade #6) · S3: #7 + #8 · S4: #9–#10 |
| ~15–18 pts (tiempo completo) | **S1: #1–#6 (17)** · **S2: #7–#10 (13)** |

Recomendación: planificar el Sprint 1 hasta **M1 (14 pts)** y dejar E2.3 como "si hay tiempo". Medir lo que realmente se completa y recalcular el Sprint 2.

## 4. Sprint 1 — "Menú real en el POS"

**Sprint Goal**: *el admin crea categorías y productos y el mesero los ve en el POS, con precio correcto y con cambios de precio registrados.*

**Alcance**: E2.0, E2.1, E2.2, E2.7, E2.5 (14 pts) · stretch: E2.3 (3).

### E2.0 — Preparación (hacerla primero y sola, en un PR)
- [ ] Migración Prisma: `Product.archivedAt`, `Product.sortOrder`, `ProductCategory.sortOrder`, `Product.availabilityChangedById/At`, tablas `ProductPriceChange` y `ModifierPriceChange`, `ModifierGroup`, `Modifier.groupId` (+ `sortOrder`), `ProductModifierGroup` reemplazando a `ProductModifier`.
- [ ] Migración SQL: índices únicos funcionales `lower(name)` (categorías, grupos), `(categoryId, lower(name))` (productos), `(groupId, lower(name))` (opciones).
- [ ] Verificar que `modifiers` y `product_modifiers` están vacías en todos los entornos antes de migrar.
- [ ] Seed reutilizable según el [test-plan](./test-plan.md) (categorías, productos, grupos, 3 roles).
- [ ] Helper único de dinero en frontend: parseo (`4,5`, `4.50`) → centavos; formato `es-BO` / BOB; con tests (AC-2.2, AC-2.8).
- [ ] Actualizar `docs/database-design.md` con el cambio de modelo.

### E2.1 — Categorías
- Backend: módulo `product-categories` (hexagonal, copiando `ingredient-categories`): create, list con `productCount`, update, delete con `409`. Roles ADMIN. Tests unit + e2e (AC-1.5 a AC-1.10).
- Frontend: `features/product-categories` (copiando `ingredient-categories`): tabla, formulario en diálogo, estados de lista, confirmar eliminar.
- QA: AC-1.1 a AC-1.14 (menos 1.14, que es de E2.6); transversales T-1 a T-12.

### E2.2 — Productos
- Backend: completar `products`: update, archive, restore, list con filtros, detalle. Unicidad por categoría. Tope y reglas de precio.
- Frontend: lista con búsqueda/filtros (cliente), formulario (nombre, categoría, precio, descripción), "Guardar y crear otro", archivar con confirmación explicativa.
- QA: AC-2.1 a AC-2.20; matriz de bordes de precio y nombre.

### E2.7 — Historial de precios
- Backend: tabla + escritura en la misma transacción que el `PATCH` de precio + `GET /products/:id/price-history`. Sin UI.
- QA: AC-7.1 a AC-7.6; probar que un fallo no deja registro huérfano.

### E2.5 — POS con menú real
- Backend: `GET /menu` (por ahora `modifierGroups: []`; el contrato ya es el final).
- Frontend: `features/pos/api/get-menu.ts` con TanStack Query (refresco ~30 s y al recuperar foco), eliminar `mock-products.ts`, quitar `TAX_RATE` de `order-ticket.tsx`, estados vacío/error/cargando, categoría seleccionada estable, "Agotado".
- QA: AC-5.1 a AC-5.17; checklist manual en tablet.

### Demo de cierre del Sprint 1 (guion)
1. Admin entra, crea categorías "Calientes" y "Fríos".
2. Crea 3 productos con precio `4,5`; el sistema muestra `Bs 4,50`.
3. Cambia el precio de uno; se ve en el POS en ≤ 30 s. Mostrar el registro en `price-history`.
4. Archiva un producto; desaparece del POS; lo restaura.
5. Entra como mesero: ve el menú, sin impuesto, sin botones de administración.

## 5. Sprint 2 — "Operación diaria y opciones"

**Sprint Goal**: *el staff marca agotados en segundos, el menú se ordena como el negocio lo usa y los productos soportan tamaños y opciones obligatorias.*

**Alcance**: E2.3 (si no entró), E2.6, E2.4a, E2.4b, E2.8.

### E2.3 — Disponibilidad
- Backend: `PATCH /products/:id/availability` (ADMIN, CAJERO, MESERO), registra quién y cuándo.
- Frontend: pantalla "Disponibilidad" (switches), acción desde la tarjeta del POS para el mesero, Deshacer en toast, actualización optimista con reversión visible.
- QA: AC-3.1 a AC-3.12; permisos de los tres roles; concurrencia.

### E2.6 — Orden
- Backend: endpoints `order` (subir/bajar), reordenación transaccional sin duplicados.
- Frontend: botones subir/bajar con foco y resaltado.
- QA: AC-6.1 a AC-6.8; carrera entre dos admins.

### E2.4a — Grupos y opciones
- Backend: módulos `modifier-groups` y `modifiers`; validación de min/max; desactivar vs. borrar; advertencia al desactivar la última opción de un grupo obligatorio.
- Frontend: lista de grupos con opciones, selector de tipo **en palabras**, vista previa de cómo lo verá el mesero.
- QA: AC-4.1 a AC-4.12, AC-4.19, AC-4.20; matriz de `(min, max)`.

### E2.4b — Asociación y menú
- Backend: `PUT /products/:id/modifier-groups` (todo o nada, orden preservado); `GET /menu` con grupos.
- Frontend: selector de grupos en el formulario de producto, indicio "Requiere elegir tamaño".
- QA: AC-4.13 a AC-4.18, AC-4.21, AC-4.22. Los criterios AC-4.23 a AC-4.27 quedan **documentados como contrato** y se validan en E4.3.

### E2.8 — Cierre
- Playwright: los 4 flujos críticos del [test-plan](./test-plan.md).
- Checklist manual en tablet real; revisión con `review-rounds`.
- Actualizar `docs/backlog.md` ("Estado actual" está desactualizado) y el índice de `docs/features`.

## 6. Definition of Ready (para tomar una HU)

- [x] Decisiones de producto cerradas.
- [x] Criterios de aceptación escritos y revisados.
- [x] Contrato de API definido.
- [ ] Dependencias del cuadro de arriba terminadas (se revisa al tomar la HU).

## 7. Definition of Done (por HU)

1. Criterios de aceptación cumplidos, citados en los tests (`AC-x.y`).
2. Tests unit y e2e verdes; Playwright si la HU toca un flujo crítico.
3. Lint, tipos y CI en verde.
4. Revisión de código por rondas (`review-rounds`): sin bloqueantes abiertos; deuda técnica anotada.
5. Estados de lista, errores y permisos revisados contra los criterios transversales T-1 a T-12.
6. Probado en tablet (POS) o escritorio (admin).
7. Documentación actualizada: decisiones si cambió algo, contrato de API si cambió un endpoint.
8. PR pequeño, uno por HU y por capa (backend y frontend por separado, como hasta ahora).

## 8. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| La migración de `Modifier`/`ProductModifier` choca con datos existentes | Baja | Alto | Verificar tablas vacías antes (checklist E2.0); migración en un PR aislado |
| Índices funcionales no los genera Prisma | Media | Medio | SQL manual en la migración + test e2e de carrera (E2.0) |
| E2.4 crece más de lo estimado (reglas min/max + UI) | Media | Medio | Partido en 4a/4b; 4b puede salir en Sprint 3 sin bloquear M1/M2 |
| E4.3 hereda complejidad (validar min/max en pedidos) | Alta | Medio | Contrato ya definido (AC-4.23–4.27); sumar 2–3 pts a E4.3 en el backlog |
| Velocidad real desconocida | Alta | Medio | Planificar Sprint 1 hasta M1; recalcular después |
| Matriz de roles (E1.3 ⚠️) cambia | Baja | Bajo | Los permisos viven en `@Roles()`; cambiarlos es una línea por endpoint |
| Tres roles tocan disponibilidad → cambios por error | Media | Bajo | Deshacer + registro de quién y cuándo (AC-3.12) |

## 9. Ceremonias mínimas (si trabajas solo o en pareja)

- **Planning** (30 min): confirmar Sprint Goal, mover HUs, revisar dependencias.
- **Check diario** (opcional, 5 min escrito): ayer / hoy / bloqueos.
- **Review** (20 min): demo con el guion de arriba, idealmente con alguien del negocio.
- **Retro** (20 min): qué frenó, qué ajustar; anotar la velocidad real (puntos terminados).

## 10. Seguimiento

| Sprint | Planificado | Completado | Notas |
|---|---|---|---|
| 1 | — | — | — |
| 2 | — | — | — |
