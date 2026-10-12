"use client";

import { useEffect, useState } from "react";
import FormularioAusencia from "@/components/formularios/FormularioAusencia";
import Selector from "@/components/Selector";
import BarraBusqueda from "@/components/BarraBusqueda";
import { Label } from "@/components/ui/label";
import { Ausencia } from "@/entidades/Ausencia";
import {
  getAusenciaDetalle,
  getAusenciasPaginadas,
  getTiposAusencia,
} from "@/api/ausencia.api";
import { getEmpleados } from "@/api/empleado.api";

// Convierte "yyyy-MM-dd" a Date local (medianoche local)
function fechaISOAaDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Convierte "dd/MM/yyyy" a "yyyy-MM-dd"
function fechaMostradaAISO(fechaMostrada: string): string {
  const [d, m, y] = fechaMostrada.split("/");
  return `${y}-${m}-${d}`;
}

// Convierte "yyyy-MM-dd" a "dd/MM/yyyy"
function fechaISOAmostrada(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function EditarAusencia() {
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);
  const [listaTipos, setListaTipos] = useState<string[]>([]);

  // id del empleado buscado
  const [idEmpleado, setIdEmpleado] = useState<string>("");

  // fechas (en formato "yyyy-MM-dd") de las ausencias de ese empleado
  const [fechasAusencias, setFechasAusencias] = useState<string[]>([]);

  // fecha seleccionada (en "yyyy-MM-dd")
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");

  // ausencia completa para pasar al formulario
  const [ausenciaSeleccionada, setAusenciaSeleccionada] =
    useState<Ausencia | null>(null);

  // Cargar empleados y tipos al montar
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [empleados, tipos] = await Promise.all([
          getEmpleados(0, 1000),
          getTiposAusencia(),
        ]);
        if (cancelado) return;

        setListaEmpleados(
          empleados.data.map((fila) => {
            const id = fila[0];
            const nombre = fila[2];
            const ape1 = fila[3];
            return `${id} - ${nombre} ${ape1}`;
          }),
        );
        setListaTipos(tipos);
      } catch (e) {
        console.error("Error al cargar datos:", e);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // El usuario busca un empleado por id → cargamos todas sus ausencias
  const manejarBusquedaEmpleado = async (texto: string) => {
    if (!texto.trim()) {
      setIdEmpleado("");
      setFechasAusencias([]);
      setFechaSeleccionada("");
      setAusenciaSeleccionada(null);
      return;
    }

    const id = Number(texto.trim());
    if (isNaN(id)) {
      alert("⚠️ El ID debe ser numérico");
      return;
    }

    try {
      setIdEmpleado(String(id));
      setFechaSeleccionada("");
      setAusenciaSeleccionada(null);
      setFechasAusencias([]);

      // Traemos todas las ausencias y filtramos por id_em.
      const todas = await getAusenciasPaginadas(0, 1000);

      const fechas = todas.data
        .filter((fila) => fila[0] === String(id))
        .map((fila) => {
          // fila[3] es "dd/MM/yyyy" → convertimos a "yyyy-MM-dd"
          return fechaMostradaAISO(fila[3]);
        });

      setFechasAusencias(fechas);

      if (fechas.length === 0) {
        alert("⚠️ Ese empleado no tiene ausencias registradas");
      }
    } catch (e) {
      console.error("Error al buscar ausencias:", e);
      alert("❌ Error al buscar las ausencias del empleado");
    }
  };

  // Cuando el usuario elige una fecha, cargamos el detalle de esa ausencia
  useEffect(() => {
    if (!idEmpleado || !fechaSeleccionada) {
      setAusenciaSeleccionada(null);
      return;
    }

    let cancelado = false;

    async function cargar() {
      try {
        const data = await getAusenciaDetalle(idEmpleado, fechaSeleccionada);

        if (cancelado) return;

        setAusenciaSeleccionada({
          id_em: String(data.id_em),
          id_tipo_ausencia: data.id_tipo_ausencia,
          fecha_inicio: fechaISOAaDate(data.fecha_inicio),
          fecha_fin: fechaISOAaDate(data.fecha_fin),
        });
      } catch (e) {
        if (!cancelado) {
          console.error("Error al cargar la ausencia:", e);
          setAusenciaSeleccionada(null);
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [idEmpleado, fechaSeleccionada]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2 text-center">
        Editar Ausencia
      </h1>

      {/* Paso 1: buscar empleado */}
      <div className="space-y-2">
        <Label>Buscar empleado por ID</Label>
        <BarraBusqueda onBuscar={manejarBusquedaEmpleado} />
      </div>

      {/* Paso 2: elegir la ausencia (si el empleado tiene varias) */}
      {fechasAusencias.length > 0 && (
        <div className="space-y-2">
          <Label>Seleccione la ausencia a editar</Label>
          <Selector
            items={fechasAusencias.map(fechaISOAmostrada)}
            value={
              fechaSeleccionada ? fechaISOAmostrada(fechaSeleccionada) : ""
            }
            onChange={(valorMostrado) => {
              setFechaSeleccionada(fechaMostradaAISO(valorMostrado));
            }}
            placeholder="Elija una fecha de inicio"
          />
        </div>
      )}

      {/* Paso 3: formulario reutilizable */}
      {ausenciaSeleccionada ? (
        <FormularioAusencia
          listaEmpleados={listaEmpleados}
          listaTipos={listaTipos}
          ausencia={ausenciaSeleccionada}
        />
      ) : (
        fechasAusencias.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Seleccione una ausencia para editar sus datos.
          </p>
        )
      )}
    </div>
  );
}