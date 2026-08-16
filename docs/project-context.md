# Mokka Café — Contexto del Proyecto

> Este documento resume las decisiones clave del proyecto para dar contexto rápido a cualquier persona (o herramienta de IA) que retome el desarrollo. Mantenerlo actualizado a medida que se toman nuevas decisiones o se resuelven preguntas pendientes.
>
> Este archivo cubre **negocio y producto**. Convenciones de código, arquitectura y buenas prácticas de desarrollo viven en `frontend/AGENTS.md` y `backend/AGENTS.md` (cada uno en la raíz de su proyecto) para no duplicar información entre este documento y el código.

---

## 1. Objetivo del producto

Construir un **sistema de gestión personalizado para una cafetería** (Mokka Café) que reemplace soluciones de suscripción tipo Mercat, dando control total sobre:

- Toma y gestión de pedidos
- Cobro/pagos
- Inventario de ingredientes/insumos

**Motivación principal:** evitar comisiones por venta y dependencia de plataformas externas, a cambio de invertir en un desarrollo a medida.

---

## 2. Alcance actual (MVP)

### Dentro del alcance ahora

- Pedidos tomados por **mesero** (no hay pedido por QR desde la mesa todavía)
- Un pedido puede incluir varios productos de una vez, y se pueden agregar más productos después de una "ronda" ya cobrada
- Notas especiales por producto (ej. "leche deslactosada")
- División de cuenta en casos excepcionales (no es el flujo principal)
- Pago **al final** (no antes de recibir el pedido), en caja, aceptando **efectivo y QR**
- Propina: no manejada formalmente hoy, pero se acepta si el cliente la da
- Inventario **granular por ingrediente/insumo** (café, leche, vasos), no solo por producto terminado
- Registro de movimientos de inventario (auditoría de entradas/salidas)
- Descuentos aplicados **por producto individual** cuando está próximo a vencerse (no son promociones generales)
- Productos no vendidos al final del día se **guardan para el día siguiente** (no se descartan automáticamente)

### Fuera de alcance por ahora (pero con la puerta abierta a futuro)

- Pedidos para llevar (_para-llevar_) y delivery — **no existen hoy**, pero el modelo de datos debe soportarlos desde el inicio (`orderType`) para evitar refactors costosos
- Integración con plataformas tipo Mercat/delivery externo
- Cobro de propina formal
- Multi-sucursal

### Pendiente de confirmar con el cliente

- Si el descuento de stock por venta es automático o manual (respuesta ilegible en notas, repreguntar)
- Detalles de registro de proveedores y frecuencia de compras (respuesta ilegible en notas, repreguntar)
- Naturaleza exacta del pago QR en mesa (¿link generado por el sistema o QR fijo del negocio escaneado por la app del cliente?)
- Timeline real para delivery/para-llevar (¿meses? ¿años?) — ayuda a decidir cuánto preparar el modelo desde ya
- Si modificar/cancelar un pedido después de creado es una necesidad real o simplemente no ha pasado
- Alertas de stock mínimo
- Si las recetas (cantidad de cada ingrediente por producto) ya están definidas por el cliente o hay que ayudarles a definirlas
- Roles y permisos: qué puede hacer un mesero vs. un admin (ej. ¿quién aplica descuentos por vencimiento?)
- Reporte de mermas/pérdidas por vencimiento

---

## 3. Estados del pedido

Flujo confirmado con el cliente:

```
recibido → en preparación → listo → entregado
```

---

## 4. Decisiones de arquitectura

### Repositorios

- **Un solo repositorio** (`github.com/JesusGuti/mokka-cafe`) con `frontend/` y `backend/` como carpetas normales — no dos repos separados, y no un monorepo con tooling propio (sin Turborepo/workspaces; cada carpeta se instala y corre de forma independiente, ver sus respectivos `README.md`)
- Nota: la decisión original (documentada antes acá) era usar dos repositorios separados; en la práctica el proyecto se armó como uno solo. Si en algún momento se separan de verdad, esta sección y los templates de `.github/` deben actualizarse.
- Implicación práctica: `.github/` (templates de PR/issues, CI si se agrega) vive en la raíz del repo — GitHub no reconoce `.github/` dentro de subcarpetas.

### Frontend

| Aspecto                     | Decisión                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| Framework                   | Next.js (App Router)                                                                     |
| Lenguaje                    | TypeScript                                                                               |
| UI                          | shadcn/ui (usa **Base UI** como motor por defecto desde jul. 2026, antes era Radix)      |
| Estilos                     | Tailwind CSS                                                                             |
| Gestor de paquetes          | pnpm                                                                                     |
| Estructura                  | `src/` directory                                                                         |
| Rutas                       | Route groups: `(public)`, `(auth)`, `(dashboard)`                                        |
| Organización de componentes | `shared/components/ui` (shadcn), `shared/components/layout`, `features/{menu,orders,admin,...}` |
| Otras carpetas              | `shared/hooks/`, `shared/lib/` (incl. `validations/`), `shared/types/`, `features/<f>/api/` |
| Formularios/validación      | react-hook-form + zod                                                                    |
| HTTP client                 | axios                                                                                    |
| Estado global (si aplica)   | zustand                                                                                  |

Guía detallada de convenciones y buenas prácticas: [`../frontend/AGENTS.md`](../frontend/AGENTS.md).

### Backend

| Aspecto             | Decisión                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| Framework            | NestJS 11                                                                 |
| Lenguaje             | TypeScript                                                                |
| Arquitectura         | Hexagonal por módulo (`domain` / `application` / `infrastructure`), un módulo por dominio de negocio (ej. `products`) |
| ORM / DB             | Prisma 7 + Postgres 16 (vía `docker-compose`)                            |
| Validación de entrada | class-validator / class-transformer (DTOs), `ValidationPipe` global      |
| Validación de entorno | Joi                                                                       |
| Gestor de paquetes    | pnpm                                                                      |
| Tests                 | Jest (unit, colocados junto al código) + Supertest (e2e contra DB real)  |

Guía detallada de convenciones y buenas prácticas: [`../backend/AGENTS.md`](../backend/AGENTS.md).

### Modelo de datos — decisiones clave

- El modelo `Order` debe incluir un campo **`orderType`** desde el inicio (ej. `dine-in`, y en el futuro `takeaway`, `delivery`) para no requerir refactor cuando se agreguen esos tipos
- Inventario modelado a nivel de **ingrediente**, no solo producto terminado, con soporte para:
  - Movimientos auditables (entradas/salidas de stock)
  - Relación producto → receta → ingredientes (para descuento granular)
  - Descuentos aplicables por producto individual (ej. por proximidad a vencimiento)

---

## 5. Qué falta (próximos pasos)

1. ~~Definir stack y estructura del backend~~ — hecho (NestJS + hexagonal + Prisma/Postgres, ver §4)
2. Resolver las preguntas pendientes de la sección 2 con el cliente
3. Diseñar el modelo de datos (`Order`, `OrderItem`, `Product`, `Ingredient`, `Recipe`, `InventoryMovement`, `Table`, `User`/roles) — hoy solo existe `Product` en `prisma/schema.prisma`
4. Definir roles y permisos (mesero, cajero, admin)
5. Construir primeras pantallas del frontend (menú, toma de pedido, estado del pedido)
6. Definir cómo se van a manejar los pagos QR (proveedor/pasarela)

---

## 6. Glosario rápido de contexto (por si retoma alguien nuevo)

- **Mercat**: plataforma de referencia (competencia/inspiración) para restaurantes — pedidos online sin comisión por venta, a cambio de suscripción fija. Se usó como punto de comparación, no se va a usar directamente.
- **Base UI**: librería headless de componentes que ahora usa shadcn/ui por defecto (reemplazó a Radix UI en jul. 2026). No cambia el flujo de trabajo del desarrollador, solo el motor interno de los componentes.

---

_Última actualización: 16 de agosto de 2026 (corregido §4: es un solo repositorio, no dos separados como se había documentado; agregados templates de PR/issues en `.github/`)_
