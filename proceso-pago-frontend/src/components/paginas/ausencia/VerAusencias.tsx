"use client";

import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { getAusencia, getAusenciasPaginadas } from "@/api/ausencia.api";

export function VerAusencias() {
  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: [
      "ID Empleado",
      "Empleado",
      "Tipo Ausencia",
      "Fecha Inicio",
      "Fecha Fin",
      "Días",
    ],
    funcionBusqueda: getAusencia,
    funcionObtenerDatos: getAusenciasPaginadas,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros} />
    </div>
  );
}