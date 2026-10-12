import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const PREFIJO_POR_ROL: Record<string, string> = {
  Admin: "/admin",
  Tecnico_RH: "/rrhh",
  Contador: "/contador",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // Raíz: redirigir al login o al panel del rol
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      const rol = payload.rol as string;
      const destino = PREFIJO_POR_ROL[rol] ?? "/login";
      return NextResponse.redirect(new URL(destino, req.url));
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }
  }

  // Sin token → login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar rol vs prefijo
  try {
    const { payload } = await jwtVerify(token, secret);
    const rol = payload.rol as string;
    const prefijo = PREFIJO_POR_ROL[rol];

    if (!prefijo || !pathname.startsWith(prefijo)) {
      return NextResponse.redirect(new URL(prefijo ?? "/login", req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};