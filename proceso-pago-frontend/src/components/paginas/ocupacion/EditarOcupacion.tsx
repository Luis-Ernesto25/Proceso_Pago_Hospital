"use client";

import { useEffect, useState } from "react";
import FormularioOcupacion from "@/components/formularios/FormularioOcupacion";
import { SelectorConBusqueda } from "@/components/SelectorConBusqueda";
import { Label } from "@/components/ui/label";
import {
  getOcupacionPorId,
  getTodasOcupaciones,
} from "@/api/ocupacion.api";
import { Ocupacion } from "@/entidades/Ocupacion";

function EditarOcupacion() {
  const [opciones, setOpciones] = useState<string[]>([]);
  const [idSeleccionado, setIdSeleccionado] = useState<string>("");
  const [ocupacionSeleccionada, setOcupacionSeleccionada] =
    useState<Ocupacion | null>(null);

  // Cargar todas las ocupaciones para el selector
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const data = await getTodasOcupaciones().catch(() => []);
      if (!cancelado) {
        setOpciones(data.map((oc) => oc.id_oc));
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Cuando cambia la selección, cargar el objeto completo
  useEffect(() => {
    if (!idSeleccionado) {
      setOcupacionSeleccionada(null);
      return;
    }

    let cancelado = false;

    async function cargar() {
      try {
        const ocupacion = await getOcupacionPorId(idSeleccionado);
        if (!cancelado) setOcupacionSeleccionada(ocupacion);
      } catch (error) {
        console.error("Error al buscar la ocupación:", error);
        if (!cancelado) setOcupacionSeleccionada(null);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [idSeleccionado]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-2">
        <Label>Seleccione la ocupación a editar</Label>
        <SelectorConBusqueda
          value={idSeleccionado}
          onChange={setIdSeleccionado}
          options={opciones}
          placeholder="Buscar ocupación..."
          onEmptyMessage="No se encontró la ocupación."
        />
      </div>

      <FormularioOcupacion ocupacion={ocupacionSeleccionada} />
      
        
      
    </div>
  );
}

export default EditarOcupacion;