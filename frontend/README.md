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

No hay test runner configurado todavía (ver `AGENTS.md` si necesitas agregar uno).
