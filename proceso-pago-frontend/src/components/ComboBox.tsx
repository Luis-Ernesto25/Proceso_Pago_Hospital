"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Valor(es) que no deben aparecer en la lista */
  excluirValor?: string;
  disabled?: boolean;
}

function ComboBox({
  value,
  onChange,
  items,
  placeholder = "Selecciona una opción...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  excluirValor,
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);

  const itemsFiltrados = excluirValor
    ? items.filter((item) => item !== excluirValor)
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between bg-white hover:bg-gray-50 border border-gray-300"
            type="button"
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent className="w-full p-0 shadow-lg border border-gray-200 rounded-md bg-white">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="border-b border-gray-200"
          />
          <CommandList className="max-h-60 overflow-auto">
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {itemsFiltrados.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  className="bg-white hover:bg-gray-100 cursor-pointer flex items-center px-3 py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item ? "opacity-100 text-black" : "opacity-0"
                    )}
                  />
                  <span className="text-gray-900">{item}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ComboBox;