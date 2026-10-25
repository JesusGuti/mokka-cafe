# Catálogo — Plan de pruebas

**Estado**: Borrador · **Última actualización**: 2026-10-24

Las referencias `AC-x.y` apuntan a [acceptance-criteria.md](./acceptance-criteria.md). Regla: **cada AC debe quedar cubierto por al menos una prueba automatizada o por un ítem del checklist manual**, y se nombra en la prueba (`it('AC-2.2 guarda 4,50 como 450 centavos')`) para poder rastrear.

## Estrategia por capa

| Capa | Herramienta | Qué cubre | Qué NO cubre |
|---|---|---|---|
| Unit backend | Jest (junto al código) | Entidades (invariantes de nombre/precio), casos de uso con repositorio falso: duplicados, categoría inexistente, archivar/restaurar | Prisma real, HTTP |
| E2E backend | Jest + Supertest contra DB real | Contrato HTTP completo, roles (401/403), constraints de BD, filtros/búsqueda, `GET /menu`, atomicidad del `PUT` de grupos, reglas min/max, historial de precios | UI |
| Unit frontend | Vitest/Jest + Testing Library (como `ingredient-form.spec.tsx`) | Esquemas zod (precio), formulario, columnas de tabla, estados de lista | Navegación, red real |
| E2E UI | Playwright (ya en CI) | 3–4 flujos críticos de punta a punta (ver abajo) | Combinatoria de validaciones |
| Manual | Checklist (abajo) | Táctil real en tablet, lectura de pantalla, contraste, red lenta | — |

Pirámide: mucho unit, poco E2E UI. Las validaciones se prueban en unit/E2E backend, **no** repitiéndolas en Playwright.

## Flujos Playwright críticos (los únicos que justifican su costo)

1. **Alta completa**: admin crea categoría → crea producto → aparece en `/pos` bajo esa categoría.
2. **Agotado en vivo**: admin marca producto no disponible → el POS (otra pestaña) lo refleja sin recarga manual.
3. **Permisos**: mesero entra a `/pos`, ve menú y puede marcar un producto agotado; intenta abrir la administración y recibe "sin permiso"; la API responde 403 a un `POST /products`.
4. **Archivar y restaurar**: archivar un producto lo quita del POS; restaurarlo lo devuelve.

## Matriz de casos de borde (backend, la base de unit + e2e)

| Entidad | Campo | Casos |
|---|---|---|
| Categoría | `name` | `""`, `"   "`, 1 char, 50 chars, 51 chars, `"Calientes"` vs `"calientes"` vs `" CALIENTES "`, emoji, `<script>`, tilde (`"Té"` vs `"Te"` = distintos), con espacios internos dobles |
| Producto | `priceCents` | `-1`, `0`, `1`, `450`, `2_147_483_647`, `2_147_483_648` (overflow), `1.5`, `"450"` (string), `null`, `NaN` |
| Producto | `name` | igual que categoría + 80/81 chars; duplicado en misma categoría vs distinta categoría |
| Producto | `categoryId` | UUID válido existente, válido inexistente, formato inválido, `null`, categoría eliminada entre lectura y escritura |
| Producto | `description` | `null`, `""`, 200/201 chars, saltos de línea |
| Producto | estado | disponible↔no disponible, archivado, restaurar un no archivado, archivar dos veces, editar archivado |
| Opción (modifier) | `priceCents` | `-1`, `0`, `100`, decimales, enorme; nombre duplicado en el mismo grupo vs. en otro grupo |
| Grupo | `minSelect` / `maxSelect` | `(0,null)`, `(0,1)`, `(1,1)`, `(2,3)`, `(1,0)`, `(3,2)`, `(-1,1)`, `(0,0)`, `maxSelect` no entero; grupo obligatorio sin opciones activas; desactivar la última opción activa de un grupo obligatorio asociado |
| Asociación | lista de grupos | vacía, con duplicados, con un id inexistente (todo o nada), con un grupo inactivo, orden preservado, > 50 ids |
| Menú (`GET /menu`) | visibilidad | producto no disponible, archivado, categoría vacía, grupo/opción inactivos, producto sin grupos, grupo cuyas opciones están todas inactivas, menú totalmente vacío |

## Casos de concurrencia (E2E backend)

- Dos `POST /product-categories` con el mismo nombre en paralelo → exactamente uno gana, el otro `409` (verifica D-4 con índice único funcional).
- `DELETE` de categoría mientras otro request crea un producto en ella → o el producto se crea y el delete da `409`, o el delete gana y el producto da error de categoría inexistente; **nunca** un producto huérfano.
- `PATCH` de disponibilidad concurrente sobre el mismo producto → estado final consistente, sin `500`.

## Seguridad

- Cada endpoint de escritura: sin token → 401; token `MESERO`/`CAJERO` → 403; token expirado → 401; token de usuario `isActive = false` → rechazado.
- `GET /menu` accesible a los tres roles, **no** accesible sin token.
- Respuestas de `MESERO`/`CAJERO` no deben incluir campos solo-admin (por ejemplo `archivedAt`, productos archivados).
- Payload con campos extra (`id`, `createdAt`, `isAvailable` en el create) → ignorados o rechazados según `ValidationPipe` (`whitelist`/`forbidNonWhitelisted`), nunca aplicados.

## Datos de prueba (seed)

Mantener un seed único reutilizable por e2e, Playwright y demos:

- 4 categorías: Calientes, Fríos, Postres, Snacks (una **vacía** a propósito).
- ~20 productos con precios variados (centavos "redondos" y no redondos: 450, 525, 1999), uno con nombre de 80 chars, uno sin descripción, uno **no disponible**, uno **archivado**.
- Grupos: "Tamaño" (obligatorio, elegir 1: Chico +0, Mediano +1,00, Grande +2,00), "Leche" (obligatorio, elegir 1), "Extras" (opcional, varias: uno gratuito, uno **inactivo**) y un grupo **inactivo**. Productos: uno con 3 grupos, uno con solo "Extras", uno sin ninguno.
- Los 3 roles: un admin, un mesero, un cajero.

## Checklist manual (antes de dar la feature por buena)

**Dispositivos**: tablet 10" horizontal y vertical, celular 6", escritorio.
- [ ] POS usable con una mano; ningún botón < 44 px; sin zoom accidental al enfocar inputs.
- [ ] Wi-Fi lento (throttling "Fast 3G"): ver skeleton, no pantalla blanca; el error es entendible.
- [ ] Corte de red a mitad de guardar: el formulario conserva datos y permite reintentar.
- [ ] Navegación solo con teclado en admin (Tab / Enter / Esc); foco siempre visible.
- [ ] Lector de pantalla (NVDA): los estados "Agotado" / "Archivado" se anuncian.
- [ ] Zoom del navegador al 200 %: sin pérdida de funcionalidad.
- [ ] Modo oscuro / contraste (si la app lo soporta).
- [ ] Texto: tildes, ñ, nombres largos, emojis se ven bien en admin, POS y (más adelante) ticket.
- [ ] Doble clic y doble Enter en "Guardar": un solo registro.
- [ ] Botón atrás del navegador después de crear/editar: no re-envía ni muestra datos obsoletos.
- [ ] Dos navegadores a la vez (admin y mesero): el cambio de disponibilidad llega al POS.

## Regresión que otras features deben proteger

- (E4) Cambiar el precio de un producto no altera pedidos existentes (AC-2.4).
- (E4) Intentar agregar un producto que pasó a no disponible → error recuperable (D-7).
- (E4) El backend rechaza un ítem que incumple `minSelect`/`maxSelect` de sus grupos (AC-4.27).
- (E4/E5) Una opción desactivada se sigue mostrando en pedidos históricos (AC-4.4).
- (E7.2) Archivar un producto no rompe sus recetas.

## Criterio de salida ("done")

- Todos los AC no marcados 🟡 cubiertos; los 🟡 resueltos o explícitamente diferidos con nota.
- CI en verde (lint, tipos, unit, e2e, Playwright).
- Checklist manual ejecutado en al menos una tablet real.
- `mock-products.ts` eliminado; sin referencias muertas.
- Cero errores no controlados (`500`) en los casos de borde de la matriz.
