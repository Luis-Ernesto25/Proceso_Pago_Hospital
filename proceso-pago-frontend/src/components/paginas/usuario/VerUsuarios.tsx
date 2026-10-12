"use client";

import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { getUsuario, getUsuariosPaginados } from "@/api/usuario.api";

export function VerUsuarios() {
  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: ["ID", "Usuario", "Rol"],
    funcionBusqueda: getUsuario,
    funcionObtenerDatos: getUsuariosPaginados,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros} />
    </div>
  );
}