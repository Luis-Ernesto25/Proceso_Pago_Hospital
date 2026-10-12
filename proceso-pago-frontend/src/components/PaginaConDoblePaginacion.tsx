"use client";

import { useState, useEffect, useCallback } from "react";
import Paginacion from "@/components/Paginacion";
import { TablaDatos } from "@/components/TablaDatos";
import BarraBusqueda from "@/components/BarraBusqueda";

export interface ConfigTabla {
  titulo: string;
  nombresColumnas: string[];
  /** Búsqueda: mismo shape que funcionObtenerDatos → { data, total }. */
  funcionBusqueda: (
    texto: string,
  ) => Promise<{ data: string[][]; total: number }>;
  /** Carga paginada. */
  funcionObtenerDatos: (
    offset: number,
    limit: number,
  ) => Promise<{ data: string[][]; total: number }>;
}

interface Props {
  tablaSuperior: ConfigTabla;
  tablaInferior: ConfigTabla;
  activaBarraBusqueda?: boolean;
  filasPorPagina?: number;
}

export function PaginaDobleTablaPaginacion({
  tablaSuperior,
  tablaInferior,
  activaBarraBusqueda = true,
  filasPorPagina = 16,
}: Props) {
  // ----- Superior -----
  const [pagSup, setPagSup] = useState(1);
  const [datosSup, setDatosSup] = useState<string[][]>([]);
  const [totalSup, setTotalSup] = useState(0);
  const [cargandoSup, setCargandoSup] = useState(false);

  // ----- Inferior -----
  const [pagInf, setPagInf] = useState(1);
  const [datosInf, setDatosInf] = useState<string[][]>([]);
  const [totalInf, setTotalInf] = useState(0);
  const [cargandoInf, setCargandoInf] = useState(false);

  // ----- Búsqueda -----
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);

  // ----- Carga normal -----
  const cargarSup = useCallback(
    async (pagina: number) => {
      setCargandoSup(true);
      try {
        const offset = (pagina - 1) * filasPorPagina;
        const r = await tablaSuperior.funcionObtenerDatos(
          offset,
          filasPorPagina,
        );
        setDatosSup(r.data);
        setTotalSup(r.total);
      } catch (e) {
        console.error("Error tabla superior:", e);
        setDatosSup([]);
        setTotalSup(0);
      } finally {
        setCargandoSup(false);
      }
    },
    [filasPorPagina, tablaSuperior],
  );

  const cargarInf = useCallback(
    async (pagina: number) => {
      setCargandoInf(true);
      try {
        const offset = (pagina - 1) * filasPorPagina;
        const r = await tablaInferior.funcionObtenerDatos(
          offset,
          filasPorPagina,
        );
        setDatosInf(r.data);
        setTotalInf(r.total);
      } catch (e) {
        console.error("Error tabla inferior:", e);
        setDatosInf([]);
        setTotalInf(0);
      } finally {
        setCargandoInf(false);
      }
    },
    [filasPorPagina, tablaInferior],
  );

  useEffect(() => {
    if (textoBusqueda.trim() === "") cargarSup(pagSup);
  }, [pagSup, cargarSup, textoBusqueda]);

  useEffect(() => {
    if (textoBusqueda.trim() === "") cargarInf(pagInf);
  }, [pagInf, cargarInf, textoBusqueda]);

 const manejarBusqueda = async (texto: string) => {
  const limpio = texto.trim();

  // Si se limpia el buscador, volvemos a la paginación normal
  if (limpio === "") {
    setTextoBusqueda("");
    setPagSup(1);
    setPagInf(1);
    cargarSup(1);
    cargarInf(1);
    return;
  }

  // ⚠️ Solo IDs numéricos: si no es número, no consultamos nada
  if (!/^\d+$/.test(limpio)) {
    setTextoBusqueda(limpio);
    setDatosSup([]);
    setTotalSup(0);
    setDatosInf([]);
    setTotalInf(0);
    return;
  }

  setBuscando(true);
  setTextoBusqueda(limpio);

  const [rSup, rInf] = await Promise.allSettled([
    tablaSuperior.funcionBusqueda(limpio),
    tablaInferior.funcionBusqueda(limpio),
  ]);

  if (rSup.status === "fulfilled") {
    setDatosSup(rSup.value.data);
    setTotalSup(rSup.value.total);
  } else {
    console.error("Error búsqueda superior:", rSup.reason);
    setDatosSup([]);
    setTotalSup(0);
  }

  if (rInf.status === "fulfilled") {
    setDatosInf(rInf.value.data);
    setTotalInf(rInf.value.total);
  } else {
    console.error("Error búsqueda inferior:", rInf.reason);
    setDatosInf([]);
    setTotalInf(0);
  }

  setBuscando(false);
  setPagSup(1);
  setPagInf(1);
};

  // ----- Datos y páginas efectivas -----
  const enBusqueda = textoBusqueda.trim() !== "";

  const totalPagSup = enBusqueda
    ? 1
    : Math.max(1, Math.ceil(totalSup / filasPorPagina));
  const totalPagInf = enBusqueda
    ? 1
    : Math.max(1, Math.ceil(totalInf / filasPorPagina));

  // ----- Render de una tabla -----
  const renderTabla = (
    cfg: ConfigTabla,
    datos: string[][],
    total: number,
    pag: number,
    totalPag: number,
    cargando: boolean,
    setPag: (n: number) => void,
  ) => (
    <div className="flex flex-col rounded-lg border bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
        {cfg.titulo}
      </div>
      <div className="text-xs text-gray-500 px-4 py-1 bg-gray-50 border-b">
        {cargando || buscando
          ? "Cargando..."
          : `Página ${pag} de ${totalPag} | Mostrando ${datos.length} registros de ${total}`}
      </div>
      <div className="max-h-[40vh] overflow-auto">
        {datos.length === 0 && !cargando && !buscando ? (
          <div className="p-6 text-center text-sm text-gray-500">
            {enBusqueda
              ? `Sin resultados para "${textoBusqueda}"`
              : "Sin datos"}
          </div>
        ) : (
          <TablaDatos columnas={cfg.nombresColumnas} datos={datos} />
        )}
      </div>
      <Paginacion
        paginaActual={pag}
        totalPaginas={totalPag}
        onCambiarPagina={(p) => {
          if (p >= 1 && p <= totalPag) setPag(p);
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col flex-1 gap-4">
      {activaBarraBusqueda && <BarraBusqueda onBuscar={manejarBusqueda} />}

      {enBusqueda && (
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-1">
          {buscando
            ? `Buscando "${textoBusqueda}"...`
            : `Resultados para "${textoBusqueda}"`}
        </div>
      )}

      {renderTabla(
        tablaSuperior,
        datosSup,
        totalSup,
        pagSup,
        totalPagSup,
        cargandoSup,
        setPagSup,
      )}

      {renderTabla(
        tablaInferior,
        datosInf,
        totalInf,
        pagInf,
        totalPagInf,
        cargandoInf,
        setPagInf,
      )}
    </div>
  );
}

export default PaginaDobleTablaPaginacion;