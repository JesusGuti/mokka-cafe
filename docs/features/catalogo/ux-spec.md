# Catálogo — Especificación UX

**Estado**: Borrador · **Última actualización**: 2026-10-24

Principio rector: **el admin configura una vez con calma; el mesero consume cientos de veces con prisa.** Se optimiza el POS para velocidad y cero ambigüedad, y el admin para claridad y prevención de errores.

## Usuarios y contexto

| Usuario | Dispositivo | Situación | Prioridad de diseño |
|---|---|---|---|
| Admin | Computador / tablet | Sentado, tiempo para pensar, cargas masivas al inicio | Claridad, prevenir errores, carga inicial rápida |
| Mesero | Tablet / celular | De pie, una mano, prisa, interrupciones | Velocidad, objetivos grandes, cero sorpresas |

## Mapa de pantallas

```
/admin/catalogo (nombres de ruta finales a definir según el layout actual)
 ├─ Productos   (pantalla principal: lista + crear/editar)
 ├─ Categorías  (lista + crear/editar)
 ├─ Grupos de opciones (lista + crear/editar, con sus opciones)
 └─ Disponibilidad (lista simple con switches; la ven también cajero y mesero)
/pos            (consumo del menú)
```

Productos es la pantalla de entrada porque es la que más se usa en el día a día (agotados, cambios de precio). Categorías y grupos de opciones son de configuración. "Disponibilidad" es la vista rápida para cualquier rol.

## Flujo 1 — Carga inicial del menú (admin, primer día)

Este es el momento de mayor fricción: hay que cargar 30–100 productos.

1. Admin entra a Productos y ve el **estado vacío** con una guía de 3 pasos: "1. Crea categorías → 2. Crea productos → 3. Agrega extras". Cada paso es un botón.
2. Crea categorías seguidas (el campo queda listo para otra, AC-1.13).
3. En "Nuevo producto", tras guardar aparece la opción **"Guardar y crear otro"** que conserva la categoría elegida (se cargan varios de la misma categoría seguidos).
4. Si falta una categoría, "+ Nueva categoría" dentro del formulario, sin perder lo escrito (AC-1.11).

## Flujo 2 — Operación diaria (admin): "se acabó la leche de avena"

1. Productos → buscar "avena" → **switch "Disponible"** en la fila → un toque, sin diálogo (AC-3.3).
2. Toast: "«Latte Avena» marcado como no disponible · Deshacer".
3. El POS lo refleja en ≤ 30 s.

Cambiar un precio: clic en la fila → formulario → Guardar. La confirmación nombra el producto.

## Flujo 3 — Tomar pedido (mesero)

1. Abre POS: ve categorías arriba y productos en cuadrícula. Categoría "Todos" por defecto.
2. Toca un producto **sin grupos obligatorios** → se agrega (1 toque). Con grupos → panel inferior con cada grupo (radio si elige una, casillas si varias) y precio incremental; "Agregar" siempre visible, deshabilitado mientras falte algo obligatorio y diciendo qué ("Elige un tamaño"). Detalle en AC-4.23–4.27.
3. Un producto agotado se ve atenuado con etiqueta "Agotado" y no responde al toque (o responde con un aviso breve: "Agotado hoy"), nunca silencio (D-13 ✅).

## Pantalla: lista de Productos (admin)

```
Productos                                     [+ Nuevo producto]
[🔍 Buscar por nombre...]  [Categoría ▾]  [Estado: Activos ▾]

 Nombre            Categoría   Precio   Disponible   ⋯
 Capuchino         Calientes    4.80     [●━ Sí]     Editar · Archivar
 Latte Avena       Calientes    5.50     [━○ No]     Editar · Archivar
```

- Filtro de estado: Activos (por defecto) · No disponibles · Archivados.
- Orden por defecto: categoría, luego nombre. Columnas ordenables.
- Acciones de fila visibles (no ocultas tras "⋯" en escritorio); en celular, menú.
- Precio alineado a la derecha, siempre con 2 decimales.
- Estados: skeleton, vacío ("Aún no hay productos" + botón), vacío de búsqueda ("Sin resultados para «xyz» · Limpiar filtros"), error ("No pudimos cargar · Reintentar").

## Formulario de producto

| Campo | Tipo | Notas |
|---|---|---|
| Nombre* | texto | Autofoco al abrir. Máx. 80. |
| Categoría* | select con "+ Nueva" | Preselecciona la última usada. |
| Precio* | numérico con prefijo de moneda | Teclado numérico. Acepta coma o punto. Se formatea a 2 decimales al salir del campo. |
| Descripción | área de texto, contador 200 | Opcional. |
| Disponible | switch | Por defecto: Sí. |
| Grupos de opciones | lista ordenable con resumen ("Tamaño · obligatorio · 3 opciones") y buscador si > 8 | Solo si existen grupos; si no, enlace "Crear grupo de opciones". |

Botones: **Guardar** (primario) · "Guardar y crear otro" (solo en alta) · Cancelar.
Errores: junto al campo, en rojo + ícono (no solo color), foco al primer error al enviar. El botón no se deshabilita por validación previa (confunde); valida al enviar y al salir de cada campo.

## POS: tarjeta de producto

- Objetivo táctil ≥ 44×44 px; en tablet idealmente tarjetas de ≥ 120 px de lado.
- Jerarquía: **nombre** (grande, máx. 2 líneas con elipsis) → **precio** → descripción (pequeña, opcional, 1–2 líneas).
- Estados: normal · presionado (feedback inmediato < 100 ms) · agotado (atenuado + etiqueta "Agotado") · cargando.
- Sin imágenes en esta fase (Q6); el diseño no debe depender de ellas pero dejar espacio para añadirlas luego sin reflow grande.
- Orden estable entre refrescos; la categoría seleccionada se conserva (AC-5.14).

## POS: estados del menú

| Situación | Qué ve el mesero |
|---|---|
| Cargando por primera vez | Skeleton de tabs + tarjetas |
| Cargado | Menú normal |
| Refresco en segundo plano | Nada (sin parpadeo ni spinner) |
| Falla de red con menú previo | Menú previo + aviso discreto "Sin conexión · mostrando menú guardado" |
| Falla de red sin menú previo | Mensaje "No pudimos cargar el menú" + **Reintentar** |
| Menú vacío | "El menú aún no está listo. Avisa al administrador." |
| Categoría sin productos visibles | No se muestra el tab (AC-3.7) |
| Producto pasó a agotado al tocarlo | Aviso breve "«Latte Avena» se agotó", el resto del pedido intacto |

## Textos (voz de la interfaz)

Tono directo, cálido, sin tecnicismos. Ejemplos:

| Situación | Texto |
|---|---|
| Éxito crear | «Latte Vainilla» creado |
| Éxito archivar | «Latte Vainilla» archivado · Deshacer |
| Confirmar archivar | ¿Archivar «Latte Vainilla»? Dejará de aparecer en el POS. Los pedidos anteriores no se afectan. Puedes restaurarlo cuando quieras. · [Archivar] [Cancelar] |
| Categoría con productos | No se puede eliminar «Calientes» porque tiene 4 productos. Muévelos o archívalos primero. |
| Duplicado | Ya existe una categoría con ese nombre |
| Precio inválido | Escribe un precio válido, por ejemplo 4,50 |
| Error genérico | Algo salió mal. Tus datos siguen aquí, intenta guardar de nuevo. |
| Sin permiso | No tienes permiso para esta acción. Si crees que es un error, avisa al administrador. |

Evitar: "Error 500", "Operación fallida", "Entidad", "Registro", "Aceptar".

## Deshacer vs. confirmar

Regla de decisión:
- **Reversible y frecuente** (cambiar disponibilidad) → sin confirmación + **Deshacer** en el toast.
- **Reversible pero con efecto visible** (archivar) → confirmación con explicación + Deshacer.
- **Irreversible** (borrar categoría vacía) → confirmación que nombra el elemento.

## Accesibilidad mínima

- Todo control con etiqueta accesible; switches anuncian su estado ("Disponible, activado").
- Los estados "Agotado" y "Archivado" tienen texto, no solo estilo.
- Diálogos atrapan el foco y lo devuelven al cerrar; Esc cierra.
- Los toasts son anunciados por lectores de pantalla (`role="status"`) y duran lo suficiente para leerse (≥ 5 s, y se pausan al pasar el cursor).
- Respetar `prefers-reduced-motion`.

## Rendimiento percibido

- Mutaciones con actualización optimista solo donde son seguras y reversibles (disponibilidad); se revierten visiblemente si fallan.
- Refresco del menú del POS en segundo plano cada ~30 s y al recuperar foco, sin spinner.
- Los datos del menú se cachean; abrir el POS tras haberlo visitado es instantáneo.
