"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { Column, RowData } from "@tanstack/react-table";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: Readonly<DataTableColumnHeaderProps<TData, TValue>>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  const renderIcon = () => {
    if (sorted === "desc") {
      return <ArrowDown />;
    }

    if (sorted === "asc") {
      return <ArrowUp />;
    }

    return <ChevronsUpDown className="text-muted-foreground" />;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2.5 h-7 gap-1.5", className)}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {renderIcon()}
    </Button>
  );
}
