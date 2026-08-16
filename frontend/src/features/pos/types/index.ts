export type ProductCategory = "calientes" | "frios" | "panaderia" | "frappes"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
}

export interface OrderLineItem {
  id: string
  product: Product
  quantity: number
}

export type PaymentMethod = "efectivo" | "tarjeta" | "qr"
