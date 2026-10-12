"use client";

import { useEffect, useState } from "react";
import FormularioTarjetaPago from "@/components/formularios/FormularioTarjetaPago";
import Selector from "@/components/Selector";
import BarraBusqueda from "@/components/BarraBusqueda";
import { Label } from "@/components/ui/label";
import { TarjetaPago } from "@/entidades/TarjetaPago";
import {
  getTarjetaDetalle,
  getTarjetasPago,
} from "@/api/tarjeta-pago.api";
import { getEmpleados } from "@/api/empleado.api";

// Convierte "yyyy-MM-dd" a Date local
function fechaISOAaDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// "yyyy-MM-dd" → "dd/MM/yyyy"
function fechaISOAmostrada(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// "dd/MM/yyyy" → "yyyy-MM-dd"
function fechaMostradaAISO(fechaMostrada: string): string {
  const [d, m, y] = fechaMostrada.split("/");
  return `${y}-${m}-${d}`;
}

export function EditarTarjetaPago() {
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);

  const [idEmpleado, setIdEmpleado] = useState<string>("");
  const [fechasEntrada, setFechasEntrada] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [tarjetaSeleccionada, setTarjetaSeleccionada] =
    useState<TarjetaPago | null>(null);

  // Cargar empleados al montar
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const empleados = await getEmpleados(0, 1000);
        if (cancelado) return;
        setListaEmpleados(
          empleados.data.map((fila) => {
            const id = fila[0];
            const nombre = fila[2];
            const ape1 = fila[3];
            return `${id} - ${nombre} ${ape1}`;
          }),
        );
      } catch (e) {
        console.error("Error al cargar empleados:", e);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Buscar empleado y cargar sus tarjetas
  const manejarBusquedaEmpleado = async (texto: string) => {
    if (!texto.trim()) {
      setIdEmpleado("");
      setFechasEntrada([]);
      setFechaSeleccionada("");
      setTarjetaSeleccionada(null);
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
      setTarjetaSeleccionada(null);
      setFechasEntrada([]);

      // 👇 nombre actualizado
      const todas = await getTarjetasPago(0, 1000);
      const fechas = todas.data
        .filter((fila) => fila[0] === String(id))
        .map((fila) => fechaMostradaAISO(fila[2])); // fila[2] = fecha entrada

      setFechasEntrada(fechas);

      if (fechas.length === 0) {
        alert("⚠️ Ese empleado no tiene tarjetas de pago registradas");
      }
    } catch (e) {
      console.error("Error al buscar tarjetas:", e);
      alert("❌ Error al buscar las tarjetas");
    }
  };

  // Cargar detalle al seleccionar fecha
  useEffect(() => {
    if (!idEmpleado || !fechaSeleccionada) {
      setTarjetaSeleccionada(null);
      return;
    }

    let cancelado = false;

    async function cargar() {
      try {
        const data = await getTarjetaDetalle(idEmpleado, fechaSeleccionada);
        if (cancelado) return;

        setTarjetaSeleccionada({
          id_em: data.id_em,
          fecha_entrada: fechaISOAaDate(data.fecha_entrada),
          fecha_salida: fechaISOAaDate(data.fecha_salida),
          hora_entrada: data.hora_entrada,
          hora_salida: data.hora_salida,
        });
      } catch (e) {
        if (!cancelado) {
          console.error("Error al cargar la tarjeta:", e);
          setTarjetaSeleccionada(null);
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
        Editar Tarjeta de Pago
      </h1>

      {/* Paso 1: buscar empleado */}
      <div className="space-y-2">
        <Label>Buscar empleado por ID</Label>
        <BarraBusqueda onBuscar={manejarBusquedaEmpleado} />
      </div>

      {/* Paso 2: elegir tarjeta por fecha de entrada */}
      {fechasEntrada.length > 0 && (
        <div className="space-y-2">
          <Label>Seleccione la tarjeta a editar</Label>
          <Selector
            items={fechasEntrada.map(fechaISOAmostrada)}
            value={
              fechaSeleccionada ? fechaISOAmostrada(fechaSeleccionada) : ""
            }
            onChange={(valorMostrado) => {
              setFechaSeleccionada(fechaMostradaAISO(valorMostrado));
            }}
            placeholder="Elija la fecha de entrada"
          />
        </div>
      )}

      {/* Paso 3: formulario */}
      {tarjetaSeleccionada ? (
        <FormularioTarjetaPago
          listaEmpleados={listaEmpleados}
          tarjeta={tarjetaSeleccionada}
        />
      ) : (
        fechasEntrada.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Seleccione una tarjeta para editar sus datos.
          </p>
        )
      )}
    </div>
  );
}