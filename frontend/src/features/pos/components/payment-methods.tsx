"use client";

import { Banknote, CreditCard, QrCode } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { PaymentMethod } from "@/features/pos/types";

const METHODS: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "qr", label: "Pago QR", icon: QrCode },
];

interface PaymentMethodsProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

export function PaymentMethods({
  value,
  onChange,
}: Readonly<PaymentMethodsProps>) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
      aria-label="Método de pago"
    >
      {METHODS.map((method) => (
        <button
          key={method.value}
          type="button"
          role="radio"
          aria-checked={value === method.value}
          onClick={() => onChange(method.value)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-[10px] font-medium tracking-wide uppercase transition-all active:scale-95",
            value === method.value
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent/20",
          )}
        >
          <method.icon className="size-5" aria-hidden />
          {method.label}
        </button>
      ))}
    </div>
  );
}
