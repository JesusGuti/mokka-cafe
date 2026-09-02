import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  type FilterFn,
  globalFilteringFeature,
  type RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  type TableFeatures,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * Filtro para columnas con selector de opciones (ver `DataTableFacetedFilter`):
 * el valor de filtro es un arreglo de opciones seleccionadas y conserva la fila
 * si el valor de la celda está incluido en ese arreglo. Los `filterFn_arr*`
 * nativos hacen lo inverso (esperan que el valor de la celda sea un arreglo),
 * por eso no sirven aquí.
 */
export const filterFn_faceted: FilterFn<TableFeatures, RowData> = (
  row,
  columnId,
  filterValue,
) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.includes(String(row.getValue(columnId)));
};
filterFn_faceted.autoRemove = (value) =>
  !Array.isArray(value) || value.length === 0;

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    faceted: filterFn_faceted,
  },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
export type DataTableFeatures = typeof features;
