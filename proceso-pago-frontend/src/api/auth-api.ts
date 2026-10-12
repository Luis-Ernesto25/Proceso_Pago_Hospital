const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

export type Rol = "Admin" | "Tecnico_RRHH" | "Contador";

export interface LoginResponse {
  usuario: string;
  rol: Rol;
}

export async function login(
  usuario: string,
  contrasena: string
): Promise<LoginResponse> {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 👈 imprescindible para cookies
    body: JSON.stringify({ usuario, contrasena }),
  });

  if (!res.ok) {
    let mensaje = "Error al iniciar sesión";
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

  return await res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getSession(): Promise<LoginResponse | null> {
  const res = await fetch(`${baseUrl}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return null;
  return await res.json();
}