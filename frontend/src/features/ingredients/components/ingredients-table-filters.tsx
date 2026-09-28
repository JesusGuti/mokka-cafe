import { DataTableFacetedFilter } from "@/shared/components/table/data-table-faceted-filter";
import { DataTableToolbar } from "@/shared/components/table/data-table-toolbar";
import type { DataTableInstance } from "@/shared/components/table/data-table";
import type { SelectOption } from "@/shared/types/select";
import { IngredientResponse } from "../types/ingredients.types";

interface IngredientsTableFiltersProps {
  table: DataTableInstance<IngredientResponse>;
  categoryOptions: SelectOption[];
}

export const IngredientsTableFilters = ({
  table,
  categoryOptions,
}: IngredientsTableFiltersProps) => {
  return (
    <DataTableToolbar
      table={table}
      searchPlaceholder="Buscar por nombre o unidad..."
    >
      <DataTableFacetedFilter
        column={table.getColumn("category")!}
        title="Categoría"
        options={categoryOptions}
      />
    </DataTableToolbar>
  );
};
