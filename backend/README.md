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
pnpm prisma:generate       # genera el cliente en src/generated/prisma
```

`migrate dev` solo corre `generate` automáticamente cuando aplica una migración nueva — si tu schema ya está al día (por ejemplo, clonaste el repo y las migraciones ya existían), puede no generarlo. Si al arrancar el servidor ves errores de módulo no encontrado en `src/generated/prisma`, corre `pnpm prisma:generate` a mano.

Para bajar los contenedores: `pnpm docker:down`.

## 4. Levantar el servidor

```bash
pnpm start:dev
```

Queda escuchando en `http://localhost:8080` (o el `PORT` que hayas configurado en `.env`), con recarga automática al guardar cambios.

## Migraciones

El schema vive en `prisma/schema.prisma`; cada cambio se registra como una carpeta en `prisma/migrations/`. Nunca edites una migración que ya se aplicó o se mergeó: crea una nueva.

**Crear y aplicar una migración** (flujo normal):

```bash
# 1. Edita prisma/schema.prisma
pnpm exec prisma format                                        # alinea el schema
pnpm exec prisma validate                                      # comprueba que sea válido
pnpm prisma:migrate:dev --create-only --name <que_cambia>      # genera el SQL SIN aplicarlo
# 2. Revisa prisma/migrations/<timestamp>_<que_cambia>/migration.sql
# 3. Aplícala y regenera el cliente
pnpm prisma:migrate:dev
```

Usa `--create-only` siempre que la migración deba llevar SQL a mano o quieras revisar antes de aplicar. Cosas que Prisma **no** puede expresar en el schema (índices sobre `lower(...)`, índices parciales con `WHERE`) se escriben directamente en el `migration.sql`; deja un comentario explicando por qué, como en `20261018120000_case_insensitive_unique_names`.

Nombres de migración: minúsculas con guiones bajos, describiendo el cambio (`catalog_additive_columns`), no el ticket.

**Estado y otros entornos:**

```bash
pnpm exec prisma migrate status    # qué migraciones están aplicadas o pendientes
pnpm prisma:migrate:deploy         # aplica las pendientes sin crear nada (producción/CI)
pnpm db:test:migrate               # lo mismo sobre la BD de test
```

**Reiniciar la base de desarrollo desde cero** (borra todos los datos):

```bash
pnpm exec prisma migrate reset     # elimina y recrea la BD, reaplica todas las migraciones
pnpm prisma:seed                    # vuelve a cargar los datos de prueba
```

> `migrate reset` es destructivo y solo debe usarse contra la BD local. Prisma 7 ya no corre el seed automáticamente después del reset, por eso va como paso aparte. Para la BD de test, `pnpm db:test:reset` solo **vacía las tablas** (no toca las migraciones); si necesitas rehacerla entera, `pnpm db:test:migrate` aplica las pendientes.

**Si una migración falla a la mitad:** corre `pnpm exec prisma migrate status`. Cada migración se ejecuta en una transacción, así que normalmente no queda nada a medias; corrige el SQL (o los datos que lo bloquean) y vuelve a aplicar. Si la migración quedó marcada como fallida, en desarrollo es más simple un `migrate reset`.

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
