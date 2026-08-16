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
    priceCents: 450,
    category: "calientes",
  },
  {
    id: "latte-vainilla",
    name: "Latte Vainilla",
    description: "Suave con notas dulces",
    priceCents: 525,
    category: "calientes",
  },
  {
    id: "capuchino",
    name: "Capuchino",
    description: "Espuma densa de leche",
    priceCents: 480,
    category: "calientes",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    description: "Extracción en frío 12h",
    priceCents: 550,
    category: "frios",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Con hielo y un shot extra",
    priceCents: 530,
    category: "frios",
  },
  {
    id: "croissant-mantequilla",
    name: "Croissant Mantequilla",
    description: "Crujiente y artesanal",
    priceCents: 375,
    category: "panaderia",
  },
  {
    id: "panini-caprese",
    name: "Panini Caprese",
    description: "Mozzarella y albahaca",
    priceCents: 690,
    category: "panaderia",
  },
  {
    id: "frappe-caramelo",
    name: "Frappé Caramelo",
    description: "Batido con base de espresso",
    priceCents: 590,
    category: "frappes",
  },
]
