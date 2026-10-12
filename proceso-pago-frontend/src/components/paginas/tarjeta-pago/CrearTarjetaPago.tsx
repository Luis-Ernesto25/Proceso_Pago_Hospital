"use client";

import { useEffect, useState } from "react";
import FormularioTarjetaPago from "@/components/formularios/FormularioTarjetaPago";
import { getEmpleados } from "@/api/empleado.api";

export function CrearTarjetaPago() {
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const respuesta = await getEmpleados(0, 1000);
        if (cancelado) return;

        const opciones = respuesta.data.map((fila) => {
          const id = fila[0];
          const nombre = fila[2];
          const ape1 = fila[3];
          return `${id} - ${nombre} ${ape1}`;
        });
        setListaEmpleados(opciones);
      } catch (e) {
        console.error("Error al cargar empleados:", e);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="p-6">
      <FormularioTarjetaPago listaEmpleados={listaEmpleados} />
    </div>
  );
}