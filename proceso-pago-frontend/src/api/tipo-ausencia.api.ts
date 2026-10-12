import { TipoAusencia } from "@/entidades/TipoAusencia";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

/**
 * Lista paginada de tipos de ausencia.
 * Devuelve filas string[][] (formato que espera la tabla).
 */
export async function getTiposAusencia(
  offset: number,
  limit: number,
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia?offset=${offset}&limit=${limit}`,
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
 * Busca un tipo de ausencia por su id.
 */
export async function getTipoAusencia(
  id: string,
): Promise<string[]> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia/${encodeURIComponent(id)}`,
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
 * Verifica si un tipo de ausencia ya existe.
 */
export async function existeTipoAusencia(id: string): Promise<boolean> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia/existe/${encodeURIComponent(id)}`,
    { method: "GET", credentials: "include" },
  );

  if (!res.ok) {
    throw new Error(`Error al verificar el tipo de ausencia: ${res.status}`);
  }

  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Inserta un nuevo tipo de ausencia.
 */
export async function insertarTipoAusencia(
  tipo: TipoAusencia,
): Promise<void> {
  const res = await fetch(`${baseUrl}/tipo-ausencia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id_tipo_ausencia: tipo.id_tipo_ausencia,
      se_paga_sueldo_ti: tipo.se_paga_sueldo_ti,
    }),
  });

  if (!res.ok) {
    let mensaje = `Error al insertar el tipo de ausencia: ${res.status}`;
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
 * Actualiza un tipo de ausencia existente.
 */
export async function editarTipoAusencia(
  idOriginal: string,
  tipo: TipoAusencia,
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia/${encodeURIComponent(idOriginal)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id_tipo_ausencia: tipo.id_tipo_ausencia,
        se_paga_sueldo_ti: tipo.se_paga_sueldo_ti,
      }),
    },
  );

  if (!res.ok) {
    let mensaje = `Error al actualizar el tipo de ausencia: ${res.status}`;
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
 * Obtiene el detalle completo de un tipo de ausencia.
 */
export async function getTipoAusenciaDetalle(
  id: string,
): Promise<TipoAusencia> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia/detalle/${encodeURIComponent(id)}`,
    { method: "GET", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Error al obtener el tipo de ausencia: ${res.status}`);
  }
  return await res.json();
}

/**
 * Elimina un tipo de ausencia.
 */
export async function eliminarTipoAusencia(id: string): Promise<void> {
  const res = await fetch(
    `${baseUrl}/tipo-ausencia/${encodeURIComponent(id)}`,
    { method: "DELETE", credentials: "include" },
  );

  if (!res.ok) {
    let mensaje = `Error al eliminar el tipo de ausencia: ${res.status}`;
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