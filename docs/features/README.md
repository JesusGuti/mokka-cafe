# Features — Mokka Café

Una carpeta por funcionalidad. Cada carpeta responde, en documentos cortos y separados, a: **qué** se construye, **por qué** se hizo así, **cómo sabemos que está bien** y **qué queda abierto**.

> Los documentos transversales (contexto de negocio, modelo de datos, estrategia de auth) siguen en `docs/`. Los `PLAN_*` de implementación técnica siguen en `docs/architecture/`. Acá vive todo lo que es específico de una funcionalidad.

## Índice

| Feature | Épica del backlog | Estado |
|---|---|---|
| [catalogo](./catalogo/README.md) | E2 (E2.0–E2.8) | ✅ Planeada, lista para iniciar |

Pendientes de crear cuando toque su turno: `mesas` (E3), `pedidos` (E4), `cocina` (E5), `cobro` (E6), `inventario` (E7; ya hay código de E7.1 sin carpeta de feature).

## Estructura de una carpeta de feature

| Archivo | Para qué sirve | Quién lo lee |
|---|---|---|
| `README.md` | Resumen, alcance (dentro/fuera), HU incluidas, estado, links a los demás docs | Todos, primero |
| `decisions.md` | Decisiones tomadas y **por qué** (formato ADR corto: contexto → decisión → alternativas → consecuencias) | Quien mantenga el código en 6 meses |
| `acceptance-criteria.md` | Criterios de aceptación por HU (funcionales, bordes, UX/accesibilidad) | Dev antes de empezar, QA al validar |
| `test-plan.md` | Cómo se prueba: capas (unit/e2e/Playwright), matriz de casos, datos de prueba, checklist de regresión | Dev y QA |
| `ux-spec.md` | Flujos, estados de pantalla, textos, reglas de interacción | Dev frontend, diseño |
| `api-contract.md` | Endpoints, roles, payloads, errores | Dev backend y frontend |
| `open-questions.md` | Preguntas sin responder, quién debe responderlas y qué bloquean | Quien hable con el cliente |

Archivos opcionales según la feature: `data-model.md` (si cambia el schema), `rollout.md` (migraciones de datos, seeds, feature flags), `runbook.md` (qué hacer si falla en producción).

## Reglas de mantenimiento

1. Cada doc lleva al inicio `Estado` y `Última actualización`.
2. Una decisión nueva se **agrega** a `decisions.md`; una decisión revertida se marca `Reemplazada por D-N`, no se borra.
3. Un criterio de aceptación cambia solo junto con su HU en `docs/backlog.md`.
4. Al cerrar una pregunta de `open-questions.md`, mover la respuesta a `decisions.md` y dejar el link.
5. Al mergear la feature, actualizar el `Estado` del índice y la sección "Estado actual" de `docs/backlog.md`.
