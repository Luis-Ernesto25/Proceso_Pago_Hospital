import { ParametrosPaginaBusquedaTablaPaginacion, PaginaBusquedaTablaPaginacion } from "@/components/PaginaBusquedaTablaPaginacion"
import  { getEmpleadosOcupacion, getEmpleadoOcupacion } from '@/api/empleado-ocupacion.api'
function VerEmpleadoOcupacion() {
  
  const parametros: ParametrosPaginaBusquedaTablaPaginacion ={
    nombresColumnas: ["Id Empleado", "Ocupacion"],
    funcionBusqueda: getEmpleadoOcupacion,
    funcionObtenerDatos: getEmpleadosOcupacion
  }
  
  
  return (
    <div>
      <PaginaBusquedaTablaPaginacion {...parametros}></PaginaBusquedaTablaPaginacion>
    </div>
  )
}

export default VerEmpleadoOcupacion


/*"use client";

import { useState, useEffect, useCallback } from "react";
import Paginacion from '../../../components/Paginacion';
import { TablaDatos } from '../../../components/TablaEmpleado-Ocupacion';
import BarraBusqueda from '../../../components/BarraBusqueda';
import { getEmpleadosOcupacion } from '../../../api/empleado-ocupacion.api';

// Dos columnas fijas
const NOMBRES_COLUMNAS = ["ID Empleado", "Ocupación"];

function VerEmpleadoOcupacion() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [datosPagina, setDatosPagina] = useState<string[][]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [resultadoBusqueda, setResultadoBusqueda] = useState<string[][] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const filasPorPagina = 18;

  const cargarPagina = useCallback(async (pagina: number) => {
    setCargando(true);
    try {
      const offset = (pagina - 1) * filasPorPagina;
      const response = await getEmpleadosOcupacion(offset, filasPorPagina);
      // La API devuelve { data: string[][], total: number }
      setDatosPagina(response.data);
      setTotalRegistros(response.total);
      setTotalPaginas(Math.ceil(response.total / filasPorPagina));
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setDatosPagina([]);
      setTotalPaginas(1);
      setTotalRegistros(0);
    } finally {
      setCargando(false);
    }
  }, [filasPorPagina]);

  useEffect(() => {
    cargarPagina(paginaActual);
  }, [paginaActual, cargarPagina]);

  const manejarCambioPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const manejarActualizacion = () => {
    cargarPagina(paginaActual);
    setResultadoBusqueda(null);
  };

  const manejarBusqueda = (texto: string) => {
    if (texto.trim() === "") {
      setResultadoBusqueda(null);
      return;
    }
    const textoMin = texto.toLowerCase();
    const idNumerico = Number(texto);
    const fila = datosPagina.find((empOcu) => 
      !isNaN(idNumerico) 
        ? String(empOcu[0]) === String(idNumerico)
        : String(empOcu[1]).toLowerCase().includes(textoMin)
    );
    setResultadoBusqueda(fila ? [fila] : []);
  };

  const datosMostrados = resultadoBusqueda !== null ? resultadoBusqueda : datosPagina;
  const totalPaginasMostradas = resultadoBusqueda !== null ? 1 : totalPaginas;

  return (
    <div className="flex flex-col flex-1">
      <BarraBusqueda onBuscar={manejarBusqueda} />
      <div className="text-xs text-gray-500 px-4 py-1 bg-gray-50">
        {cargando ? 'Cargando...' : 
          `Página ${paginaActual} de ${totalPaginasMostradas} | Mostrando ${datosMostrados.length} registros de ${totalRegistros}`}
      </div>
      <div className="flex-1 overflow-y-auto">
        <TablaDatos 
          columnas={NOMBRES_COLUMNAS} 
          datos={datosMostrados}
          //onDatosActualizados={manejarActualizacion}
        />
      </div>
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginasMostradas}
        onCambiarPagina={manejarCambioPagina}
      />
    </div>
  );
}

export default VerEmpleadoOcupacion;*/