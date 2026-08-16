import type { Product } from "@/features/pos/types"

/**
 * Catálogo de muestra mientras no existe el endpoint de productos en el
 * backend (ver docs/project-context.md §5). Reemplazar por
 * `features/pos/api/get-products.ts` cuando el módulo exista.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "espresso-doble",
    name: "Espresso Doble",
    description: "Cuerpo intenso y crema dorada",
    price: 4.5,
    category: "calientes",
  },
  {
    id: "latte-vainilla",
    name: "Latte Vainilla",
    description: "Suave con notas dulces",
    price: 5.25,
    category: "calientes",
  },
  {
    id: "capuchino",
    name: "Capuchino",
    description: "Espuma densa de leche",
    price: 4.8,
    category: "calientes",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    description: "Extracción en frío 12h",
    price: 5.5,
    category: "frios",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Con hielo y un shot extra",
    price: 5.3,
    category: "frios",
  },
  {
    id: "croissant-mantequilla",
    name: "Croissant Mantequilla",
    description: "Crujiente y artesanal",
    price: 3.75,
    category: "panaderia",
  },
  {
    id: "panini-caprese",
    name: "Panini Caprese",
    description: "Mozzarella y albahaca",
    price: 6.9,
    category: "panaderia",
  },
  {
    id: "frappe-caramelo",
    name: "Frappé Caramelo",
    description: "Batido con base de espresso",
    price: 5.9,
    category: "frappes",
  },
]
