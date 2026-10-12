import { Usuario, Rol } from "@/entidades/Usuario";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

export async function existeUsuario(usuario: string): Promise<boolean> {
  const res = await fetch(
    `${baseUrl}/auth/credenciales/existe/${encodeURIComponent(usuario)}`,
    { method: "GET", credentials: "include" }
  );

  if (!res.ok) {
    throw new Error(`Error al verificar el usuario: ${res.status}`);
  }

  const data = await res.json();
  return typeof data === "boolean" ? data : Boolean(data?.existe);
}

export async function getUsuariosPaginados(
  offset: number,
  limit: number
): Promise<{ data: string[][]; total: number }> {
  const res = await fetch(
    `${baseUrl}/auth/credenciales/paginado?offset=${offset}&limit=${limit}`,
    { method: "GET", credentials: "include" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`
    );
  }
  return await res.json();
}

export async function getUsuario(id: string): Promise<string[]> {
  const res = await fetch(
    `${baseUrl}/auth/credenciales/basico/${encodeURIComponent(id)}`,
    { method: "GET", credentials: "include" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${res.status}: ${res.statusText}`
    );
  }
  return await res.json();
}

export async function insertarUsuario(payload: Usuario): Promise<void> {
  const res = await fetch(`${baseUrl}/auth/credenciales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let mensaje = `Error al crear el usuario: ${res.status}`;
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

export async function getUsuarios(): Promise<
  { id_credencial: number; usuario: string; rol: Rol }[]
> {
  const res = await fetch(`${baseUrl}/auth/credenciales`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener usuarios: ${res.status}`);
  }

  return await res.json();
}