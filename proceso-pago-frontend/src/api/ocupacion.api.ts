"use server";
import { Ocupacion } from "@/entidades/Ocupacion";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

/**
 * Obtiene los IDs de todas las ocupaciones propias.
 */
export async function getOcupacionesPropias(): Promise<string[]> {
  const res = await fetch(`${baseUrl}/ocupacion/propias`, { method: "GET" });
  if (!res.ok) throw new Error(`Error al obtener ocupaciones: ${res.status}`);
  return await res.json();
}

/**
 * Obtiene los IDs de todas las ocupaciones no propias.
 */
export async function getOcupacionesNoPropias(): Promise<string[]> {
  const res = await fetch(`${baseUrl}/ocupacion/no-propias`, { method: "GET" });
  if (!res.ok) throw new Error(`Error al obtener ocupaciones: ${res.status}`);
  return await res.json();
}

/**
 * Lista paginada para la tabla.
 */
export async function getOcupaciones(
  offset: number,
  limit: number
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/ocupacion?offset=${offset}&limit=${limit}`,
    { method: "GET" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`
    );
  }
  return await res.json();
}

/**
 * Lista completa (sin paginar).
 */
export async function getTodasOcupaciones(): Promise<Ocupacion[]> {
  const res = await fetch(`${baseUrl}/ocupacion/todas`, { method: "GET" });
  if (!res.ok) throw new Error(`Error al obtener ocupaciones: ${res.status}`);
  return await res.json();
}

/**
 * Busca una ocupación por su id y devuelve una fila string[]
 * (formato que espera el buscador de PaginaBusquedaTablaPaginacion).
 */
export async function getOcupacion(idOc: string): Promise<string[]> {
  const res = await fetch(
    `${baseUrl}/ocupacion/basico/${encodeURIComponent(idOc)}`,
    { method: "GET" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`
    );
  }
  return await res.json();
}

/**
 * Obtiene una ocupación completa por su id (objeto Ocupacion).
 */
export async function getOcupacionPorId(idOc: string): Promise<Ocupacion> {
  const res = await fetch(
    `${baseUrl}/ocupacion/${idOc}`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error(`Error al obtener la ocupación: ${res.status}`);
  }
  return await res.json();
}

/**
 * Verifica si una ocupación ya existe en la base de datos.
 */
export async function existeOcupacion(ocupacion: Ocupacion): Promise<boolean> {
  const res = await fetch(
    `${baseUrl}/ocupacion/existe/${encodeURIComponent(ocupacion.id_oc)}`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error(`Error al verificar la ocupación: ${res.status}`);
  }

  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

/**
 * Inserta una nueva ocupación.
 */
export async function insertarOcupacion(
  ocupacion: Ocupacion
): Promise<Ocupacion> {
  const res = await fetch(`${baseUrl}/ocupacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ocupacion),
  });

  if (!res.ok) {
    let mensaje = `Error al insertar la ocupación: ${res.status}`;
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

  return await res.json();
}

/**
 * Actualiza una ocupación existente.
 */
export async function editarOcupacion(
  idOc: string,
  ocupacion: Ocupacion
): Promise<Ocupacion> {
  const res = await fetch(
    `${baseUrl}/ocupacion/${idOc}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ocupacion),
    }
  );

  if (!res.ok) {
    let mensaje = `Error al actualizar la ocupación: ${res.status}`;
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

  return await res.json();
}

/**
 * Elimina una ocupación por su id.
 */
export async function deleteOcupacion(idOc: string): Promise<void> {
  const res = await fetch(
    `${baseUrl}/ocupacion/${encodeURIComponent(idOc)}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    let mensaje = `Error al eliminar la ocupación: ${res.status}`;
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