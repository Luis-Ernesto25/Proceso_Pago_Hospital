"use client";
import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { getTarjetaPago, getTarjetasPago } from "@/api/tarjeta-pago.api";

export function VerTarjetasPago() {
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
    funcionObtenerDatos: getTarjetasPago,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros} />
    </div>
  );
}