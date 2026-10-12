"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface SelectorConBusquedaProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  onEmptyMessage: string;
  excluirValor?: string;
}

export function SelectorConBusqueda({
  value,
  onChange,
  options,
  placeholder,
  onEmptyMessage,
  excluirValor,
}: SelectorConBusquedaProps) {
  const [open, setOpen] = useState(false);

  const opcionesFiltradas = options.filter(
    (opcion) => opcion !== excluirValor
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white hover:bg-gray-50 border border-gray-300"
            type="button"
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border border-gray-200 rounded-md bg-white">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="border-b border-gray-200"
          />
          <CommandList className="max-h-60 overflow-auto">
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
              {onEmptyMessage}
            </CommandEmpty>

            <CommandGroup>
              {opcionesFiltradas.map((opcion) => (
                <CommandItem
                  key={opcion}
                  value={opcion}
                  onSelect={() => {
                    onChange(opcion);
                    setOpen(false);
                  }}
                  className="bg-white hover:bg-gray-100 cursor-pointer flex items-center px-3 py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opcion ? "opacity-100 text-black" : "opacity-0"
                    )}
                  />
                  <span className="text-gray-900">{opcion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}