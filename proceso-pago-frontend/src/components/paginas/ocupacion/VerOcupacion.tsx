import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { getOcupacion, getOcupaciones } from "@/api/ocupacion.api";

function VerOcupaciones() {
  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: [
      "Id",
      "Salario Mensual",
      "Horas Jornada",
      "Tipo",
      "Horas Guardia",
      "Costo Hora Guardia",
    ],
    funcionBusqueda: getOcupacion,
    funcionObtenerDatos: getOcupaciones,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros} />
    </div>
  );
}

export default VerOcupaciones;
