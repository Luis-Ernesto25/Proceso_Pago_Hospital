const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:4000/api";

export interface ReporteResponse {
  data: string[][];
  total: number;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

export async function getReporteHorasTodos(
  fechaInicio: string,
  fechaFin: string,
  offset: number,
  limit: number,
  search?: string,
): Promise<ReporteResponse> {
  const qs = buildQuery({ fechaInicio, fechaFin, offset, limit, search });
  const res = await fetch(`${baseUrl}/reporte/horas-todos?${qs}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Error ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

export async function getReporteAusenciasTodos(
  fechaInicio: string,
  fechaFin: string,
  offset: number,
  limit: number,
  search?: string,
): Promise<ReporteResponse> {
  const qs = buildQuery({ fechaInicio, fechaFin, offset, limit, search });
  const res = await fetch(`${baseUrl}/reporte/ausencias-todos?${qs}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Error ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

// ============================================================
// HORAS - UN EMPLEADO
// ============================================================
export async function getReporteHorasEmpleado(
  idEm: string,
  fechaInicio: string,
  fechaFin: string,
  offset: number,
  limit: number,
): Promise<ReporteResponse> {
  const res = await fetch(
    `${baseUrl}/reporte/horas-empleado/${encodeURIComponent(idEm)}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&offset=${offset}&limit=${limit}`,
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

// ============================================================
// AUSENCIAS - UN EMPLEADO
// ============================================================
export async function getReporteAusenciasEmpleado(
  idEm: string,
  fechaInicio: string,
  fechaFin: string,
  offset: number,
  limit: number,
): Promise<ReporteResponse> {
  const res = await fetch(
    `${baseUrl}/reporte/ausencias-empleado/${encodeURIComponent(idEm)}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&offset=${offset}&limit=${limit}`,
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