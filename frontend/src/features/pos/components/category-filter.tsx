"use client";

import { cn } from "@/shared/lib/utils";

const CATEGORIES = [
  { value: "todos", label: "Todos" },
  { value: "calientes", label: "Calientes" },
  { value: "frios", label: "Fríos" },
  { value: "panaderia", label: "Panadería" },
  { value: "frappes", label: "Frappés" },
] as const;

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({
  value,
  onChange,
}: Readonly<CategoryFilterProps>) {
  return (
    <div className="flex gap-2 overflow-x-auto mask-[linear-gradient(to_right,black_calc(100%-24px),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          type="button"
          onClick={() => onChange(category.value)}
          aria-pressed={value === category.value}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === category.value
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:bg-accent/30",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
