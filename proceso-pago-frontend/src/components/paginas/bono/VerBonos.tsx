import PaginaBusquedaTablaPaginacion, { ParametrosPaginaBusquedaTablaPaginacion } from "@/components/PaginaBusquedaTablaPaginacion";
import { getBonoString, getBonos } from "@/api/bono.api";

function VerBonos() {
  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: ["Bono", "Monto Mensual"],
    funcionBusqueda: getBonoString,
    funcionObtenerDatos: getBonos,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion
        {...parametros}
      ></PaginaBusquedaTablaPaginacion>
    </div>
  );
}

export default VerBonos;
