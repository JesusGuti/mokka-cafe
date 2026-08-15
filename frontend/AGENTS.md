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
- **HTTP:** axios
- **Estado global:** zustand — solo para estado que cruza features; preferir estado local/props primero
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
- Usar el helper `cn()` (`shared/lib/utils`) para componer clases de Tailwind condicionales, no template strings manuales.
- El modelo de datos del backend usa `orderType` en `Order` desde el día uno (ver project-context.md §4) aunque hoy solo exista `dine-in` — no asumas que dine-in es el único caso al tipar.

## Qué evitar como agente

- No agregar otra librería de estado global (Redux, Jotai, Recoil...) — ya está decidido zustand, y solo para lo que de verdad cruza features.
- No escribir componentes de UI base a mano si shadcn ya ofrece uno equivalente.
- No poner lógica de fetching directo en componentes de página — pasar por `features/<feature>/api/`.
- No commitear `.env*` (ver `.gitignore`).
- Commits en formato conventional commits (`feat:`, `fix:`, `chore:`, ...), como el resto del repo.
