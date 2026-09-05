"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  type ColumnDef,
  flexRender,
  type Row,
  type RowData,
  useTable,
} from "@tanstack/react-table";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { type DataTableFeatures, features } from "./data-table-features";

// `crypto.randomUUID` solo existe en contextos seguros (https, o localhost) del
// navegador; un contador simple identifica igual de bien cada fila de esqueleto
// sin depender de eso.
let skeletonIdCounter = 0;

/** Tipo de la instancia de tabla, para tiparla en toolbars/paginación/headers. */
export type DataTableInstance<TData extends RowData> = ReturnType<
  typeof useTable<DataTableFeatures, TData>
>;

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  /** Identificador estable de fila (por defecto el índice). */
  getRowId?: (row: TData, index: number) => string;
  /** Muestra filas de esqueleto mientras se cargan los datos. */
  isLoading?: boolean;
  /** Tamaño de página inicial. */
  pageSize?: number;
  /** Mensaje mostrado cuando no hay filas que mostrar. */
  emptyMessage?: string;
  /**
   * Barra de herramientas (búsqueda, filtros, etc). Recibe la instancia de la
   * tabla para poder leer/mutar su estado (`table.setGlobalFilter`, filtros de
   * columna, visibilidad de columnas...).
   */
  toolbar?: (table: DataTableInstance<TData>) => React.ReactNode;
  /**
   * Cuando se provee, cada fila muestra un botón para expandirla y renderizar
   * este contenido debajo (por ejemplo, los elementos hijos de la fila).
   */
  renderSubRow?: (row: Row<DataTableFeatures, TData>) => React.ReactNode;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  pageSize = 10,
  emptyMessage = "Sin resultados.",
  toolbar,
  renderSubRow,
  className,
}: Readonly<DataTableProps<TData>>) {
  const table = useTable<DataTableFeatures, TData>({
    features,
    columns,
    data,
    getRowId,
    getRowCanExpand: renderSubRow ? () => true : undefined,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const columnCount =
    table.getVisibleLeafColumns().length + (renderSubRow ? 1 : 0);
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();

  // Ids sintéticos estables para las filas de esqueleto: no tienen datos
  // reales que las identifiquen, así que no pueden usar el índice como key
  // (React reconciliaría mal si `pageSize` cambia mientras isLoading es true).
  const skeletonRowIds = React.useMemo(
    () => Array.from({ length: pageSize }, () => `skeleton-row-${skeletonIdCounter++}`),
    [pageSize],
  );

  const renderContent = () => {
    if (isLoading) {
      return skeletonRowIds.map((rowId) => (
        <TableRow key={rowId}>
          {renderSubRow && (
            <TableCell>
              <Skeleton className="size-4" />
            </TableCell>
          )}
          {visibleColumns.map((column) => (
            <TableCell key={column.id}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (rows.length) {
      return rows.map((row) => (
        <React.Fragment key={row.id}>
          <TableRow data-state={row.getIsSelected() ? "selected" : undefined}>
            {renderSubRow && (
              <TableCell>
                {row.getCanExpand() && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-expanded={row.getIsExpanded()}
                    aria-label={
                      row.getIsExpanded() ? "Contraer fila" : "Expandir fila"
                    }
                    onClick={row.getToggleExpandedHandler()}
                  >
                    {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
                  </Button>
                )}
              </TableCell>
            )}
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
          {renderSubRow && row.getIsExpanded() && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="bg-muted/30 p-0">
                {renderSubRow(row)}
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ));
    }

    return (
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={columnCount}
          className="h-24 text-center text-muted-foreground"
        >
          {emptyMessage}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {toolbar?.(table)}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {renderSubRow && <TableHead className="w-8" />}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
