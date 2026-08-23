<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mokka Café — Frontend (guía para agentes)

> Contexto de negocio y de producto: ver [`../docs/project-context.md`](../docs/project-context.md). Esta sección es solo sobre **cómo trabajar en este código**. El bloque de arriba lo regenera `next dev`; no lo edites a mano, solo escribe debajo de él.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript estricto
- **UI:** shadcn/ui (motor **Base UI**, no Radix) + Tailwind CSS v4
- **Formularios/validación:** react-hook-form + zod (`@hookform/resolvers`)
- **HTTP:** axios (cliente centralizado) + TanStack Query (`@tanstack/react-query`) para server-state (cache, refetch, polling, invalidación)
- **Estado global:** zustand — solo estado de cliente/UI que cruza features (sesión actual, pedido en construcción, preferencias de UI); nunca server-state, eso es responsabilidad de TanStack Query
- **Gestor de paquetes:** pnpm

## Comandos

```bash
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción (corre type-check)
pnpm lint     # eslint
```

No hay test runner configurado todavía. Si el usuario pide agregar tests, preguntar por la herramienta preferida (Vitest + Testing Library es lo estándar en este stack) en vez de asumir una.

## Estructura de carpetas

Los alias en `components.json` ya fijan un layout **feature-based con carpeta `shared/`** (no el clásico `components/` plano):

```
src/
  app/                        # SOLO rutas del App Router (route groups, page.tsx, layout.tsx)
    (public)/                 # páginas públicas
    (auth)/                   # login, etc.
    (dashboard)/              # app interna (mesero/caja/admin)
  shared/
    components/ui/            # componentes shadcn (generados con `pnpm dlx shadcn add`, no a mano)
    components/layout/        # navbar, sidebar, shells compartidos entre features
    lib/                      # utils, cliente axios, helpers puros
    lib/validations/          # esquemas zod compartidos
    hooks/                    # hooks reutilizables entre features
    types/                    # tipos compartidos (ej. contratos con el backend)
  features/
    <feature>/                # ej. menu, orders, admin, inventory
      components/
      hooks/
      api/                    # llamadas axios + queries específicas de la feature
      types/
```

Regla: si un componente/hook/tipo lo usa una sola feature, vive dentro de `features/<feature>/`; si lo usan dos o más, sube a `shared/`. No crear una carpeta `features/` para algo usado una sola vez.

Los alias de import (`@/src/shared/...`) están definidos en `components.json` y `tsconfig.json` — respétalos en vez de imports relativos largos.

## Convenciones de código

- Componentes en PascalCase, un componente por archivo, archivo en kebab-case o PascalCase consistente con lo que ya exista en la carpeta.
- Componentes shadcn se agregan con `pnpm dlx shadcn add <componente>`, nunca copiados/pegados a mano — así siguen recibiendo updates y quedan en `shared/components/ui`.
- Formularios: react-hook-form + resolver de zod; el schema de validación vive junto al formulario o en `shared/lib/validations/` si se reutiliza.
- Llamadas HTTP centralizadas en `shared/lib` (instancia de axios) y en `features/<feature>/api/` (funciones por endpoint) — no `fetch`/`axios` sueltos dentro de componentes.
- Toda llamada a `features/<feature>/api/` desde un Client Component se consume vía hooks de TanStack Query (`features/<feature>/hooks/`), nunca invocando la función de la capa `api/` directo en el componente — así se aprovecha cache, invalidación y estados de loading/error de forma consistente.
- Usar el helper `cn()` (`shared/lib/utils`) para componer clases de Tailwind condicionales, no template strings manuales.
- El modelo de datos del backend usa `orderType` en `Order` desde el día uno (ver project-context.md §4) aunque hoy solo exista `dine-in` — no asumas que dine-in es el único caso al tipar.

## Server-state: fetch vs axios+TanStack Query

- **`fetch` nativo de Next.js** (con su cache/revalidación) se reserva para Server Components de solo lectura donde vale la pena aprovechar ese cache (reportes, dashboards).
- **Axios + TanStack Query** es el default para todo lo que se toca desde Client Components (tomar pedidos, KDS, inventario, descuentos) — necesitan polling, invalidación granular por query key y estados de mutación, que el modelo de cache de Next no cubre.
- El backend (NestJS) es un servicio separado, no la propia DB de Next.js — por eso no se usan Server Actions para hablar con él: solo agregarían un salto extra (browser → Server Action → NestJS) sin eliminar la llamada de red real. El cliente llama a NestJS directo vía axios.
- Para la carga inicial de pantallas interactivas (POS, KDS) usar el patrón prefetch + hydration: un Server Component hace `prefetchQuery` y lo pasa a `HydrationBoundary`; el Client Component toma control con `useQuery` (+ polling) después del mount. Evita spinner en el primer render.
- `queryKey` jerárquico y consistente (`["orders", "active"]`, `["inventory", "ingredients"]`). Mutations invalidan las queries relacionadas en `onSuccess`.
- `retry` diferenciado: algo de retry en queries de lectura, pero `retry: false` (o casi) en mutations — reintentar automático de crear pedido o cobrar puede duplicar la operación.
- El logout (o un 401 del interceptor de axios) limpia tanto el store de zustand como el cache de TanStack Query (`queryClient.clear()`) — en un terminal compartido no debe quedar data de la sesión anterior visible al cambiar de usuario.
- `ReactQueryDevtools` solo en desarrollo, vía import dinámico condicionado a `process.env.NODE_ENV` — verificar que no termine en el bundle de producción.

Detalle completo del setup: [`../docs/architecture/frontend/PLAN_tanstack_query_setup.md`](../docs/architecture/frontend/PLAN_tanstack_query_setup.md).

## Qué evitar como agente

- No agregar otra librería de estado global (Redux, Jotai, Recoil...) — ya está decidido zustand, y solo para lo que de verdad cruza features.
- No duplicar server-state en zustand "por conveniencia" (pedidos, inventario, catálogo) — eso vive en TanStack Query; duplicarlo desincroniza los datos.
- No escribir componentes de UI base a mano si shadcn ya ofrece uno equivalente.
- No poner lógica de fetching directo en componentes de página — pasar por `features/<feature>/api/`.
- No commitear `.env*` (ver `.gitignore`).
- Commits en formato conventional commits (`feat:`, `fix:`, `chore:`, ...), como el resto del repo.
