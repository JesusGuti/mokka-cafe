# Catálogo — Criterios de aceptación

**Estado**: Borrador para revisión · **Última actualización**: 2026-10-24

Escritos desde la perspectiva de QA + UX. Cada HU tiene tres bloques:

- **Funcional**: lo que debe pasar (Dado/Cuando/Entonces).
- **Bordes y errores**: lo que suele romperse.
- **UX**: lo que evita que el usuario sufra.

Los criterios marcados 🟡 dependen de una decisión aún no confirmada ([decisions.md](./decisions.md) / [open-questions.md](./open-questions.md)).

## Criterios transversales (aplican a TODAS las pantallas del catálogo)

**Contexto de uso real**: el admin edita desde computador o tablet; el mesero usa el POS en una **tablet o celular, de pie, con una mano, con prisa y a veces con las manos mojadas**. Los criterios del POS son más estrictos que los del admin.

| ID | Criterio |
|---|---|
| T-1 | Todo error de validación aparece **junto al campo** que lo causó, en español, diciendo qué hacer ("El precio debe ser mayor o igual a 0"), nunca códigos ni mensajes técnicos. |
| T-2 | Al fallar un guardado, **el formulario conserva lo que el usuario escribió**. Nunca se vacía ni se cierra. |
| T-3 | Todo botón que envía datos se **deshabilita y muestra progreso** mientras espera; un doble clic no crea dos registros. |
| T-4 | Toda lista tiene 4 estados definidos: cargando (skeleton), vacío (con acción sugerida), error (con "Reintentar") y con datos. Nunca una pantalla en blanco. |
| T-5 | Tras crear/editar/archivar, el usuario recibe confirmación visible (toast) y la lista refleja el cambio **sin recargar la página**. |
| T-6 | Acciones destructivas o difíciles de deshacer piden confirmación **que nombra el elemento** ("¿Archivar «Latte Vainilla»?"), con botón primario descriptivo, no "Aceptar". |
| T-7 | Sesión expirada (401) redirige al login y, tras entrar, regresa a la pantalla donde estaba. No se pierde el trabajo en curso si es evitable. |
| T-8 | Un usuario sin permiso (403) no ve los botones de escritura; si llega por URL, ve un mensaje claro de "No tienes permiso", no una pantalla rota. |
| T-9 | Operable solo con teclado en las pantallas admin; foco visible; orden de tabulación lógico; los diálogos devuelven el foco al disparador al cerrar. |
| T-10 | Contraste de texto ≥ 4.5:1; el estado de un producto (disponible/agotado/archivado) **no depende solo del color** (siempre hay texto o ícono). |
| T-11 | Textos largos (nombre de 80+ caracteres) no rompen el layout: se truncan con elipsis y el texto completo es accesible (tooltip o detalle). |
| T-12 | Los textos de la interfaz están en español y son consistentes: "Categoría", "Producto", "Modificador (extra)", "No disponible", "Archivado". |

---

## E2.1 — CRUD de categorías

### Funcional
- **AC-1.1** Dado un admin autenticado, cuando crea una categoría con nombre válido, entonces aparece en la lista y queda disponible al crear productos.
- **AC-1.2** Dado una categoría existente, cuando el admin cambia su nombre, entonces el nuevo nombre se refleja en admin y POS, y sus productos siguen asociados.
- **AC-1.3** Dado una categoría **sin productos**, cuando el admin la elimina y confirma, entonces desaparece de la lista.
- **AC-1.4** La lista de categorías muestra cuántos productos tiene cada una.

### Bordes y errores
- **AC-1.5** Nombre vacío, solo espacios o > 50 caracteres → rechazado con mensaje junto al campo. (Límite 🟡: confirmar largo máximo razonable para un tab del POS.)
- **AC-1.6** Nombre duplicado ignorando mayúsculas y espacios (`"Calientes"` vs `" calientes "`) → `409` y mensaje "Ya existe una categoría con ese nombre". (D-4)
- **AC-1.7** Eliminar una categoría **con productos** → bloqueado, mensaje con la cantidad ("Tiene 4 productos. Muévelos o archívalos primero"), sin borrar nada. (D-3 ✅)
- **AC-1.8** Editar una categoría que otro admin acaba de eliminar → mensaje "Esta categoría ya no existe" y la lista se actualiza. No error genérico.
- **AC-1.9** Caracteres especiales y emojis en el nombre ("Té & Café ☕") se guardan y se muestran sin corromperse.
- **AC-1.10** Intento de inyección (`<script>`, comillas, `'; DROP`) se guarda como texto inerte y se muestra escapado.

### UX
- **AC-1.11** Crear categoría debe poder hacerse **sin salir de la lista** (diálogo o fila en línea) y también desde el formulario de producto ("+ Nueva categoría") sin perder lo ya escrito del producto.
- **AC-1.12** Enter envía el formulario; Esc lo cierra (con aviso si hay cambios sin guardar).
- **AC-1.14** El admin puede reordenar categorías (subir/bajar) y el POS respeta ese orden; una categoría nueva entra al final. Igual para productos dentro de una categoría (D-8 🟡).
- **AC-1.13** Tras crear, el campo de nombre queda listo para escribir otra (flujo de carga inicial de varias categorías seguidas).

---

## E2.2 — CRUD de productos

### Funcional
- **AC-2.1** Dado un admin, cuando crea un producto con nombre, precio y categoría, entonces aparece en la lista y (si está disponible) en el POS.
- **AC-2.2** El precio se captura como el usuario lo escribe en moneda (`4.5`, `4,50`, `4`) y se guarda exactamente en centavos (`450`, `450`, `400`). Nunca `449.99999` ni `45`.
- **AC-2.3** Editar nombre, descripción, precio o categoría persiste y se refleja en admin y POS.
- **AC-2.4** Cambiar el precio **no altera pedidos ya creados** (verificar cuando exista E4; hasta entonces documentado como regresión pendiente).
- **AC-2.5** "Eliminar" archiva el producto: desaparece del POS y de la lista por defecto, pero se puede ver en el filtro "Archivados" y **restaurar**. (D-2 ✅)
- **AC-2.6** La lista admite búsqueda por nombre (sin distinguir mayúsculas ni acentos: "cafe" encuentra "Café") y filtro por categoría y por estado.

### Bordes y errores
- **AC-2.7** Precio: vacío, negativo, texto ("abc"), `0`, con más de 2 decimales (`4.555`), valores enormes (`99999999999`) → mensaje claro. Producto con precio `0` **no permitido** (modificadores sí). Tope máximo: Bs 100.000,00 (D-11).
- **AC-2.8** Pegar `"Bs. 4,50"` o `"Bs 4.50"` en el campo precio: o se interpreta correctamente o se rechaza con mensaje; nunca se guarda un valor distinto al visible.
- **AC-2.9** Nombre vacío/solo espacios/> 80 caracteres → rechazado. Descripción > 200 caracteres → rechazada con contador visible.
- **AC-2.10** Nombre duplicado dentro de la misma categoría → `409` con mensaje claro. (D-5 ✅)
- **AC-2.11** Crear/editar con una `categoryId` inexistente (categoría eliminada mientras tanto) → mensaje "La categoría ya no existe", sin perder el formulario.
- **AC-2.12** Editar un producto archivado o inexistente → mensaje claro, no `500`.
- **AC-2.13** Enviar el formulario dos veces rápido crea **un solo** producto.
- **AC-2.14** Listado con 0, 1, 100 y 500 productos se muestra bien (paginación o scroll, sin congelar la pantalla).

### UX
- **AC-2.15** El formulario pide lo mínimo para crear: **nombre, precio, categoría**. Descripción es opcional y está visualmente subordinada.
- **AC-2.16** El campo precio muestra el símbolo de moneda fuera del input, usa teclado numérico en móvil/tablet y no obliga a escribir ceros innecesarios.
- **AC-2.17** El switch "Disponible" es visible en la propia lista (acción rápida), sin abrir el formulario de edición (ver E2.3).
- **AC-2.18** Al editar, se muestra qué cambió o al menos se confirma con el nombre del producto ("«Capuchino» actualizado").
- **AC-2.19** Cerrar el formulario con cambios sin guardar pide confirmación; sin cambios cierra directo.
- **AC-2.21** Cada cambio de precio de producto registra un `ProductPriceChange` o `ModifierPriceChange` (anterior, nuevo, quién, cuándo) en la misma transacción; si el guardado falla, no queda registro huérfano (D-15 ✅).
- **AC-2.20** Archivar muestra un mensaje que explique el efecto en lenguaje del negocio: "Dejará de aparecer en el POS. Los pedidos anteriores no se afectan. Puedes restaurarlo." (no "se eliminará").

---

## E2.3 — Marcar producto como no disponible

### Funcional
- **AC-3.1** Dado un producto disponible, cuando el admin lo marca "No disponible", entonces deja de ofrecerse en el POS.
- **AC-3.2** Dado un producto no disponible, cuando el admin lo reactiva, entonces vuelve al POS en su categoría.
- **AC-3.3** El cambio es **un solo toque** desde la lista, sin confirmación (es reversible y frecuente: se agotó la leche de avena).

### Bordes y errores
- **AC-3.4** Si el cambio falla (red/500), el switch vuelve a su estado real y se avisa; nunca queda mostrando un estado que no se guardó.
- **AC-3.5** Dos admins cambian el mismo producto a la vez: gana el último y ambos ven el estado real tras refrescar. Sin errores.
- **AC-3.6** Marcar no disponible **no** cancela ítems de pedidos ya abiertos que lo contienen (regla para E4/E5; confirmar al implementar).
- **AC-3.7** Si todos los productos de una categoría están no disponibles, el POS **no muestra** esa categoría vacía (o la muestra atenuada con "Sin productos disponibles"; decidir una).

### UX
- **AC-3.8** En el **POS**, un producto no disponible se muestra **visible, atenuado, con etiqueta "Agotado" y no seleccionable**, para que el mesero pueda explicarle al cliente (D-13 ✅).
- **AC-3.11** `ADMIN`, `CAJERO` y `MESERO` pueden cambiar la disponibilidad. Cajero y mesero llegan a una pantalla simple "Disponibilidad" (switches, sin edición de precios) y el mesero además puede hacerlo desde la tarjeta del POS. Un mesero o cajero que intenta `PATCH /products/:id` (precio) recibe 403 (D-10).
- **AC-3.12** Cada cambio de disponibilidad guarda quién y cuándo; el toast ofrece **Deshacer** durante unos segundos, y la lista admin permite ver el último cambio ("Marcado agotado por Ana · hace 5 min").
- **AC-3.9** En la lista admin, los productos no disponibles se distinguen por **texto + estilo** ("No disponible"), no solo por opacidad.
- **AC-3.10** Cuando el mesero tiene el POS abierto y un producto pasa a no disponible, el POS lo refleja en ≤ 30 s o al volver a la pestaña, y si el mesero lo tenía a punto de agregar, ve un aviso, no un error técnico.

---

## E2.4 — Grupos de opciones, opciones y asociación a productos

Modelo (D-17): un **grupo** ("Tamaño", "Leche", "Extras") con regla `minSelect`/`maxSelect`; cada **opción** pertenece a un grupo y suma un incremento de precio; el producto se asocia a grupos. Se parte en dos entregas: **E2.4a** (grupos y opciones) y **E2.4b** (asociar a productos).

### Funcional — E2.4a (grupos y opciones)
- **AC-4.1** El admin crea un grupo con nombre, `minSelect` y `maxSelect`, y lo edita, desactiva y reactiva.
- **AC-4.2** El admin crea opciones dentro de un grupo con nombre e incremento de precio (≥ 0), y las edita, desactiva y reactiva. Precio `0` es válido ("Chico", "Sin azúcar").
- **AC-4.3** Tipos de grupo soportados y su significado, mostrados en lenguaje claro en la UI, no como números sueltos:
  - *Elegir una (obligatorio)*: min 1, max 1 (Tamaño).
  - *Elegir una (opcional)*: min 0, max 1.
  - *Elegir varias (opcional)*: min 0, max N o sin tope (Extras).
  - *Elegir varias (obligatorio)*: min ≥ 1, max N.
- **AC-4.4** Un grupo/opción **inactivo** no aparece en el POS, pero los pedidos antiguos que lo usaron lo siguen mostrando.
- **AC-4.5** Reordenar grupos y opciones (subir/bajar); lo nuevo entra al final (D-8).

### Bordes y errores — E2.4a
- **AC-4.6** Reglas de coherencia del grupo: `minSelect ≥ 0`, `maxSelect ≥ 1` o sin tope, `maxSelect ≥ minSelect`; combinaciones inválidas → mensaje junto al campo ("El máximo no puede ser menor al mínimo").
- **AC-4.7** Un grupo **obligatorio** (min ≥ 1) debe tener al menos tantas opciones **activas** como `minSelect`. Si el admin desactiva la última opción de un grupo obligatorio asociado a productos → advertencia con la lista de productos afectados; sin ese chequeo los productos quedarían imposibles de pedir.
- **AC-4.8** Un grupo `max = 1` con precio de opciones distintos funciona como selección excluyente (radio). Un grupo con `max > 1` permite varias (checkbox).
- **AC-4.9** Nombre duplicado: de grupo (global, insensible a mayúsculas) y de opción (dentro del mismo grupo) → `409`.
- **AC-4.10** Eliminar: ni grupos ni opciones se borran si tuvieron uso (pedidos) o están asociados; se **desactivan** y se informa cuántos productos los usan. Un grupo/opción nunca usado y sin asociaciones sí puede borrarse.
- **AC-4.11** Precio negativo, vacío o con más de 2 decimales → rechazado con mensaje.
- **AC-4.12** Mover una opción a otro grupo: no permitido si tiene uso histórico (alterar el significado de pedidos antiguos); se desactiva y se crea una nueva.

### Funcional — E2.4b (asociar a productos)
- **AC-4.13** Desde el formulario de producto, el admin elige qué grupos aplican y en qué orden. Se guarda como conjunto completo, todo o nada (D-9).
- **AC-4.14** Un mismo grupo se asocia a muchos productos sin repetir la configuración ("Extras" a todos los cafés). Ofrecer "Aplicar a toda una categoría" (deseable; evaluar costo al implementar).
- **AC-4.15** Asociar el mismo grupo dos veces al mismo producto no duplica ni muestra error (idempotente).
- **AC-4.16** Quitar todos los grupos de un producto es válido.
- **AC-4.17** Asociar a un producto o grupo inexistente → mensaje claro, sin guardado parcial.
- **AC-4.18** `GET /menu` entrega, por producto, sus grupos activos con opciones activas, ordenados, con `minSelect`/`maxSelect` y precio incremental.

### UX
- **AC-4.19** En el formulario de grupo, la regla se elige con un selector de **tipo en palabras** ("Elegir una · obligatorio") y los números solo aparecen en el caso "varias".
- **AC-4.20** Vista previa de cómo verá el mesero el grupo (botones tipo radio/checkbox con precios) antes de guardar.
- **AC-4.21** Al elegir grupos para un producto se muestran con su resumen ("Tamaño · obligatorio · 3 opciones") y buscador si hay más de ~8.
- **AC-4.22** Los productos con un grupo obligatorio muestran un indicio en la lista admin ("Requiere elegir tamaño") para que el admin entienda por qué en el POS se abre un panel.

### Contrato con el POS (se implementa y valida en E4.3, definido aquí para no divergir)
- **AC-4.23** Producto **sin** grupos obligatorios: un toque lo agrega, sin pasos extra (la velocidad es la prioridad).
- **AC-4.24** Producto **con** grupos obligatorios: abre un panel con los grupos; el botón "Agregar" permanece deshabilitado mientras falte una opción obligatoria y **dice qué falta** ("Elige un tamaño"); las opciones obligatorias vacías se resaltan.
- **AC-4.25** Las opciones de un grupo `max = 1` con una sola opción obligatoria podrían preseleccionarse; con varias, **no preseleccionar** (evitar errores de pedido).
- **AC-4.26** El precio del ítem se actualiza en vivo al elegir opciones (base + incrementos).
- **AC-4.27** El backend valida mínimos y máximos al guardar el ítem (E4.3); el frontend es solo comodidad.

## E2.5 — POS con menú real

### Funcional
- **AC-5.1** El POS carga categorías y productos desde la API; `mock-products.ts` deja de existir.
- **AC-5.2** El POS muestra solo lo vendible: productos no archivados (los agotados, como "Agotado"), y categorías que tengan al menos un producto visible (AC-3.7, AC-3.8).
- **AC-5.3** El filtro por categoría y el listado siguen funcionando igual que con el mock (sin regresión visual ni de interacción).
- **AC-5.4** Los precios del POS son los del catálogo, formateados de forma consistente con el admin.

### Bordes y errores
- **AC-5.5** Menú vacío (cafetería recién instalada): el POS muestra un estado vacío con mensaje útil — para admin: botón "Ir a crear productos"; para mesero: "El menú aún no está listo. Avisa al administrador."
- **AC-5.6** API caída o lenta: skeleton al cargar; tras fallar, mensaje con "Reintentar". Si ya había un menú cargado, **se sigue mostrando el último menú conocido** con un aviso discreto "Mostrando menú guardado" (no se bloquea la atención).
- **AC-5.7** Sesión expirada mientras el POS está abierto → login y regreso al POS, conservando el pedido en curso si es técnicamente posible.
- **AC-5.8** Cambio de datos en el admin se refleja en el POS en ≤ 30 s o al volver a enfocar la pestaña, sin recargar manualmente.
- **AC-5.9** Descripción nula o muy larga no rompe la tarjeta; nombre largo se trunca con elipsis.
- **AC-5.10** Un usuario `MESERO` o `CAJERO` accede al menú pero **no** puede crear/editar/archivar (403 en API; botones ausentes en UI). Excepción: disponibilidad para `CAJERO` y `MESERO` (AC-3.11).
- **AC-5.17** El POS no muestra ninguna línea de impuesto; el total es la suma de los precios del menú (D-12 ✅).

### UX
- **AC-5.11** Tiempo de carga del menú percibido ≤ 1 s con ~100 productos en red normal de local (Wi-Fi), y la UI nunca se bloquea esperando.
- **AC-5.12** Objetivos táctiles ≥ 44×44 px; el POS es usable en tablet vertical y horizontal y en celular, sin scroll horizontal.
- **AC-5.13** Con 8+ categorías, los tabs se desplazan horizontalmente con indicio visual (borde cortado/sombra) o se reorganizan; ninguna queda inaccesible.
- **AC-5.14** Mantener la categoría seleccionada tras un refresco automático de datos (el mesero no vuelve a "Todos" cada 30 s).
- **AC-5.15** Los productos se leen rápido: nombre en primer plano, precio alineado y consistente, descripción secundaria. El orden es estable (no "salta" entre refrescos).
- **AC-5.16** El estado de carga y error del POS es distinguible del estado "no hay productos" (no confundir "falló" con "vacío").

---

## E2.6 — Orden personalizado de categorías y productos

- **AC-6.1** El admin mueve una categoría o producto arriba/abajo con botones; el cambio se guarda al instante y el POS lo respeta tras el próximo refresco.
- **AC-6.2** Una categoría o producto nuevo entra al final de su lista.
- **AC-6.3** Los productos se reordenan **dentro de su categoría**; mover un producto a otra categoría (edición) lo coloca al final de la nueva.
- **AC-6.4** Mover el primer elemento hacia arriba o el último hacia abajo: botón deshabilitado, sin error.
- **AC-6.5** Dos admins reordenando a la vez: el resultado final es un orden válido (sin duplicados ni huecos que rompan la lista); el segundo ve el orden real tras refrescar.
- **AC-6.6** Archivar o desactivar un elemento no deja huecos visibles; restaurarlo lo coloca al final.
- **AC-6.7** El orden del POS es **estable** entre refrescos (nunca "salta").
- **AC-6.8** UX: el elemento movido queda resaltado un instante y mantiene el foco del teclado; los botones tienen etiqueta accesible ("Subir «Latte»").

## E2.7 — Historial de cambios de precio

- **AC-7.1** Cada cambio de precio de producto u opción registra: entidad, precio anterior, precio nuevo, usuario y fecha, en la **misma transacción** que el cambio.
- **AC-7.2** Si el guardado falla, no queda registro; si no cambia el precio (mismo valor), no se registra nada.
- **AC-7.3** Solo `ADMIN` puede cambiar precios y por tanto generar historial (403 para otros roles).
- **AC-7.4** Un endpoint de lectura admin lista el historial de un producto/opción, más reciente primero. (Pantalla: fuera del MVP.)
- **AC-7.5** El usuario registrado es siempre el autenticado, nunca un valor enviado por el cliente.
- **AC-7.6** Cambiar el precio no altera el precio de pedidos ya creados (se valida en E4).
