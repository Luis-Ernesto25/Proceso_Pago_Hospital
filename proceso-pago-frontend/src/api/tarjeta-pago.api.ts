import { TarjetaPago } from "@/entidades/TarjetaPago";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

/**
 * Convierte un Date a "yyyy-MM-dd" (UTC consistente con el backend).
 */
function formatearFechaUTC(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Lista paginada de tarjetas de pago.
 */
export async function getTarjetasPago(
  offset: number,
  limit: number,
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/tarjeta-pago?offset=${offset}&limit=${limit}`,
    { method: "GET", credentials: "include" },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`,
    );
  }
  return await res.json();
}

/**
 * Busca una tarjeta de pago por el id del empleado.
 * Devuelve una fila string[] (formato que espera la tabla).
 */
export async function getTarjetaPago(idEm: string): Promise<string[]> {
  const res = await fetch(
    `${baseUrl}/tarjeta-pago/basico/${encodeURIComponent(idEm)}`,
    { method: "GET", credentials: "include" },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`,
    );
  }
  return await res.json();
}

/**
 * Verifica si una tarjeta ya existe para ese empleado y fecha de entrada.
 */
export async function existeTarjetaPago(
  idEm: string,
  fechaEntrada: Date,
): Promise<boolean> {
  const fecha = formatearFechaUTC(fechaEntrada);
  const res = await fetch(
    `${baseUrl}/tarjeta-pago/existe/${encodeURIComponent(idEm)}/${fecha}`,
    { method: "GET", credentials: "include" },
  );

  if (!res.ok) {
    throw new Error(`Error al verificar la tarjeta: ${res.status}`);
  }

  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Inserta una nueva tarjeta de pago.
 */
export async function insertarTarjetaPago(
  tarjeta: TarjetaPago,
): Promise<void> {
  const res = await fetch(`${baseUrl}/tarjeta-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id_em: tarjeta.id_em,
      fecha_entrada: formatearFechaUTC(tarjeta.fecha_entrada),
      fecha_salida: formatearFechaUTC(tarjeta.fecha_salida),
      hora_entrada: tarjeta.hora_entrada,
      hora_salida: tarjeta.hora_salida,
    }),
  });

  if (!res.ok) {
    let mensaje = `Error al insertar la tarjeta de pago: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        mensaje = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {
      // body no es JSON
    }
    throw new Error(mensaje);
  }
}

/**
 * Actualiza una tarjeta de pago existente.
 */
export async function editarTarjetaPago(
  idEm: string,
  fechaEntradaOriginal: string,
  tarjeta: TarjetaPago,
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/tarjeta-pago/${encodeURIComponent(idEm)}/${fechaEntradaOriginal}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fecha_salida: formatearFechaUTC(tarjeta.fecha_salida),
        hora_entrada: tarjeta.hora_entrada,
        hora_salida: tarjeta.hora_salida,
      }),
    },
  );

  if (!res.ok) {
    let mensaje = `Error al actualizar la tarjeta: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        mensaje = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {}
    throw new Error(mensaje);
  }
}

/**
 * Obtiene el detalle completo de una tarjeta por (id_em, fecha_entrada).
 */
export async function getTarjetaDetalle(
  idEm: string,
  fechaEntrada: string,
): Promise<{
  id_em: string;
  fecha_entrada: string;
  fecha_salida: string;
  hora_entrada: string;
  hora_salida: string;
}> {
  const res = await fetch(
    `${baseUrl}/tarjeta-pago/detalle/${encodeURIComponent(idEm)}/${fechaEntrada}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al obtener la tarjeta: ${res.status}`);
  }
  return await res.json();
}

export async function getTarjetasPorMes(
  idEm: string,
  fecha: string,
  offset: number,
  limit: number,
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/tarjeta-pago/por-mes/${encodeURIComponent(idEm)}?fecha=${fecha}&offset=${offset}&limit=${limit}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al obtener tarjetas: ${res.status}`);
  }
  return await res.json();
}