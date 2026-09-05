# Mokka Café — Frontend

Interfaz web (Next.js) para la gestión de pedidos, cobro e inventario de Mokka Café.

> Convenciones de arquitectura y buenas prácticas para desarrollar acá: ver [`AGENTS.md`](./AGENTS.md).
> Contexto de negocio/producto: ver [`../docs/project-context.md`](../docs/project-context.md).

## Requisitos

- Node.js 20 o superior
- pnpm 9+

## 1. Instalar dependencias

```bash
pnpm install
```

## 2. Levantar el servidor de desarrollo

```bash
pnpm dev
```

Queda disponible en [http://localhost:3000](http://localhost:3000), con recarga automática al guardar cambios.

Para que las peticiones al backend funcionen, este también debe estar corriendo por separado — ver [`../backend/README.md`](../backend/README.md). Por defecto el backend acepta peticiones CORS desde `http://localhost:3000`, que es donde corre este dev server.

## Otros comandos

| Comando        | Qué hace                          |
| --------------- | ---------------------------------- |
| `pnpm build`     | Build de producción (incluye type-check) |
| `pnpm start`     | Sirve el build de producción       |
| `pnpm lint`      | ESLint                             |
| `pnpm test`      | Tests unitarios/componentes (Vitest) |

## Tests e2e (Playwright)

Los tests e2e viven en `e2e/` y corren con Playwright (`playwright.config.ts`).

En una máquina nueva, además de `pnpm install`, hay que descargar los binarios de los navegadores una sola vez:

```bash
pnpm exec playwright install
```

Sin este paso, todos los tests fallan con `Executable doesn't exist at ...` al intentar lanzar chromium/firefox/webkit — no es un bug del código, es que Playwright instala el paquete npm pero no los navegadores por separado.

Luego corré los tests con:

```bash
pnpm exec playwright test
```

El propio config levanta el dev server (`pnpm dev`) si no está corriendo. Algunos tests (creación de usuario, login con credenciales inválidas) además pegan contra el backend real en `NEXT_PUBLIC_API_URL`/`http://localhost:8080`; si el backend no está levantado, esos tests se skippean automáticamente (ver `e2e/utils/backend.ts`) en vez de fallar.
