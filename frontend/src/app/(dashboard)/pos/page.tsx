"use client";

import { useMemo, useState } from "react";
import { Bell, Search, UserCircle } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { CategoryFilter } from "@/features/pos/components/category-filter";
import { ProductCard } from "@/features/pos/components/product-card";
import { OrderTicket } from "@/features/pos/components/order-ticket";
import { MOCK_PRODUCTS } from "@/features/pos/data/mock-products";
import type {
  OrderLineItem,
  PaymentMethod,
  Product,
} from "@/features/pos/types";

const MOCK_ORDER_NUMBER = "4402";

export default function PosPage() {
  const [category, setCategory] = useState("todos");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<OrderLineItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [orderSent, setOrderSent] = useState(false);

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((product) => {
      const matchesCategory =
        category === "todos" || product.category === category;
      const matchesQuery = product.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function handleAddProduct(product: Product) {
    setItems((current) => {
      const existing = current.some((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { id: crypto.randomUUID(), product, quantity: 1 }];
    });
  }

  function handleQuantityChange(itemId: string, delta: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleCheckout() {
    setOrderSent(true);
    setItems([]);
    setPayment("efectivo");
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Punto de Venta
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notificaciones"
            className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-accent/30"
          >
            <Bell className="size-5" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-2 py-1.5 text-foreground hover:bg-accent/30"
          >
            <UserCircle className="size-5" />
            <span className="hidden text-sm font-medium sm:inline">
              Barista Alex
            </span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="sticky top-0 z-10 mb-6 flex flex-col gap-3 bg-background/85 pb-3 backdrop-blur-md">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar producto..."
                className="h-10 w-full rounded-full pl-9 sm:max-w-sm"
              />
            </div>
            <CategoryFilter value={category} onChange={setCategory} />
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleAddProduct}
                />
              ))}
            </div>
          ) : (
            <p className="mt-16 text-center text-sm text-muted-foreground">
              No encontramos productos con ese filtro.
            </p>
          )}
        </div>

        <aside className="hidden w-100 shrink-0 flex-col border-l border-border bg-secondary p-4 lg:flex">
          <OrderTicket
            orderNumber={MOCK_ORDER_NUMBER}
            items={items}
            payment={payment}
            onPaymentChange={setPayment}
            onIncrement={(id) => handleQuantityChange(id, 1)}
            onDecrement={(id) => handleQuantityChange(id, -1)}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      <Dialog open={orderSent} onOpenChange={setOrderSent}>
        <DialogContent className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-chart-4/15 text-chart-4">
            <span className="text-3xl">☕</span>
          </div>
          <DialogTitle className="font-heading text-xl">¡Listo!</DialogTitle>
          <DialogDescription>
            El pedido ha sido enviado a cocina correctamente.
          </DialogDescription>
          <DialogFooter className="w-full sm:justify-center">
            <button
              type="button"
              onClick={() => setOrderSent(false)}
              className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Siguiente pedido
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
