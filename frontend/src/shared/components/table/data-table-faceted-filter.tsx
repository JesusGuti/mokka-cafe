"use client";

import { PlusCircle } from "lucide-react";
import type { Column, RowData } from "@tanstack/react-table";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { SelectOption } from "@/shared/types/select";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableFacetedFilterProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  options: SelectOption[];
}

export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  title,
  options,
}: Readonly<DataTableFacetedFilterProps<TData, TValue>>) {
  const selected = new Set(
    (column.getFilterValue() as string[] | undefined) ?? [],
  );

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column.setFilterValue(next.size ? Array.from(next) : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <PlusCircle data-icon="inline-start" />
            {title}
            {selected.size > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-md px-1.5">
                {selected.size}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-fit">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.has(option.value)}
            onCheckedChange={() => toggle(option.value)}
            onSelect={(event) => event.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => column.setFilterValue(undefined)}
              onSelect={(event) => event.preventDefault()}
            >
              Limpiar filtro
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
