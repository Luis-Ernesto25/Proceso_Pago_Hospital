"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BarraBusqueda({
  onBuscar,
}: {
  onBuscar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");

  const manejarBusqueda = () => {
    onBuscar(texto.trim());
  };

  const manejarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      manejarBusqueda();
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-xs">
      <Input
        placeholder="Buscar por id"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={manejarKeyDown}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={manejarBusqueda}
      >
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
}