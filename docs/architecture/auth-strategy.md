# Estrategia de autenticación y autorización — Mokka Café

> Este documento fija el **por qué** de las decisiones cross-cutting de auth. El **cómo** de cada lado vive en su propio plan: [`backend/PLAN_auth_guards_and_refresh_tokens.md`](./backend/PLAN_auth_guards_and_refresh_tokens.md) y [`frontend/PLAN_auth_session_hardening.md`](./frontend/PLAN_auth_session_hardening.md).

## Contexto

Estado actual (antes de este plan):

- **Backend**: `SignInUseCase` (`backend/src/modules/auth/application/use-cases/sign-in.use-case.ts`) firma un JWT con `{ sub, role }` que expira a los 900s (`backend/src/config/jwt.config.ts`). `TokenGenerator.verify()` existe (`backend/src/modules/auth/domain/ports/token-generator.ts`) pero **nada lo llama** — no hay un solo `Guard`, `Strategy` ni `@UseGuards()` en todo el backend. `UserController` (`backend/src/modules/users/infrastructure/http/user.controller.ts`) expone `POST/GET /users` completamente abiertos.
- **Frontend**: el `accessToken` vive en un store de zustand con `persist` → localStorage (`frontend/src/shared/store/auth-store.ts`), inyectado como header `Authorization` por un interceptor de axios (`frontend/src/shared/lib/api/client.ts`). No hay `middleware.ts`, no hay gating de rutas, y el botón "Cerrar sesión" del sidebar (`frontend/src/shared/components/layout/app-sidebar.tsx:75-83`) no tiene handler — es decorativo.

Despliegue: **interno, solo por red local (LAN)**, sin exposición pública. El plan de empaquetado a futuro es un **wrapper nativo** (Electron/Tauri) para desktop (cajero/admin) y mobile (meseros con su propio celular) — hay precedente de este enfoque funcionando bien en otro proyecto para integración de impresora térmica, que es un caso de uso previsto (no inmediato) para Mokka Café.

## Decisión central: bearer token, no cookies de sesión

Se evaluó migrar el `accessToken` a una cookie `httpOnly` (el patrón que recomienda la guía de auth de Next.js). Se descarta por ahora, a favor de mantener y endurecer lo que ya existe (header `Authorization`). Razones:

1. **Multi-cliente futuro**: cookies funcionan perfecto en un browser real (incluida una PWA), pero un wrapper nativo (Electron/Tauri para desktop, o un wrapper de mobile) trae su propio webview con manejo de cookies particular (partición de sesión en Electron, restricciones tipo ITP en WebView nativo). Pelear contra el cookie jar de cada wrapper es costo sin beneficio; un bearer token gestionado explícitamente por la app es el patrón estándar para clientes nativos/de escritorio.
2. **LAN sin HTTPS garantizado**: cookies cross-origin "de verdad" (`SameSite=None`) requieren `Secure`, que requiere HTTPS. Sin exposición pública no hay certificado real en el horizonte cercano. (Dato aparte: `SameSite` se evalúa por sitio registrable, no por puerto, así que frontend/backend en la misma IP de LAN con puertos distintos igual calificarían como *same-site* con `Lax` — pero esto solo importa si en algún momento se reconsidera cookies para el caso PWA puro.)
3. **Menor superficie de cambio**: el mecanismo actual (header + interceptor) ya funciona; se trata de asegurarlo (guards en el backend, gating en el frontend, revocación vía refresh), no de reescribirlo.

Consecuencias de esta decisión:

- **No se implementa `middleware.ts` ni `jose`** por ahora. El único lugar donde `jose` hubiera aportado valor real (verificar firma del JWT en el Edge Runtime de Next.js, donde `jsonwebtoken`/`@nestjs/jwt` no corre) depende de que el token esté en una cookie legible por el middleware — sin cookie, el middleware no tiene nada que inspeccionar (no tiene acceso a `localStorage`). El gating de rutas se resuelve client-side (ver plan de frontend), y la autoridad real de autorización sigue siendo siempre el backend.
- **No se arma un proxy/BFF** entre el frontend y NestJS — se mantiene la llamada directa browser → axios → Nest ya documentada en `frontend/AGENTS.md`.
- El **storage del token en el frontend queda abstraído** detrás de `persist` de zustand (`auth-store.ts`) a propósito: es el único punto que habrá que tocar el día que se defina el wrapper nativo (cambiar `localStorage` por el secure storage del wrapper — `safeStorage` en Electron, storage del lado Rust en Tauri). No se implementa esa migración ahora; solo se preserva el corte limpio para no pagarla dos veces.

## RBAC simple, no claims ni policies

Con 3 roles fijos (`MESERO`, `CAJERO`, `ADMIN`, `backend/prisma/schema.prisma`) y reglas de acceso binarias ("¿puede administrar usuarios sí o no?"), alcanza con `@Roles()` + un `RolesGuard` leyendo el rol del JWT. Se descartan por sobre-ingeniería para el tamaño actual:

- **Claims-based authorization** (permisos finos tipo `users:create` en vez de un rol fijo) — útil cuando dos roles necesitan compartir un permiso puntual sin heredarse todos los del otro. No hay ese caso hoy.
- **Policies / CASL** — útiles para reglas a nivel de instancia ("un mesero puede cancelar *sus propios* pedidos"), que son ABAC, no RBAC. Si aparece una regla así, se resuelve puntual dentro del use-case (`if (order.waiterId !== currentUser.sub) throw ForbiddenException`) antes de justificar traer una librería de policies.

## Revocación: por qué sí conviene un refresh token

Ya existe `isActive: Boolean` en `User`. Con un access token puramente stateless, desactivar a alguien no corta su acceso hasta que el token expire por sí solo. Esto importa más de lo habitual acá porque los meseros van a loguearse desde **su propio celular** — pérdida/robo de dispositivo o baja de personal son escenarios reales, no hipotéticos.

Se resuelve sin necesidad de infraestructura pesada: access token corto (15 min, sin cambios) + refresh token de mayor duración que **re-chequea `isActive` contra la DB en cada uso**. Eso acota la ventana de "usuario desactivado pero todavía con acceso" al tiempo entre refreshes, sin necesitar rotación de tokens ni una tabla de tokens revocados en v1 (se puede sumar después si hace falta invalidar sesiones específicas de forma remota).

## Documentos relacionados

- [`backend/PLAN_auth_guards_and_refresh_tokens.md`](./backend/PLAN_auth_guards_and_refresh_tokens.md) — guards, `@Roles()`, endpoint de refresh.
- [`frontend/PLAN_auth_session_hardening.md`](./frontend/PLAN_auth_session_hardening.md) — gating de rutas, logout real, limpieza del redirect de 401.
