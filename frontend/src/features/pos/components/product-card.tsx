"use client";

import { Coffee, Croissant, CupSoda, Snowflake } from "lucide-react";

import { formatCurrency } from "@/shared/lib/format";
import type { Product } from "@/features/pos/types";

const CATEGORY_ICON = {
  calientes: Coffee,
  frios: Snowflake,
  panaderia: Croissant,
  frappes: CupSoda,
} as const;

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: Readonly<ProductCardProps>) {
  const Icon = CATEGORY_ICON[product.category];

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg active:scale-[0.98]"
    >
      <div className="relative flex h-32 items-center justify-center bg-muted">
        <Icon
          className="size-9 text-muted-foreground/70 transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        />
        <span className="absolute top-2 right-2 rounded bg-secondary px-2 py-1 text-xs font-semibold tabular-nums text-secondary-foreground">
          {formatCurrency(product.priceCents)}
        </span>
      </div>
      <div className="p-3 text-center">
        <h3 className="font-heading text-base font-medium text-foreground">
          {product.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground italic">
          {product.description}
        </p>
      </div>
    </button>
  );
}
