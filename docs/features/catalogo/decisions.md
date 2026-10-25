# Catálogo — Decisiones

**Última actualización**: 2026-10-24

Estados: ✅ Tomada · 🟡 Propuesta (recomendada, falta confirmar) · ❌ Reemplazada.

---

## D-1 ✅ Precios como enteros en centavos
- **Contexto**: el schema ya usa `priceCents Int`. El mock del POS también.
- **Decisión**: toda la API y la base manejan enteros. La conversión a texto ("4.50") ocurre solo en el borde del frontend, con un único helper.
- **Alternativas**: `Decimal` / `float`. Descartadas: errores de redondeo en totales y propinas.
- **Consecuencias**: el input de precio del admin debe parsear `"4.5"`, `"4,50"` y `"4"` sin errores de punto flotante (ver criterios AC-2.2).

## D-2 ✅ Los productos se archivan, no se borran
- **Contexto**: `OrderItem → Product` es `onDelete: Restrict`. Una vez que un producto se vendió, un `DELETE` real falla. Además, `isAvailable` significa "agotado hoy", no "ya no lo vendemos".
- **Decisión recomendada**: agregar `archivedAt DateTime?` a `Product` (migración). "Eliminar" en la UI = archivar: desaparece del admin por defecto y del POS, conserva historial. Un producto nunca vendido se podría borrar de verdad, pero tener dos comportamientos confunde; se archiva siempre.
- **Alternativas**:
  - A) Solo `DELETE` con `409` si hay historial y sugerir "no disponible". Sin migración, pero el menú se llena de productos "no disponibles" permanentes y el mesero los ve atenuados.
  - B) Reutilizar `isAvailable` para ambos casos. Mezcla dos conceptos con ciclos distintos (agotado hoy vs. descontinuado).
- **Consecuencias**: el listado admin necesita filtro "Archivados"; hay que poder **restaurar**. Mismo criterio aplica a `Modifier` (ya tiene `isActive`, no requiere migración).

## D-3 ✅ Categorías: no se borran si tienen productos
- **Contexto**: `Product → ProductCategory` es `Restrict`.
- **Decisión recomendada**: `DELETE` devuelve `409` con la cantidad de productos asociados; el mensaje en UI dice qué hacer ("Mueve o archiva los 4 productos primero"). Categoría vacía sí se puede borrar de verdad.
- **Alternativa**: reasignar productos en masa al borrar. Más cómodo, más riesgo de error silencioso. Se puede añadir después sin romper el contrato.

## D-4 ✅ Unicidad de nombre insensible a mayúsculas y espacios
- **Contexto**: `ProductCategory.name` es `@unique` pero Postgres lo compara sensible a mayúsculas: "Calientes" y "calientes" convivirían y el POS mostraría dos tabs casi iguales.
- **Decisión**: el caso de uso normaliza (`trim`, espacios internos colapsados) y valida duplicado comparando en minúsculas, devolviendo `409`. Se conserva el texto tal como lo escribió el admin.
- **Consecuencias**: hay condición de carrera entre dos admins simultáneos; para cerrarla de verdad se necesita índice único funcional (`lower(name)`) en una migración SQL manual. Recomendado, bajo costo.

## D-5 ✅ Producto: nombre único por categoría
- **Contexto**: el schema no restringe nombre de producto. Dos "Latte" iguales en la misma categoría hacen que el mesero se equivoque.
- **Decisión recomendada**: único (case-insensitive) dentro de la misma categoría. Mismo nombre en categorías distintas es válido ("Té frío" y "Té caliente" suelen compartir nombre base).
- **Consecuencias**: requiere índice funcional (ver D-4). Si el cliente prefiere libertad total, se omite sin costo.

## D-6 ✅ Endpoint dedicado de menú para el POS
- **Contexto**: el POS necesita categorías con sus productos disponibles y modificadores activos en una sola carga; el admin necesita listados paginables con filtros y archivados.
- **Decisión**: `GET /menu` (solo lectura, ya filtrado y agrupado) separado de los CRUD admin.
- **Alternativas**: que el POS ensamble con 3 llamadas y filtre en el cliente. Más lento en tablet, y la regla "qué se muestra" quedaría duplicada en el frontend.
- **Consecuencias**: la regla de visibilidad vive solo en backend (producto visible = `isAvailable` ∧ no archivado ∧ categoría existente).

## D-7 ✅ Disponibilidad se valida otra vez al crear el pedido
- **Contexto**: un admin puede marcar "no disponible" mientras el mesero tiene el POS abierto con datos viejos.
- **Decisión**: el POS refresca el menú periódicamente y al recuperar foco, **pero la fuente de verdad es el backend**: E4.2 rechazará agregar un producto no disponible. Registrado acá para que E4 lo herede.
- **Consecuencias**: el POS debe manejar el error "ya no disponible" sin perder el resto del pedido (ver ux-spec).

## D-8 ✅ Orden de categorías y productos en el POS
- **Contexto**: el schema no tiene `sortOrder`. El orden alfabético no refleja cómo se usa una cafetería (bebidas calientes primero, no "Dulces" primero).
- **Decisión recomendada (revisada 2026-10-24)**: agregar `sortOrder Int` a `ProductCategory` y a `Product`. El mesero aprende el menú por **posición** (memoria muscular); con orden alfabético, cada producto nuevo desplaza a los demás. Es además lo que hacen los POS comerciales.
- **Alcance**: producto/categoría nuevo entra al final; el admin reordena con botones subir/bajar (arrastrar y soltar queda como mejora). El orden de `GET /menu` es `sortOrder` y luego nombre como desempate. Suma ~3 pts a E2 (HU E2.6). Confirmada 2026-10-24.
- **Nota**: la columna `sortOrder` se agrega desde la migración inicial (E2.0); la pantalla de reordenar llega después (E2.6).

## D-9 ✅ Modificadores: precio ≥ 0 y asociación por reemplazo
- **Contexto**: hay modificadores gratuitos ("sin azúcar") y de pago ("shot extra").
- **Decisión**: `priceCents >= 0` (0 es válido). La asociación producto↔**grupos** (ver D-17) se guarda como **conjunto completo** (`PUT /products/:id/modifier-groups` con la lista ordenada de ids de grupo), no con altas y bajas individuales: la UI es una lista de checkboxes y el guardado es atómico.
- **Consecuencias**: desactivar un modificador (`isActive = false`) lo oculta del POS sin romper pedidos ni asociaciones existentes.

## D-10 ✅ Solo admin escribe el catálogo
- **Decisión (confirmada 2026-10-24)**: `ADMIN` crea/edita/archiva y es el **único** que cambia precios (un cajero cambiando precios se considera riesgoso). `ADMIN`, `CAJERO` **y `MESERO`** pueden cambiar la **disponibilidad** (`PATCH /products/:id/availability`), porque el mesero es quien primero se entera de que algo se agotó. Los tres roles leen `GET /menu`. Se aplica con el `RolesGuard` ya existente.
- **Pendiente**: la matriz final de roles sigue ⚠️ en E1.3 (no bloquea).
- **Consecuencias**: cualquier rol necesita un acceso rápido a "Disponibilidad": lista simple con switches, sin formulario ni precios editables. En el POS, el mesero puede marcar "Agotado" directamente desde la tarjeta (pulsación larga o menú ⋯), con confirmación ligera y Deshacer.
- **Riesgo asumido**: con tres roles tocando disponibilidad, un cambio por error es más probable. Mitigación: toast con Deshacer, y registrar quién y cuándo cambió la disponibilidad (campos `availabilityChangedById`/`At` en `Product`, o fila en un log; decidir en E2.3).

## D-11 ✅ Moneda: boliviano (Bs), una sola
- **Decisión**: moneda única BOB. Un único helper de formato con `Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' })`; el input de precio acepta coma o punto. Multi-moneda queda fuera.
- **Consecuencias**: se actualizan los ejemplos de la UI a Bs; tope de precio de producto propuesto: Bs 100.000,00.

## D-12 ✅ Sin impuestos por ahora
- **Decisión**: el precio del menú es el precio final. No se muestra impuesto. Podría aparecer en el futuro, por lo que no se cablea 10 % en ningún lado.
- **Consecuencias**: en E2.5 se **retira** la línea "Impuesto (10 %)" y `TAX_RATE` de `order-ticket.tsx`, para no mostrar un cálculo no confirmado. Si vuelve, entrará como configuración del negocio (E6).

## D-13 ✅ Producto agotado: visible como "Agotado"
- **Decisión**: el POS muestra los productos `isAvailable = false` atenuados, con etiqueta "Agotado" y no seleccionables. `GET /menu` los incluye con `isAvailable: false`. Cierra AC-3.8 con la opción B.

## D-14 ✅ Productos y precios: sin paginación en admin
- **Contexto**: el menú es pequeño (~decenas de productos).
- **Decisión**: `GET /products` devuelve la lista completa; búsqueda y filtros se resuelven en cliente o con query simple. Se agrega paginación solo si el menú crece de verdad.

## D-15 ✅ Historial de cambios de precio
- **Decisión recomendada**: dos tablas, `ProductPriceChange` y `ModifierPriceChange` (no una polimórfica: así cada una tiene su clave foránea real), cada una con `productId`/`modifierId`, `oldPriceCents`, `newPriceCents`, `changedById`, `changedAt`) escrita **en la misma transacción** que el `PATCH` de precio. Sin pantalla en el MVP; consulta por SQL o endpoint de lectura admin después. ~2–3 pts.
- **Por qué ahora**: el historial anterior a la tabla no se puede reconstruir, y los precios son lo más sensible del catálogo.
- **Confirmada 2026-10-24.** HU E2.7; se entrega junto con la edición de productos para que no haya cambios de precio sin registrar.

## D-16 ✅ Imágenes: fuera del MVP, almacenamiento en el servidor detrás de un puerto
- **Decisión**: no entran en esta entrega. Cuando se hagan: puerto `ImageStorage` con adaptador de disco local (volumen persistente en el hosting) y columna `imagePath` nullable. Migrar a S3/R2 después cuesta un adaptador.
- **Consecuencias**: el diseño del POS deja espacio para la imagen sin depender de ella.

## D-17 ✅ Grupos de opciones (tamaños, leche, extras) desde el inicio
- **Contexto**: se eligió la opción escalable para Q7 (tamaños) y Q10 (opciones obligatorias). Como el módulo de modificadores aún no existe y las tablas están vacías, hacerlo ahora no requiere migrar datos; hacerlo después sí.
- **Decisión**: un concepto único, **grupo de opciones** (`ModifierGroup`), con reglas de selección:
  - `name` ("Tamaño", "Leche", "Extras"), `minSelect` (0 = opcional, ≥1 = obligatorio), `maxSelect` (1 = excluyente, N = varios, `null` = sin tope), `isActive`, `sortOrder`.
  - Cada `Modifier` (opción) pertenece a **un grupo** (`groupId` obligatorio); su `priceCents` es el **incremento** sobre el precio base del producto (puede ser 0).
  - El producto se asocia a **grupos** (no a opciones sueltas): `ProductModifierGroup(productId, groupId, sortOrder)` reemplaza a `ProductModifier`.
  - Ejemplos: Tamaño (min 1, max 1): Chico +0, Mediano +1,00, Grande +2,00 · Leche (min 1, max 1): Entera, Avena +1,00 · Extras (min 0, max null): Extra shot +1,00, Crema +0,50.
- **Tamaños**: se modelan como un grupo obligatorio, no como productos duplicados. Un solo "Latte" con su historial de ventas. En inventario, cada opción puede tener receta propia (`ModifierRecipe`), por ejemplo "Grande" suma más leche (E7.3).
- **Alternativas**: (a) productos separados por tamaño: simple pero duplica el menú y fragmenta reportes; (b) `ProductVariant` con receta propia: más rígido y no resuelve "elige la leche". Los grupos cubren ambos casos con un modelo.
- **Consecuencias**:
  - Migración: `Modifier` gana `groupId`; `ProductModifier` se reemplaza por `ProductModifierGroup`. `OrderItemModifier` no cambia (sigue referenciando `Modifier` con `priceCentsAtOrder`).
  - E2.4 crece (5 → 8 pts) y E4.3 deberá **validar mínimos y máximos** al guardar el ítem, tanto en el POS (UX) como en el backend (regla de verdad).
  - El menú (`GET /menu`) entrega, por producto, sus grupos con opciones activas, ordenados.
  - Reemplaza a las suposiciones previas de Q7/Q10 ("productos separados", "solo extras opcionales").

## D-18 ✅ Notas libres + modificadores gratuitos para lo frecuente
- **Decisión**: notas libres por ítem (E4.4); lo que se pide muy seguido ("Sin hielo", "Leche deslactosada") se crea como modificador de precio 0.
