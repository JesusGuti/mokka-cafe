import { useState } from "react";

/**
 * Devuelve `value` mientras no sea `null`, y el último valor no nulo cuando
 * pasa a `null`.
 *
 * Sirve para los diálogos que se abren con un elemento seleccionado: al cerrar
 * el padre pone la selección en `null`, pero el diálogo sigue visible durante
 * su animación de salida. Sin esto, el texto y los campos se vaciarían a mitad
 * del cierre.
 */
export function useRetainedValue<T>(value: T | null): T | null {
  const [retained, setRetained] = useState(value);

  // Actualizar el estado durante el render es el patrón recomendado por React
  // para derivar estado de una prop; evita un render extra con un efecto.
  if (value !== null && value !== retained) {
    setRetained(value);
  }

  return value ?? retained;
}
