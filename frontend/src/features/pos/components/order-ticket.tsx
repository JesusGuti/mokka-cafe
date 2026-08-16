"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { formatCurrency } from "@/shared/lib/format";
import { PaymentMethods } from "@/features/pos/components/payment-methods";
import type { OrderLineItem, PaymentMethod } from "@/features/pos/types";

const TAX_RATE = 0.1;

interface OrderTicketProps {
  orderNumber: string;
  items: OrderLineItem[];
  payment: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onCheckout: () => void;
}

export function OrderTicket({
  orderNumber,
  items,
  payment,
  onPaymentChange,
  onIncrement,
  onDecrement,
  onCheckout,
}: Readonly<OrderTicketProps>) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-card shadow-sm">
        <div className="border-b border-dashed border-border p-4 text-center">
          <h2 className="font-heading text-lg font-medium text-foreground">
            Pedido Actual
          </h2>
          <p className="text-xs text-muted-foreground">Orden #{orderNumber}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ShoppingBag className="size-8 opacity-50" aria-hidden />
              <p className="text-sm">Toca un producto para agregarlo</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="flex-1">
                    <span className="text-sm font-bold text-foreground">
                      {item.product.name}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrement(item.id)}
                        aria-label={`Quitar una unidad de ${item.product.name}`}
                        className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent/30"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-4 text-center text-xs tabular-nums text-muted-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrement(item.id)}
                        aria-label={`Agregar una unidad de ${item.product.name}`}
                        className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent/30"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm tabular-nums text-foreground">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-dashed border-border p-4">
          <div className="mb-1 flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm text-muted-foreground">
            <span>Impuesto (10%)</span>
            <span className="tabular-nums">{formatCurrency(tax)}</span>
          </div>
          <div className="flex items-end justify-between border-t border-border pt-3">
            <span className="font-heading text-lg font-medium text-foreground">
              Total
            </span>
            <span className="font-heading text-lg font-medium tabular-nums text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        <div
          aria-hidden
          className={cn(
            "h-2 w-full",
            "bg-[radial-gradient(circle,transparent_70%,var(--secondary)_75%)] bg-size-[16px_16px] bg-position-[0_-8px]",
          )}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <PaymentMethods value={payment} onChange={onPaymentChange} />
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onCheckout}
          className="w-full rounded-xl bg-primary py-4 font-heading text-lg font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          Procesar Pedido
        </button>
      </div>
    </div>
  );
}
