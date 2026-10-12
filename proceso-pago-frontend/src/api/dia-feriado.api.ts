import { DiaFeriado } from "@/entidades/DiaFeriado";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Obtiene todos los días feriados.
 */
export async function getTodosDiasFeriados(): Promise<DiaFeriado[]> {
  const res = await fetch(`${baseUrl}/api/dia-feriado`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener días feriados: ${res.status}`);
  }

  return await res.json();
}

/**
 * Obtiene un día feriado por su fecha (ISO yyyy-MM-dd).
 */
export async function getDiaFeriadoPorFecha(
  fecha: string
): Promise<DiaFeriado> {
  const res = await fetch(`${baseUrl}/api/dia-feriado/${fecha}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener el día feriado: ${res.status}`);
  }

  return await res.json();
}

/**
 * Verifica si un día feriado ya existe en la base de datos.
 */
export async function existeDiaFeriado(
  diaFeriado: DiaFeriado
): Promise<boolean> {
  const fecha = formatearFecha(diaFeriado.fecha_dia);
  const res = await fetch(`${baseUrl}/api/dia-feriado/existe/${fecha}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Error al verificar el día feriado: ${res.status}`);
  }

  // El backend puede devolver { existe: true } o un boolean directo.
  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Inserta un nuevo día feriado.
 */
export async function insertarDiaFeriado(
  diaFeriado: DiaFeriado
): Promise<DiaFeriado> {
  const res = await fetch(`${baseUrl}/api/dia-feriado`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fecha_dia: formatearFecha(diaFeriado.fecha_dia),
    }),
  });

  if (!res.ok) {
    let mensaje = `Error al insertar el día feriado: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        mensaje = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {
      // body no es JSON, mantenemos el mensaje por defecto
    }
    throw new Error(mensaje);
  }

  return await res.json();
}

/**
 * Elimina un día feriado por su fecha.
 */
export async function deleteDiaFeriado(fecha: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/dia-feriado/${fecha}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let mensaje = `Error al eliminar el día feriado: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        mensaje = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {
      // body no es JSON, mantenemos el mensaje por defecto
    }
    throw new Error(mensaje);
  }
}

/**
 * Convierte un Date a string "yyyy-MM-dd" para enviarlo al backend.
 */
function formatearFecha(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}