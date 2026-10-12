"use client";

import { useState, useEffect } from "react";
import { Bono } from "@/entidades/Bono";
import { getTodosBonos, getBono } from "@/api/bono.api";
import FormularioBono from "@/components/formularios/FormularioBono";
import ComboBox from "@/components/ComboBox";
import { Label } from "@/components/ui/label";

function EditarBono() {
  const [idsBonos, setIdsBonos] = useState<string[]>([]);
  const [loadingBonos, setLoadingBonos] = useState(true);
  const [bonoSeleccionado, setBonoSeleccionado] = useState<Bono | null>(null);

  useEffect(() => {
    const cargarBonos = async () => {
      try {
        const data = await getTodosBonos();
        setIdsBonos(data);
        setLoadingBonos(false);
      } catch (e) {
        console.error("Error cargando bonos:", e);
        alert("Error al cargar los bonos. Por favor, recarga la página.");
        setLoadingBonos(false);
      }
    };

    cargarBonos();
  }, []);

  const handleSeleccionarBono = async (idBo: string) => {
    try {
      const bono = await getBono(idBo);
      setBonoSeleccionado(bono);
    } catch (error) {
      console.error("Error al obtener el bono:", error);
      setBonoSeleccionado(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-2">
        <Label>Selecciona un bono para editar</Label>
        <ComboBox
          value={bonoSeleccionado?.id_bo ?? ""}
          onChange={handleSeleccionarBono}
          items={idsBonos}
          placeholder={loadingBonos ? "Cargando bonos..." : "Elija bono..."}
          searchPlaceholder="Elija bono..."
          emptyMessage="No se encontró el bono."
        />
      </div>

      <FormularioBono bono={bonoSeleccionado} />
    </div>
  );
}

export default EditarBono;
