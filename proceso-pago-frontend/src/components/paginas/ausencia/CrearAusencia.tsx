"use client";

import { useEffect, useState } from "react";
import FormularioAusencia from "@/components/formularios/FormularioAusencia";
import { getEmpleados } from "@/api/empleado.api";
import { getTiposAusencia } from "@/api/ausencia.api";

export function CrearAusencia() {
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);
  const [listaTipos, setListaTipos] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [empleados, tipos] = await Promise.all([
          getEmpleados(0, 1000),
          getTiposAusencia(),
        ]);

        if (cancelado) return;

        // Convertir los empleados a "id - Nombre Apellido"
        const opcionesEmpleados = empleados.data.map((fila) => {
          const id = fila[0];
          const nombre = fila[2];
          const ape1 = fila[3];
          return `${id} - ${nombre} ${ape1}`;
        });

        setListaEmpleados(opcionesEmpleados);
        setListaTipos(tipos);
      } catch (e) {
        if (cancelado) return;
        console.error("Error al cargar datos:", e);
        alert("❌ Error al cargar empleados o tipos de ausencia");
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Insertar Ausencia
      </h1>
      <FormularioAusencia
        listaEmpleados={listaEmpleados}
        listaTipos={listaTipos}
      />
    </div>
  );
}