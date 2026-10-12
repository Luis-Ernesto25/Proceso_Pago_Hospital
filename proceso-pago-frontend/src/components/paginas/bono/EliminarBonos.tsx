"use client";

import { useEffect, useState } from "react";
import { SelectorConBusqueda } from "@/components/SelectorConBusqueda";
import { deleteBono, getTodosBonos } from "@/api/bono.api";
import { Button } from "@/components/ui/button";

function EliminarBonos() {
  const [bonoSeleccionado, setBonoSeleccionado] = useState<string>("");
  const [bonos, setBonos] = useState<string[]>([]);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const data = await getTodosBonos().catch(() => []);
      if (!cancelado) setBonos(data);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function handleEliminar() {
    if (!bonoSeleccionado) return;

    try {
      setEliminando(true);
      await deleteBono(bonoSeleccionado);
      alert(`✅ ¡Éxito! El bono "${bonoSeleccionado}" fue eliminado correctamente.`);
      setBonos((prev) => prev.filter((b) => b !== bonoSeleccionado));
      setBonoSeleccionado("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar el bono");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <SelectorConBusqueda
          value={bonoSeleccionado}
          onChange={setBonoSeleccionado}
          options={bonos}
          onEmptyMessage="No se encontraron Bonos"
          placeholder="Elija el Bono"
        />

        <Button
          type="button"
          className="bg-blue-300! hover:bg-blue-600! self-start"
          onClick={handleEliminar}
          disabled={!bonoSeleccionado || eliminando}
        >
          {eliminando ? "Eliminando..." : "Eliminar Bono"}
        </Button>
      </div>
    </div>
  );
}

export default EliminarBonos;