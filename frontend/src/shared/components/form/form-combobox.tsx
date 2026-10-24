"use client";

import { useId, useState } from "react";
import { Check, ChevronsUpDown, Loader, Plus } from "lucide-react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { SelectOption } from "@/shared/types/select";

interface FormComboboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  /**
   * Si se provee, cuando la búsqueda no matchea ninguna opción se ofrece
   * "Crear <valor buscado>". Devolver `null` significa que el caller ya
   * mostró el error (ej. nombre duplicado) — el combobox no cambia la
   * selección ni queda en un estado inconsistente.
   */
  onCreateOption?: (inputValue: string) => Promise<SelectOption | null>;
  createOptionLabel?: (inputValue: string) => string;
}

const FormCombobox = <T extends FieldValues>({
  required = true,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No hay opciones disponibles",
  disabled = false,
  createOptionLabel = (value) => `Crear "${value}"`,
  ...props
}: FormComboboxProps<T>) => {
  const { control } = useFormContext<T>();
  const generatedId = useId();
  const id = `${props.name}-${generatedId}`;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Opción recién creada: `options` no la incluye hasta que el caller
  // refetchea, y sin esto el trigger mostraría el placeholder en ese lapso.
  const [createdOption, setCreatedOption] = useState<SelectOption | null>(null);

  const descriptionId = props.description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;

  const trimmedSearch = search.trim();
  const hasExactMatch = props.options.some(
    (option) => option.label.toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const canCreate =
    !!props.onCreateOption && trimmedSearch.length > 0 && !hasExactMatch;

  const filteredOptions = props.options.filter((option) =>
    option.label.toLowerCase().includes(trimmedSearch.toLowerCase()),
  );

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption =
          props.options.find((option) => option.value === field.value) ??
          (createdOption?.value === field.value ? createdOption : undefined);

        const handleSelect = (value: string) => {
          field.onChange(value);
          setOpen(false);
          setSearch("");
        };

        const handleCreate = async () => {
          if (!props.onCreateOption || isCreating) return;

          setIsCreating(true);
          try {
            const created = await props.onCreateOption(trimmedSearch);
            if (created) {
              setCreatedOption(created);
              handleSelect(created.value);
            }
          } finally {
            setIsCreating(false);
          }
        };

        return (
          <Field data-invalid={fieldState.invalid} className={props.className}>
            <FieldLabel htmlFor={id}>
              {props.label}
              {required && (
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              )}
            </FieldLabel>

            {props.description && (
              <FieldDescription id={descriptionId}>
                {props.description}
              </FieldDescription>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      [descriptionId, fieldState.error ? errorId : undefined]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    className="h-10 w-full justify-between px-3 font-normal"
                  />
                }
              >
                <span
                  className={cn(
                    "truncate",
                    !selectedOption && "text-muted-foreground",
                  )}
                >
                  {selectedOption?.label ?? placeholder}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-(--anchor-width) p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    {!filteredOptions.length && !canCreate && (
                      <CommandEmpty>{emptyMessage}</CommandEmpty>
                    )}
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={handleSelect}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              option.value === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                      {canCreate && (
                        <CommandItem
                          value={`__create__${trimmedSearch}`}
                          onSelect={handleCreate}
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <Loader className="size-4 animate-spin" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                          {createOptionLabel(trimmedSearch)}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {fieldState.error?.message && (
              <FieldError id={errorId}>{fieldState.error.message}</FieldError>
            )}
          </Field>
        );
      }}
    />
  );
};

export { FormCombobox };
