# Mokka Café — Backend

API en NestJS + Prisma/Postgres para la gestión de pedidos, cobro e inventario de Mokka Café.

> Convenciones de arquitectura y buenas prácticas para desarrollar acá: ver [`AGENTS.md`](./AGENTS.md).
> Contexto de negocio/producto: ver [`../docs/project-context.md`](../docs/project-context.md).

## Requisitos

- Node.js 20 o superior
- pnpm 9+
- Docker (para levantar Postgres localmente)

## 1. Instalar dependencias

```bash
pnpm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

En Windows (PowerShell): `Copy-Item .env.example .env`

Los valores por defecto de `.env.example` ya coinciden con el Postgres que levanta `docker-compose.yml`, así que normalmente no hace falta tocar nada para desarrollo local. Si agregas una variable nueva, también debe declararse en `src/config/env.validation.ts` — si no, Nest falla al arrancar (es a propósito, ver `AGENTS.md`).

## 3. Levantar la base de datos

```bash
pnpm docker:up             # Postgres en :5432 + pgAdmin en :5050 (admin@mokka.com / admin)
pnpm prisma:migrate:dev    # aplica las migraciones (crea la BD si no existe)
```

Para bajar los contenedores: `pnpm docker:down`.

## 4. Levantar el servidor

```bash
pnpm start:dev
```

Queda escuchando en `http://localhost:8080` (o el `PORT` que hayas configurado en `.env`), con recarga automática al guardar cambios.

## Tests

```bash
pnpm test          # unitarios (no requieren base de datos)
pnpm test:cov       # unitarios con cobertura

pnpm docker:up               # si no está corriendo ya
pnpm db:test:migrate         # migra la BD de test (usa .env.test, separada de la de desarrollo)
pnpm test:e2e                # end-to-end, contra la BD real
```

## Build / producción

```bash
pnpm build          # compila a dist/ y reescribe los alias (@shared/*, @generated/*)
pnpm start:prod      # node dist/main
```

## Otros comandos útiles

| Comando               | Qué hace                                              |
| ---------------------- | ------------------------------------------------------ |
| `pnpm lint`             | ESLint con `--fix`                                     |
| `pnpm format`           | Prettier sobre `src/` y `test/`                        |
| `pnpm prisma:studio`    | Explorador visual de la base de datos                  |
| `pnpm prisma:generate`  | Regenera el cliente de Prisma (`src/generated/prisma`) |
