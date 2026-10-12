import { Ausencia } from "@/entidades/Ausencia";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

/**
 * Convierte un Date a "yyyy-MM-dd" en UTC.
 */
function formatearFechaUTC(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Verifica si existe una ausencia que se solape con el rango dado.
 */
export async function existeAusenciaEnRango(
  idEm: string,
  inicio: Date,
  fin: Date,
): Promise<boolean> {
  const f1 = formatearFechaUTC(inicio);
  const f2 = formatearFechaUTC(fin);
  const res = await fetch(
    `${baseUrl}/ausencia/existe-rango/${encodeURIComponent(idEm)}/${f1}/${f2}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al verificar solapamiento: ${res.status}`);
  }
  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Verifica si existe una ausencia exacta (mismo empleado, tipo y rango).
 */
export async function existeAusencia(ausencia: Ausencia): Promise<boolean> {
  const f1 = formatearFechaUTC(ausencia.fecha_inicio);
  const f2 = formatearFechaUTC(ausencia.fecha_fin);
  const res = await fetch(
    `${baseUrl}/ausencia/existe/${encodeURIComponent(ausencia.id_em)}/${encodeURIComponent(ausencia.id_tipo_ausencia)}/${f1}/${f2}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al verificar la ausencia: ${res.status}`);
  }
  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Inserta una nueva ausencia.
 */
export async function insertarAusencia(ausencia: Ausencia): Promise<void> {
  const res = await fetch(`${baseUrl}/ausencia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id_em: ausencia.id_em,
      id_tipo_ausencia: ausencia.id_tipo_ausencia,
      fecha_inicio: formatearFechaUTC(ausencia.fecha_inicio),
      fecha_fin: formatearFechaUTC(ausencia.fecha_fin),
    }),
  });

  if (!res.ok) {
    let mensaje = `Error al insertar la ausencia: ${res.status}`;
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
 * Actualiza una ausencia existente.
 */
export async function editarAusencia(
  idEm: string,
  fechaInicioOriginal: string,
  ausencia: Ausencia,
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/ausencia/${encodeURIComponent(idEm)}/${fechaInicioOriginal}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id_tipo_ausencia: ausencia.id_tipo_ausencia,
        fecha_inicio: formatearFechaUTC(ausencia.fecha_inicio),
        fecha_fin: formatearFechaUTC(ausencia.fecha_fin),
      }),
    },
  );

  if (!res.ok) {
    let mensaje = `Error al actualizar la ausencia: ${res.status}`;
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
 * Elimina una ausencia por (id_em, fecha_inicio).
 */
export async function deleteAusencia(
  idEm: string,
  fechaInicio: string,
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/ausencia/${encodeURIComponent(idEm)}/${fechaInicio}`,
    { method: "DELETE", credentials: "include" },
  );

  if (!res.ok) {
    let mensaje = `Error al eliminar la ausencia: ${res.status}`;
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
 * Obtiene las ausencias paginadas (para la tabla).
 */
export async function getAusenciasPaginadas(
  offset: number,
  limit: number,
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/ausencia?offset=${offset}&limit=${limit}`,
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
 * Busca por ID de empleado y devuelve la ausencia más reciente como fila string[].
 * Usado por PaginaBusquedaTablaPaginacion.
 */
export async function getAusencia(idEm: string): Promise<string[]> {
  const res = await fetch(
    `${baseUrl}/ausencia/basico/${encodeURIComponent(idEm)}`,
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
 * Obtiene el detalle completo de una ausencia por (id_em, fecha_inicio).
 * Usado por el formulario de edición.
 */
export async function getAusenciaDetalle(
  idEm: string,
  fechaInicio: string,
): Promise<{
  id_em: number;
  id_tipo_ausencia: string;
  fecha_inicio: string;
  fecha_fin: string;
}> {
  const res = await fetch(
    `${baseUrl}/ausencia/detalle/${encodeURIComponent(idEm)}/${fechaInicio}`,
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
 * Obtiene los ids de los tipos de ausencia.
 */
export async function getTiposAusencia(): Promise<string[]> {
  const res = await fetch(`${baseUrl}/tipo-ausencia`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Error al obtener tipos de ausencia: ${res.status}`);
  }
  return await res.json();
}

export async function getAusenciasPorMes(
  idEm: string,
  mes: string, // "YYYY-MM"
  offset: number,
  limit: number,
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/ausencia/por-mes/${encodeURIComponent(idEm)}?fecha=${mes}&offset=${offset}&limit=${limit}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al obtener ausencias: ${res.status}`);
  }
  return await res.json();
}