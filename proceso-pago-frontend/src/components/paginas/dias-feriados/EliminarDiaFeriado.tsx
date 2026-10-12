"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { deleteDiaFeriado, getTodosDiasFeriados } from "@/api/dia-feriado.api";
import { Label } from "@/components/ui/label";

function formatearFechaUTC(fecha: Date | string): string {
  const d = new Date(fecha);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fechaISOAaLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function EliminarDiaFeriado() {
  const [mounted, setMounted] = useState(false);
  const [fechas, setFechas] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<
    Date | undefined
  >();
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const data = await getTodosDiasFeriados().catch(() => []);
      if (!cancelado) {
        setFechas(data.map((d) => formatearFechaUTC(d.fecha_dia)));
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex justify-center pt-16 p-6">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  const fechasComoDate = fechas.map(fechaISOAaLocal);

  async function handleEliminar() {
    if (!fechaSeleccionada) return;

    const y = fechaSeleccionada.getFullYear();
    const m = String(fechaSeleccionada.getMonth() + 1).padStart(2, "0");
    const d = String(fechaSeleccionada.getDate()).padStart(2, "0");
    const fechaISO = `${y}-${m}-${d}`;

    if (!fechas.includes(fechaISO)) {
      alert("⚠️ Esa fecha no es un día feriado registrado.");
      return;
    }

    try {
      setEliminando(true);
      await deleteDiaFeriado(fechaISO);
      alert(`✅ Día feriado ${fechaISO} eliminado correctamente.`);
      setFechas((prev) => prev.filter((f) => f !== fechaISO));
      setFechaSeleccionada(undefined);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center pt-16 p-6">
      <div className="w-full max-w-md space-y-4">
        <Label className="block text-xl text-center">
          Seleccione Día Feriado
        </Label>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={fechaSeleccionada}
            onSelect={setFechaSeleccionada}
            modifiers={{ feriado: fechasComoDate }}
            modifiersClassNames={{
              feriado:
                "bg-red-100 text-red-900 font-semibold rounded-md hover:bg-red-200",
            }}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            className="bg-blue-300! hover:bg-blue-600!"
            onClick={handleEliminar}
            disabled={!fechaSeleccionada || eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar Día Feriado"}
          </Button>
        </div>
      </div>
    </div>
  );
}
