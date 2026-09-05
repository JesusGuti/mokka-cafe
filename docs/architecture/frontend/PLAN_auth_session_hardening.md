# Plan: Hardening de sesión (auth) — Mokka Café Frontend

> Contexto y decisiones cross-cutting (por qué bearer token y no cookies, por qué no middleware/`jose` por ahora): ver [`../auth-strategy.md`](../auth-strategy.md). Este documento es solo el **cómo** en el frontend.

## Contexto

Estado actual:

- El `accessToken` vive en `useAuthStore` (`src/shared/store/auth-store.ts`), un store de zustand con `persist` → localStorage (key `"mokka-auth"`). Expone `accessToken`, `hasHydrated`, `setAccessToken`, `clearSession`.
- `apiClient` (`src/shared/lib/api/client.ts`) adjunta el header `Authorization: Bearer <token>` en el interceptor de request (líneas 11-19), y en el interceptor de response, ante un 401, limpia el store + el cache de TanStack Query y fuerza `window.location.href = "/login"` (líneas 21-35) — esto ya generó el warning de lint `@next/next/no-location-assign-relative-destination`.
- **No hay gating de rutas de ningún tipo.** Nada impide entrar a `/usuarios` o `/pos` sin sesión — hoy simplemente fallarían las llamadas a la API (401) y recién ahí actuaría el interceptor.
- El botón "Cerrar sesión" del sidebar (`src/shared/components/layout/app-sidebar.tsx:75-83`) **no tiene `onClick`** — es puramente decorativo hoy.
- `(dashboard)/layout.tsx` es un Server Component (sin `"use client"`) que envuelve `{children}` con providers de UI (sidebar, tooltip, toaster) — no toca datos ni sesión.

## Decisiones ya tomadas (no reabrir sin justificación)

- Se mantiene el token en `Authorization` header, gestionado 100% client-side — no se migra a cookies (ver `auth-strategy.md`).
- No se agrega `middleware.ts` ni `jose` por ahora — el gating de rutas es client-side.
- El storage detrás de `persist` (hoy `localStorage`) se deja como está — es el punto de extensión para cuando se defina el wrapper nativo (Electron/Tauri), pero esa migración no es parte de este plan.

## Alcance de la tarea

### 1. `AuthGate`: gating de rutas client-side

Nuevo `src/shared/components/auth/auth-gate.tsx` (`"use client"`):
- Lee `accessToken` y `hasHydrated` de `useAuthStore`.
- Mientras `!hasHydrated`, renderiza un estado de carga mínimo (evita un falso negativo: zustand+persist hidrata de forma asíncrona, así que justo después del mount `accessToken` puede aparecer `null` un instante aunque sí haya sesión guardada).
- Una vez hidratado, si no hay `accessToken`, `router.replace("/login")`.
- Envolver `{children}` con `<AuthGate>` dentro de `(dashboard)/layout.tsx` (que sigue siendo Server Component — `AuthGate` es el único Client Component nuevo en el árbol, composición estándar de Next.js).
- Esto es una mejora de UX (evita el flash de una pantalla protegida antes de que la primera request falle con 401), **no** el mecanismo de seguridad real — esa autoridad sigue siendo siempre el backend vía los guards del plan de backend.

### 2. Reemplazar el redirect duro del interceptor de 401

El interceptor de axios (`client.ts`) no es un componente React — no puede llamar `useRouter()` directamente, por eso hoy usa `window.location.href`. Opciones a evaluar (elegir una antes de implementar, no es una decisión puramente técnica: la (a) fuerza un full reload que descarta cualquier estado en memoria no persistido, la (b) es una navegación SPA más prolija pero requiere una pieza de wiring extra):

- **(a)** Dejar `window.location.href`, pero documentar explícitamente que es intencional (forzar reload completo tras un 401 real, para no arrastrar ningún estado en memoria de la sesión anterior en un terminal compartido) y resolver el warning de lint con la alternativa que sugiere el propio mensaje si aplica a este caso.
- **(b)** Exponer una función de navegación seteada una única vez desde un Client Component raíz (ej. guardar la instancia de `router` de `useRouter()` en un módulo compartido dentro de un `useEffect`, o disparar un evento custom que un listener en el root escuche y traduzca a `router.push`), para que el interceptor navegue vía Next Router sin recargar la página completa.

### 3. Logout real

- Agregar `onClick` al botón "Cerrar sesión" (`app-sidebar.tsx`): llama `clearSession()`, `getQueryClient().clear()` (mismo criterio que ya aplica el interceptor de 401 — no debe quedar data de la sesión anterior visible en un terminal compartido), y navega a `/login`.
- Limitación conocida a documentar en el código: con el refresh token sin tabla en DB (ver plan de backend), este logout solo limpia el estado del cliente — el refresh token emitido sigue siendo criptográficamente válido hasta su expiración natural si alguien lo capturó antes del logout. Aceptable para v1 según lo acordado en `auth-strategy.md`; reabrir si se suma una tabla de refresh tokens revocables.

### 4. Consumir el refresh token

Una vez exista `POST /auth/refresh` en el backend:
- `useAuthStore` suma `refreshToken` junto a `accessToken`.
- `use-sign-in.ts` guarda ambos tras un login exitoso.
- Nuevo interceptor (o extensión del de response) que, ante un 401, intente `POST /auth/refresh` antes de forzar logout — solo si hay `refreshToken` disponible; si el refresh también falla (401), recién ahí `clearSession()` + redirect a `/login` como hoy.

## Fuera de alcance (explícitamente)

- `middleware.ts` / verificación de JWT con `jose` en el Edge Runtime (ver `auth-strategy.md` para el porqué).
- Proxy/BFF entre el frontend y NestJS.
- Migración del storage de zustand a un secure storage de wrapper nativo — se hace cuando se defina el empaquetado, no ahora.
- Rotación de refresh token / invalidación remota de sesiones específicas.
