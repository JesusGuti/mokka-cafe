# Plan: Integración de TanStack Query + Capa de API con Axios — Mokka Café Frontend

## Contexto

Mokka Café es un sistema POS + KDS para operación interna de cafetería (dine-in únicamente por ahora, pedidos online quedan fuera de scope pero contemplados a futuro). Stack actual del frontend:

- Next.js (App Router, `src/`)
- pnpm
- shadcn/ui (motor Base UI) + Tailwind CSS
- react-hook-form + zod
- axios
- zustand

Backend: NestJS (repo separado `mokka-cafe-backend`).

## Objetivo de esta tarea

Establecer la capa de comunicación con el backend de forma estandarizada:
1. Axios como cliente HTTP, con una capa de abstracción por feature.
2. TanStack Query (`@tanstack/react-query`) para manejo de server-state (cache, refetch, polling, invalidación).
3. Dejar Zustand exclusivamente para estado de cliente/UI (no server-state), evitando solapamiento de responsabilidades.

Esto es crítico para el KDS, que necesita reflejar pedidos nuevos y cambios de estado sin recarga manual.

## Decisiones ya tomadas (no reabrir sin justificación)

- `fetch` nativo de Next.js se reserva para Server Components donde se aproveche cache/revalidación de Next (ej. reportes, dashboards de solo lectura).
- Axios se usa para toda interacción desde Client Components (tomar pedidos, cambiar estados, KDS, inventario).
- TanStack Query envuelve las llamadas de axios para todo lo que sea server-state.
- Polling (`refetchInterval`) es suficiente para el MVP del KDS; WebSockets con NestJS queda como mejora futura, no se implementa ahora.
- Server Actions de Next.js no se usan para hablar con el backend: el backend es NestJS separado, así que una Server Action solo agregaría un salto extra (browser → Server Action → NestJS) sin evitar la llamada de red real. El cliente llama a NestJS directo vía axios.
- Para la carga inicial de pantallas interactivas (POS, KDS) se usa el patrón de prefetch + hydration: un Server Component hace `prefetchQuery` y pasa el estado a `HydrationBoundary`, y el Client Component toma control con `useQuery` (+ polling) después del mount. Esto evita spinner en el primer render sin renunciar a TanStack Query para el resto del ciclo de vida.

## Alcance de la tarea

### 1. Instalación de dependencias

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

### 2. Cliente de axios

Crear `src/lib/api/client.ts`:
- Instancia de axios con `baseURL` desde `NEXT_PUBLIC_API_URL`.
- Interceptor de request: adjuntar token de auth desde el store de zustand.
- Interceptor de response: manejo centralizado de 401 (logout / redirect a login). El logout debe limpiar tanto el store de zustand como el cache de TanStack Query (`queryClient.clear()`) — en un terminal compartido (mesero → cajero) no debe quedar data de la sesión anterior visible tras el cambio de usuario.
- Timeout razonable (ej. 10s).

### 3. QueryClient Provider

Crear `src/app/providers.tsx` (Client Component) que envuelva la app con `QueryClientProvider`, y montarlo en el layout raíz. Configurar defaults razonables:
- `staleTime` bajo para datos operativos (pedidos activos, KDS).
- `retry` **diferenciado por tipo**: algo de retry en queries de lectura (polling del KDS puede tolerar un reintento ante un fallo de red puntual), pero `retry: false` (o casi) en mutations — reintentar automáticamente crear pedido o cobrar puede duplicar la operación, no es aceptable en un POS.
- Incluir `ReactQueryDevtools` solo en desarrollo, con import dinámico condicionado a `process.env.NODE_ENV !== "production"` — no basta con "agregarlo solo en dev" a nivel de código fuente, hay que verificar que efectivamente no termine en el bundle de producción.
- Usar el patrón de `HydrationBoundary` (ver nota en "Decisiones ya tomadas") para las pantallas que arrancan con un Server Component que hace `prefetchQuery`.

### 4. Estructura de la capa de API por feature

```
src/lib/api/
  client.ts
  orders.api.ts
  inventory.api.ts
  auth.api.ts
  discounts.api.ts
```

Cada archivo `*.api.ts` expone funciones puras que llaman a `apiClient` y regresan datos tipados (usar los tipos/DTOs ya definidos o por definir junto al backend).

### 5. Hooks de TanStack Query por feature

Ubicarlos junto a cada feature, siguiendo la estructura feature-based ya establecida:

```
src/components/features/orders/hooks/
  useActiveOrders.ts     (query, con polling para KDS)
  useCreateOrder.ts       (mutation)
  useUpdateOrderStatus.ts (mutation, con invalidación de ["orders","active"])

src/components/features/inventory/hooks/
  useIngredients.ts
  useInventoryMovement.ts (mutation)
```

Convenciones:
- `queryKey` jerárquico y consistente: `["orders", "active"]`, `["inventory", "ingredients"]`, etc.
- Mutations invalidan las queries relacionadas al hacer `onSuccess`.
- Hooks de polling (KDS) documentan explícitamente el intervalo elegido y por qué.

### 6. Separación de responsabilidades (documentar en AGENTS.md / PROJECT_CONTEXT.md)

- **Zustand**: estado de cliente puro — sesión de usuario actual, carrito/orden en construcción antes de enviarse, preferencias de UI.
- **TanStack Query**: todo lo que viene o se sincroniza con el backend — pedidos, inventario, descuentos, catálogo de productos.
- No duplicar datos de servidor en stores de zustand "por conveniencia" — evitar que se desincronicen.

### 7. Entregable esperado

- Dependencias instaladas y provider montado.
- Capa `lib/api/` con al menos `client.ts` y `orders.api.ts` funcionando end-to-end contra un endpoint de prueba (o mock si el backend aún no expone el endpoint real).
- Un hook de ejemplo (`useActiveOrders`) demostrando polling.
- Actualizar `PROJECT_CONTEXT.md` / `AGENTS.md` con esta decisión de arquitectura (fetch vs axios vs TanStack Query, y la separación zustand/server-state) para que quede como contexto persistente del proyecto.

## Fuera de alcance (explícitamente, para no scope-creep)

- WebSockets / actualizaciones en tiempo real vía socket — queda para después del MVP.
- Pedidos online / delivery / takeout.
- Cualquier lógica de negocio de inventario o descuentos más allá de exponer las llamadas API necesarias para probar la capa.
