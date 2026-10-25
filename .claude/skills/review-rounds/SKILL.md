---
name: review-rounds
description: Revisa el diff de la rama actual por rondas y guarda los hallazgos en un .md con IDs estables (B1, D1...), severidad, certeza y tipo (bloqueante o deuda técnica). Úsala cuando el usuario pida una review "por rondas", "otra ronda", "revisar con IDs" o "ver qué queda abierto de la review". Para una revisión rápida de una sola vez sin archivo, usa /code-review.
---

# review-rounds

Review del diff de la rama actual contra su rama base, persistida en un archivo para poder hacer varias rondas sin perder el hilo ni reabrir lo ya cerrado.

## Archivo

`.claude/reviews/<rama-con-/-reemplazado-por-->.md` (ej. `feat/inventory-01` → `feat-inventory-01.md`). La carpeta está en `.gitignore`: es de trabajo, no se commitea. Si el archivo no existe, la ronda es la 1; si existe, es la siguiente.

## Flujo de cada ronda

1. **Leer el archivo previo** (si existe). Los hallazgos `abierto` y `diferido` son el punto de partida.
2. **Obtener el diff**: `git diff <base>...HEAD` (base = `develop`, o la que indique el usuario) más los archivos sin trackear. Si el usuario pegó la salida de `/code-review`, úsala como candidatos adicionales.
3. **Revalidar los hallazgos previos contra el código actual**. Para cada uno `abierto`: si el problema ya no existe, pasa a `resuelto` (anota la ronda); si sigue, queda `abierto`. No cierres nada sin haber leído el código.
4. **Buscar hallazgos nuevos** en el diff. Antes de registrar uno, **verifícalo leyendo el código** (y corriendo lo que haga falta); descarta los que no se sostengan. No registres lo que ya existe en el archivo con otro ID.
5. **Escribir/actualizar el archivo** y mostrar al usuario solo el resumen de la ronda (ver abajo), no el archivo entero.
6. **No corregir nada** salvo que el usuario lo pida después, citando IDs.

## IDs

- `B<n>` bloqueante, `D<n>` deuda técnica. Numeración correlativa por tipo (`B1`, `B2`, `D1`...), **estable entre rondas**: un hallazgo conserva su ID hasta cerrarse, y un ID nunca se reutiliza.
- Si un hallazgo cambia de tipo (una deuda resulta bloqueante), conserva el ID y anota el cambio en `Notas`.

## Clasificación

- **Tipo**
  - *Bloqueante*: bug de correctitud, pérdida o corrupción de datos, falla de seguridad, o rompe el contrato con el backend. No debería mergearse así.
  - *Deuda técnica*: mejora real pero que puede ir en otro PR (tipos imprecisos, duplicación, nombres, cobertura).
- **Severidad**: alta (afecta a usuarios o datos), media, baja.
- **Certeza**: *confirmado* (reproducido o demostrado en el código) o *plausible* (razonable pero depende de algo no verificado, como el comportamiento del backend). Un hallazgo plausible indica **qué falta verificar**.

No inventes hallazgos para llenar la lista: una ronda sin hallazgos nuevos es un resultado válido.

## Formato del archivo

```markdown
# Review: <rama>
Base: develop · Última ronda: 2

## Resumen
| ID | Sev. | Certeza | Estado | Título |
|----|------|---------|--------|--------|
| B1 | alta | confirmado | resuelto (R2) | Payload sin trim |
| D1 | baja | plausible | abierto | createdAt tipado como Date |

## Hallazgos

### B1 — Payload sin trim
- **Tipo**: bloqueante · **Severidad**: alta · **Certeza**: confirmado
- **Ubicación**: `ruta/archivo.tsx:117`
- **Problema**: una frase.
- **Escenario**: entrada concreta → resultado erróneo.
- **Sugerencia**: qué cambiar.
- **Estado**: resuelto · **Abierto en**: R1 · **Cerrado en**: R2
- **Notas**: (opcional)

## Historial de rondas
- R1 (YYYY-MM-DD): 5 nuevos (2 B, 3 D).
- R2 (YYYY-MM-DD): 1 resuelto, 1 nuevo.
```

Estados: `abierto`, `resuelto`, `descartado` (era falso positivo, di por qué en `Notas`), `diferido` (se acepta como deuda para otro PR, anota dónde: ticket o PR).

## Resumen al usuario

Al terminar la ronda responde con: número de ronda, conteos (nuevos / resueltos / abiertos, separando bloqueantes y deuda), la tabla de los hallazgos abiertos y la ruta del archivo. Si hay bloqueantes abiertos, dilo primero. Cierra preguntando qué IDs quiere atacar.
