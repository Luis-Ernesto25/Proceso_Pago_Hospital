import { ParametrosPaginaBusquedaTablaPaginacion, PaginaBusquedaTablaPaginacion } from "@/components/PaginaBusquedaTablaPaginacion"
import  { getEmpleadosBono, getEmpleadoBono } from '@/api/empleado-bono.api'
function VerEmpleadoBonos() {
  
  const parametros: ParametrosPaginaBusquedaTablaPaginacion ={
    nombresColumnas: ["Id Empleado", "Bonos"],
    funcionBusqueda: getEmpleadoBono,
    funcionObtenerDatos: getEmpleadosBono,
  }
  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros}></PaginaBusquedaTablaPaginacion>
    </div>
  )
}

export default VerEmpleadoBonos