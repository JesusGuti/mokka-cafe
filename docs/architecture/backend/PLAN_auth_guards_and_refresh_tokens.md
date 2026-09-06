# Plan: Guards de autenticación/autorización + refresh tokens — Mokka Café Backend

> Contexto y decisiones cross-cutting (por qué bearer token, por qué RBAC simple, por qué refresh token): ver [`../auth-strategy.md`](../auth-strategy.md). Este documento es solo el **cómo** en el backend.

## Contexto

Estado actual:

- `SignInUseCase` (`src/modules/auth/application/use-cases/sign-in.use-case.ts`) valida credenciales y `isActive`, y firma `{ sub: user.id, role: user.role }` vía `TokenGenerator.sign()` (`JwtTokenGenerator`, wrapper de `@nestjs/jwt`). Expira a los `JWT_EXPIRES_IN_SECONDS` (900 por defecto, `src/config/jwt.config.ts`).
- `TokenGenerator.verify()` existe (`src/modules/auth/domain/ports/token-generator.ts:9`) pero no lo usa nadie — código muerto hoy.
- `AuthController` (`src/modules/auth/infrastructure/http/auth.controller.ts`) solo expone `POST /auth/sign-in`.
- `SignInResponseDto` (`src/modules/auth/infrastructure/http/dto/auth-response-dto.ts`) devuelve únicamente `{ accessToken }`.
- **Cero guards en todo el backend.** `UserController` (`src/modules/users/infrastructure/http/user.controller.ts`) expone `POST /users`, `GET /users`, `GET /users/:id` sin ninguna protección.
- `AuthModule` (`src/modules/auth/auth.module.ts`) registra `JwtModule.registerAsync` con secret/expiry desde config, y liga `TokenGenerator` → `JwtTokenGenerator`.

## Decisiones ya tomadas (no reabrir sin justificación)

- Bearer token vía header `Authorization` (no cookies) — ver `auth-strategy.md`.
- RBAC simple: `@Roles()` + `RolesGuard`, sin claims ni CASL/policies.
- `JwtAuthGuard` **global** (seguro por defecto) con decorador `@Public()` para opt-out explícito — no `@UseGuards()` opt-in por controller, que es como quedó el código hoy y es la razón de que todo esté abierto.
- Refresh token **sin** rotación ni tabla de tokens en DB para v1 — solo re-chequeo de `isActive` en cada refresh. Reabrir esto si en algún momento hace falta poder revocar una sesión específica de forma remota (ej. "cerrar sesión en todos los dispositivos" desde el panel de admin).

## Alcance de la tarea

### 1. `JwtAuthGuard` + decorador `@Public()`

Nuevo archivo `src/modules/auth/infrastructure/guards/jwt-auth.guard.ts`:
- `canActivate()`: extrae el token del header `Authorization: Bearer <token>`, llama `TokenGenerator.verify()`, cuelga el payload en `request.user`. Si falta el header o `verify()` tira, `UnauthorizedException`.
- Antes de verificar, chequea vía `Reflector` si el handler/controller tiene el metadato `IS_PUBLIC_KEY` (seteado por `@Public()`) y si es así, deja pasar sin validar nada.

Decorador `@Public()` en `src/modules/auth/infrastructure/decorators/public.decorator.ts` — `SetMetadata(IS_PUBLIC_KEY, true)`.

Registrar el guard **global** en `AuthModule`:

```ts
providers: [
  // ...lo que ya hay
  { provide: APP_GUARD, useClass: JwtAuthGuard },
],
```

Marcar `POST /auth/sign-in` (y el nuevo `POST /auth/refresh` del punto 4) con `@Public()`.

### 2. Tipado de `request.user`

Nuevo `src/shared/types/express.d.ts` con declaration merging sobre `Express.Request` para que `request.user: AuthTokenPayload` esté tipado en todos lados sin `any`:

```ts
import { AuthTokenPayload } from '@/modules/auth/domain/ports/token-generator';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
```

(Ajustar el import a como corresponda según los alias del proyecto — ver nota de alias en `backend/AGENTS.md`.)

### 3. `RolesGuard` + decorador `@Roles()`

- `@Roles(...roles: UserRole[])` vía `SetMetadata(ROLES_KEY, roles)`.
- `RolesGuard` (`canActivate`): lee los roles requeridos con `Reflector`; si no hay metadato, deja pasar (ruta sin restricción de rol); si hay, compara contra `request.user.role` (ya seteado por `JwtAuthGuard`, que corre antes por estar registrado global).
- Aplicar `@Roles(UserRole.ADMIN)` en `UserController.create` y `UserController.findAll` — son las operaciones que hoy solo usa la pantalla de administración de usuarios del frontend.
- **Pendiente a decidir con el equipo**: `GET /users/:id` — hoy no lo consume ningún flujo del frontend. Dejarlo también `ADMIN`-only por consistencia salvo que aparezca un caso de uso (ej. que un usuario vea su propio perfil) que necesite un chequeo distinto ("es admin O es el propio usuario").

### 4. Endpoint de refresh

- Nueva variable de entorno `REFRESH_JWT_SECRET` (secreto separado del de access token, para que un secreto filtrado no comprometa el otro tipo de token) y `REFRESH_TOKEN_EXPIRES_IN_SECONDS` (proponer algo en el orden de 7-14 días dado el uso en celulares personales) — agregar a `.env`, `.env.example`, `.env.test`, y a `envValidationSchema` (`src/config/env.validation.ts`) siguiendo la convención ya establecida (ver `backend/AGENTS.md`, sección "Variables de entorno").
- Extender `TokenGenerator` (o agregar un segundo port, a decidir según se prefiera un servicio separado `RefreshTokenGenerator` vs. un método extra) con `signRefreshToken`/`verifyRefreshToken`, usando el segundo `JwtService` registrado con el secreto de refresh (Nest permite registrar más de un `JwtModule` con distinto nombre de instancia vía `JwtModule.registerAsync({ ... })` adicional, o instanciar un segundo `JwtService` manualmente — evaluar cuál encaja mejor con el wiring actual de `AuthModule` antes de implementar).
- `SignInUseCase` pasa a devolver también `refreshToken` en `SignInResult` (y `SignInResponseDto`).
- Nuevo `RefreshUseCase` (`src/modules/auth/application/use-cases/refresh.use-case.ts`): verifica el refresh token → busca el usuario por `sub` → si `!isActive`, `UnauthorizedException` → firma y devuelve un access token nuevo (el refresh token no rota en v1, ver decisión de arriba).
- Nuevo endpoint `POST /auth/refresh` en `AuthController`, `@Public()`, con su propio DTO (`refreshToken: string`, `@IsString @IsNotEmpty`).

### 5. Tests

Seguir el patrón ya establecido (`sign-in.use-case.spec.ts`, `token-generator.fake.ts`):
- Unit tests de `JwtAuthGuard` y `RolesGuard` con un `ExecutionContext` mockeado.
- Unit test de `RefreshUseCase` reusando/extendiendo el fake de `TokenGenerator`.
- Actualizar `UserController` specs si existen para reflejar que las rutas ahora exigen rol `ADMIN`.

## Fuera de alcance (explícitamente)

- Rotación de refresh tokens y tabla de tokens en DB para revocación remota instantánea.
- CASL / policy-based authorization (ver `auth-strategy.md`).
- Login social / OAuth.
- Rate limiting de `/auth/sign-in` y `/auth/refresh` (queda como mejora de seguridad futura, no bloqueante para este plan).
