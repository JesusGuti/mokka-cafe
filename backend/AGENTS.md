# Mokka Café — Backend (guía para agentes)

> Contexto de negocio y de producto: ver [`../docs/project-context.md`](../docs/project-context.md). Este archivo es solo sobre **cómo trabajar en este código**.

## Stack

- **Framework:** NestJS 11 (Express)
- **Lenguaje:** TypeScript, `strict` + `recommendedTypeChecked` de typescript-eslint
- **ORM:** Prisma 7 (`@prisma/client`, adapter `pg`), Postgres 16
- **Validación de entorno:** Joi (`src/config/env.validation.ts`)
- **Validación de entrada HTTP:** class-validator / class-transformer (DTOs)
- **Test runner:** Jest (unit) + Supertest (e2e)
- **Gestor de paquetes:** pnpm
- **Formato:** Prettier (`singleQuote`, `trailingComma: all`) vía `eslint-plugin-prettier`

## Comandos

```bash
pnpm docker:up              # levanta Postgres + pgAdmin (docker-compose.yml)
pnpm start:dev               # servidor en watch mode
pnpm lint                    # eslint --fix
pnpm format                  # prettier --write
pnpm test                    # unit tests (jest)
pnpm test:e2e                # e2e (usa NODE_ENV=test + .env.test)
pnpm prisma:migrate:dev      # nueva migración en desarrollo
pnpm prisma:studio           # explorar la DB
```

Antes de dar por terminada una tarea: `pnpm lint`, `pnpm test` y `pnpm build` deben pasar.

## Arquitectura: hexagonal por módulo

Cada dominio de negocio vive en `src/modules/<nombre>/` con tres capas. El módulo `products` es la referencia — cópialo como plantilla al crear uno nuevo.

```
modules/<nombre>/
  domain/
    entities/       # clases de dominio puras (sin Nest, sin Prisma, sin HTTP)
    errors/          # errores de dominio propios (ej. InvalidProductError)
    ports/           # interfaces/abstract classes que la capa de aplicación necesita (ej. ProductRepository)
  application/
    use-cases/       # un caso de uso = una clase con .execute(); orquesta domain + ports
  infrastructure/
    http/
      dto/            # DTOs de entrada/salida con class-validator
      *.controller.ts
    persistence/
      *.mapper.ts     # traduce entre el modelo de Prisma y la entidad de dominio
      prisma-*.repository.ts  # implementa el port usando PrismaService
  <nombre>.module.ts  # wiring: liga el port a su implementación Prisma vía `provide/useClass`
```

**Regla de dependencia (de afuera hacia adentro, nunca al revés):**
`infrastructure` → `application` → `domain`. El dominio no importa nada de Nest, Prisma ni HTTP. Si una entidad de dominio necesita saber que existe Express o Prisma, algo está mal ubicado.

**Patrones a mantener:**
- Entidades con constructor privado + factory `create()` (valida invariantes) y `reconstitute()` (reconstruye desde persistencia sin re-validar). Ver `product.entity.ts`.
- Los repositorios son `abstract class` en `domain/ports`, implementados en `infrastructure/persistence`, e inyectados en el `.module.ts` con `{ provide: XRepository, useClass: PrismaXRepository }`.
- Errores de dominio son clases propias (`InvalidProductError`, `ProductNotFoundError`); el controller los atrapa y los traduce a excepciones HTTP de Nest (`NotFoundException`, etc.) — el dominio nunca lanza excepciones HTTP directamente.
- Dinero como enteros (`priceCents: Int`), nunca floats.
- IDs como `uuid` generados con `randomUUID()` en el use-case, no autoincrementales.

### Agregar un módulo nuevo

1. `domain/entities` + `domain/errors` + `domain/ports` primero, sin ninguna dependencia externa.
2. `application/use-cases`, uno por operación (`create-x.use-case.ts`, `list-x.use-case.ts`...), inyectando el port del repositorio.
3. `infrastructure/persistence` (mapper + repositorio Prisma) e `infrastructure/http` (DTOs + controller).
4. `<nombre>.module.ts` conectando todo; regístralo en `app.module.ts`.
5. Migración Prisma: editar `prisma/schema.prisma` y correr `pnpm prisma:migrate:dev`.

## Testing

- Tests unitarios **colocados** junto al archivo (`*.spec.ts`), no en carpeta aparte.
- Entidades de dominio y use-cases se testean con mocks del port (repositorio) — no tocan la base de datos real. Ver `product.entity.spec.ts` y `create-product.use-case.spec.ts`.
- e2e (`test/*.e2e-spec.ts`) sí usan una base real: `pnpm docker:up` + `pnpm db:test:migrate` antes de `pnpm test:e2e`. Usan `.env.test` (puerto y DB separados de desarrollo).
- Describes e `it` en español, código e identificadores en inglés (convención ya establecida en el repo).

## Variables de entorno

- `.env` (desarrollo) y `.env.test` (e2e) — nunca se commitean (`.gitignore`).
- Todo env var nuevo debe agregarse también a `envValidationSchema` en `src/config/env.validation.ts`; si no está ahí, Nest falla al arrancar. Esto es intencional: preferimos un crash temprano a un `undefined` silencioso en producción.

## Convenciones de código

- DTOs de entrada siempre con class-validator (`class-validator` + `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` global en `main.ts`) — no valides a mano en el controller.
- Nombres de archivo en kebab-case (`create-product.use-case.ts`), clases en PascalCase.
- Tablas Prisma en snake_case vía `@@map` (`@@map("products")`); campos del modelo en camelCase.
- No pongas lógica de negocio en controllers ni en repositorios — vive en entidades de dominio y use-cases.

## Qué evitar como agente

- No agregues ORMs, frameworks HTTP o librerías de estado alternativas sin que el usuario lo pida — el stack ya está decidido.
- No mezcles capas: nada de `PrismaClient` importado dentro de `domain/` o `application/`.
- No corras migraciones destructivas (`prisma migrate reset`, drops) contra `DATABASE_URL` de desarrollo sin confirmar — puede haber datos de prueba que el usuario quiere conservar.
- No quites `whitelist`/`forbidNonWhitelisted` del `ValidationPipe` global para "hacer pasar" un request — corrige el DTO.
- Commits en formato conventional commits (`feat:`, `fix:`, `chore:`, ...), como el resto del repo.
