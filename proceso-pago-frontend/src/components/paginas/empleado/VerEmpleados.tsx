import {
  ParametrosPaginaBusquedaTablaPaginacion,
  PaginaBusquedaTablaPaginacion,
} from "@/components/PaginaBusquedaTablaPaginacion";
import { getEmpleados, getEmpleado } from "@/api/empleado.api";

function VerEmpleados() {
  const parametros: ParametrosPaginaBusquedaTablaPaginacion = {
    nombresColumnas: [
            'Id', 'Carnet', 'Nombre',
            'Ap Paterno', 'Ap Materno',
            'Nivel Ed', 'Direccion', 'Telefono'],
    funcionBusqueda: getEmpleado,
    funcionObtenerDatos: getEmpleados,
  };

  return (
    <div>
      <PaginaBusquedaTablaPaginacion
        {...parametros}
      ></PaginaBusquedaTablaPaginacion>
    </div>
  );
}

export default VerEmpleados;
