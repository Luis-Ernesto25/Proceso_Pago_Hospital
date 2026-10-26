"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Search, FileDown, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PaginaDobleTablaPaginacion from "@/components/PaginaConDoblePaginacion";
import { cn } from "@/lib/utils";
import {
  getReporteHorasTodos,
  getReporteAusenciasTodos,
  descargarReporteHorasPdf,
  descargarReporteAusenciasPdf,
  enviarReportesPorEmail,
} from "@/api/reporte.api";

// ============================================================
// Columnas
// ============================================================
const COLUMNAS_HORAS = [
  "ID Empleado",
  "ID Ocupación",
  "Tipo Ocupación",
  "263 Días Feriados",
  "267 No Propios",
  "273 No Propios",
  "Horas Guardia (268, 269, 272)",
  "270 Horas Extras",
  "265 Para Choferes",
];

const COLUMNAS_AUSENCIAS = [
  "ID Empleado",
  "ID Ocupación",
  "Tipo Ocupación",
  "Horas Ausencia Just.",
  "Horas Ausencia Inj.",
  "Horas Cert. Médico",
  "Horas Res/22",
  "Horas Lic. Sin Sueldo",
  "Horas Pluriempleo",
  "Horas Lic. Maternidad",
  "Horas Vaca.",
  "Horas Aus. Guardias",
];

function formatearFechaParaURL(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ============================================================
// Componente
// ============================================================
export function VerReporteHoras() {
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [rango, setRango] = useState<{ fi: string; ff: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState<"horas" | "ausencias" | null>(
    null,
  );

  // 👇 NUEVOS estados para email
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  const generarReportes = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("⚠️ Debe seleccionar fecha de inicio y fecha de fin");
      return;
    }
    if (fechaFin < fechaInicio) {
      alert("⚠️ La fecha de inicio no puede ser posterior a la final");
      return;
    }
    setCargando(true);
    try {
      setRango({
        fi: formatearFechaParaURL(fechaInicio),
        ff: formatearFechaParaURL(fechaFin),
      });
    } finally {
      setCargando(false);
    }
  };

  const descargarPdf = async (tipo: "horas" | "ausencias") => {
    if (!rango) return;
    setDescargando(tipo);
    try {
      if (tipo === "horas") {
        await descargarReporteHorasPdf(rango.fi, rango.ff);
      } else {
        await descargarReporteAusenciasPdf(rango.fi, rango.ff);
      }
    } catch (err) {
      console.error(`Error descargando PDF de ${tipo}`, err);
      alert(`❌ ${err instanceof Error ? err.message : "No se pudo descargar"}`);
    } finally {
      setDescargando(null);
    }
  };

  // 👇 NUEVO: handler de envío por email
  const enviarEmail = async () => {
    if (!rango) return;

    const destinatario = email.trim();
    if (!destinatario || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario)) {
      alert("❌ Introduce un email válido");
      return;
    }

    setEnviando(true);
    try {
      const resp = await enviarReportesPorEmail(
        destinatario,
        rango.fi,
        rango.ff,
      );
      alert(`✅ ${resp.mensaje}`);
      setEmail("");
    } catch (err) {
      console.error("Error enviando email", err);
      alert(`❌ ${err instanceof Error ? err.message : "No se pudo enviar"}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* ============ Selector de fechas ============ */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Reporte de Horas y Ausencias
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Fecha inicio */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Fecha inicio</label>
            <Popover>
              <PopoverTrigger
                render={(props) => (
                  <Button
                    {...props}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-[220px] justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio
                      ? format(fechaInicio, "dd/MM/yyyy", { locale: es })
                      : "Seleccione una fecha"}
                  </Button>
                )}
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaInicio}
                  onSelect={setFechaInicio}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha fin */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Fecha final</label>
            <Popover>
              <PopoverTrigger
                render={(props) => (
                  <Button
                    {...props}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-[220px] justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin
                      ? format(fechaFin, "dd/MM/yyyy", { locale: es })
                      : "Seleccione una fecha"}
                  </Button>
                )}
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            onClick={generarReportes}
            disabled={cargando}
            className="!bg-blue-300 hover:!bg-blue-600"
          >
            <Search className="mr-2 h-4 w-4" />
            {cargando ? "Generando..." : "Aceptar"}
          </Button>
        </div>
      </div>

      {/* ============ PDFs + Enviar por email ============ */}
      {rango && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Fila 1: rango + botones de descarga */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Rango: <strong>{rango.fi}</strong> →{" "}
                <strong>{rango.ff}</strong>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => descargarPdf("horas")}
                  disabled={descargando !== null || enviando}
                  className="!border-blue-400 !text-blue-700 hover:!bg-blue-50"
                >
                  {descargando === "horas" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {descargando === "horas" ? "Generando..." : "PDF Horas"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => descargarPdf("ausencias")}
                  disabled={descargando !== null || enviando}
                  className="!border-amber-400 !text-amber-700 hover:!bg-amber-50"
                >
                  {descargando === "ausencias" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {descargando === "ausencias"
                    ? "Generando..."
                    : "PDF Ausencias"}
                </Button>
              </div>
            </div>

            {/* Fila 2: input email + botón enviar */}
            <div className="flex flex-wrap items-end gap-2 border-t pt-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email-destinatario"
                  className="text-xs font-medium text-gray-600"
                >
                  Enviar ambos PDFs a:
                </label>
                <Input
                  id="email-destinatario"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={enviando || descargando !== null}
                  className="w-[280px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !enviando) enviarEmail();
                  }}
                />
              </div>

              <Button
                type="button"
                onClick={enviarEmail}
                disabled={enviando || descargando !== null || !email.trim()}
                className="!bg-emerald-500 hover:!bg-emerald-600 !text-white"
              >
                {enviando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {enviando ? "Enviando..." : "Enviar por email"}
              </Button>

              {enviando && (
                <span className="text-xs text-gray-500">
                  Generando los PDFs y enviando el correo...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ Reportes paginados ============ */}
      {rango && (
        <PaginaDobleTablaPaginacion
          tablaSuperior={{
            titulo: "Reporte de Horas",
            nombresColumnas: COLUMNAS_HORAS,
            funcionBusqueda: (texto) =>
              getReporteHorasTodos(rango.fi, rango.ff, 0, 1000, texto),
            funcionObtenerDatos: (offset, limit) =>
              getReporteHorasTodos(rango.fi, rango.ff, offset, limit),
          }}
          tablaInferior={{
            titulo: "Balance de Ausencias",
            nombresColumnas: COLUMNAS_AUSENCIAS,
            funcionBusqueda: (texto) =>
              getReporteAusenciasTodos(rango.fi, rango.ff, 0, 1000, texto),
            funcionObtenerDatos: (offset, limit) =>
              getReporteAusenciasTodos(rango.fi, rango.ff, offset, limit),
          }}
        />
      )}

      {/* ============ Estado vacío ============ */}
      {!rango && !cargando && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Seleccione un rango de fechas y pulse <strong>Aceptar</strong> para
          ver las dos tablas.
        </div>
      )}
    </div>
  );
}

export default VerReporteHoras;