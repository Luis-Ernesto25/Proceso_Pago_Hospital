"use client";

import { useState, useEffect, useCallback } from "react";
import Paginacion from "../components/Paginacion";
import { TablaDatos } from "./TablaDatos";
import BarraBusqueda from "../components/BarraBusqueda";
import { getEmpleadosOcupacion } from "../api/empleado-ocupacion.api";

// Dos columnas fijas
//const NOMBRES_COLUMNAS = ["ID Empleado", "Ocupación"];

export interface ParametrosPaginaBusquedaTablaPaginacion {
  nombresColumnas: string[];
  activaBarraBusqueda?: boolean;
  funcionBusqueda: (number) => Promise<string[]>;
  funcionObtenerDatos: (
    offset: number,
    filasPorPagina: number
  ) => Promise<{ data: string[][]; total: number }>;
}

export function PaginaBusquedaTablaPaginacion({
  nombresColumnas,
  activaBarraBusqueda = true,
  funcionBusqueda,
  funcionObtenerDatos,
}: ParametrosPaginaBusquedaTablaPaginacion) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [datosPagina, setDatosPagina] = useState<string[][]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [resultadoBusqueda, setResultadoBusqueda] = useState<string[][] | null>(
    null
  );
  const [cargando, setCargando] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const filasPorPagina = 16;

  const cargarPagina = useCallback(
    async (pagina: number) => {
      setCargando(true);
      try {
        const offset = (pagina - 1) * filasPorPagina;
        const response = await funcionObtenerDatos(offset, filasPorPagina);
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
    },
    [filasPorPagina]
  );

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

  const manejarBusqueda = async (texto: string) => {
    if (texto.trim() === "") {
      setResultadoBusqueda(null);
      return;
    }
    const textoMin = texto.toLowerCase();
    //const idNumerico = Number(texto);
    try {
      const fila = await funcionBusqueda(texto.trim());
      setResultadoBusqueda(fila && fila.length > 0 ? [fila] : []);
    } catch (error: any) {
      //console.error("Error en búsqueda:", error);
      alert(`❌ ${error.message || "Error al buscar"}`);
      setResultadoBusqueda([]);
    }
  };

  const datosMostrados =
    resultadoBusqueda !== null ? resultadoBusqueda : datosPagina;
  const totalPaginasMostradas = resultadoBusqueda !== null ? 1 : totalPaginas;

  return (
    <div className="flex flex-col flex-1">
      {activaBarraBusqueda && <BarraBusqueda onBuscar={manejarBusqueda} />}

      <div className="text-xs text-gray-500 px-4 py-1 bg-gray-50">
        {cargando
          ? "Cargando..."
          : `Página ${paginaActual} de ${totalPaginasMostradas} | Mostrando ${datosMostrados.length} registros de ${totalRegistros}`}
      </div>
      <div className="flex-1 overflow-y-auto">
        <TablaDatos
          columnas={nombresColumnas}
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

export default PaginaBusquedaTablaPaginacion;
