"use client";

import { useState } from "react";
import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import BarraBusqueda from "@/components/BarraBusqueda";
import {
  getTarjetaPago,
  getTarjetasPorMes,
} from "@/api/tarjeta-pago.api";

// Convierte un Date a "YYYY-MM"
function fechaAMES(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// "YYYY-MM" → "Septiembre 2026"
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function mesLegible(iso: string): string {
  const [anio, mes] = iso.split("-").map(Number);
  return `${MESES[mes - 1]} ${anio}`;
}

export function VerTarjetasPorMes() {
  const [idEmpleado, setIdEmpleado] = useState("");
  const [fecha, setFecha] = useState<Date | undefined>(new Date());

  const manejarBusquedaEmpleado = (texto: string) => {
    const id = Number(texto.trim());
    if (isNaN(id) || id <= 0) {
      alert("⚠️ El ID debe ser un número válido");
      return;
    }
    setIdEmpleado(String(id));
  };

  // Mientras no haya empleado, solo se muestra el buscador
  if (!idEmpleado) {
    return (
      <div className="p-6 space-y-4 max-w-md mx-auto">
        <Label>Buscar empleado por ID</Label>
        <BarraBusqueda onBuscar={manejarBusquedaEmpleado} />
        <p className="text-sm text-muted-foreground">
          Escriba el ID del empleado para ver sus tarjetas del mes.
        </p>
      </div>
    );
  }

  const mes = fecha ? fechaAMES(fecha) : fechaAMES(new Date());

  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: [
      "ID Empleado",
      "Nombre",
      "Fecha Entrada",
      "Fecha Salida",
      "Hora Entrada",
      "Hora Salida",
    ],
    funcionBusqueda: getTarjetaPago,
    funcionObtenerDatos: (offset, limit) =>
      getTarjetasPorMes(idEmpleado, mes, offset, limit),
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 pt-4 space-y-6">
        {/* Buscar empleado */}
        <div className="space-y-2 max-w-md">
          <Label>Cambiar empleado</Label>
          <BarraBusqueda onBuscar={manejarBusquedaEmpleado} />
        </div>

        {/* Calendario */}
        <div className="space-y-2">
          <Label>Elija una fecha del mes a consultar</Label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="rounded-md border bg-white p-2">
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={setFecha}
                locale={undefined}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-base text-foreground">
                Mes seleccionado:
              </p>
              <p className="text-lg text-cyan-500">{mesLegible(mes)}</p>
              <p className="mt-2">
                Cualquier fecha dentro del mes selecciona ese mes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla paginada del mes elegido */}
      <PaginaBusquedaTablaPaginacion activaBarraBusqueda = {false}
        key={`${idEmpleado}-${mes}`}
        {...parametros}
      />
    </div>
  );
}