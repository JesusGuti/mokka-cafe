"use client";

import { Search, X } from "lucide-react";
import type { RowData } from "@tanstack/react-table";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { DataTableInstance } from "./data-table";

interface DataTableToolbarProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  /** Placeholder del buscador de texto libre (filtra sobre todas las columnas). */
  searchPlaceholder?: string;
  /** Filtros adicionales, p. ej. `DataTableFacetedFilter` por columna. */
  children?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder = "Buscar...",
  children,
  className,
}: Readonly<DataTableToolbarProps<TData>>) {
  const globalFilter = (table.state.globalFilter as string | undefined) ?? "";
  const isFiltered =
    globalFilter.length > 0 || table.state.columnFilters.length > 0;

  const resetFilters = () => {
    table.setGlobalFilter("");
    table.setColumnFilters([]);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Buscar"
          className="pl-8"
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          value={globalFilter}
        />
      </div>

      {children}

      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Limpiar
          <X data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
}
