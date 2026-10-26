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

// ============================================================
// HELPER: pedir un PDF al backend y devolverlo como Blob
// ============================================================
async function pedirPdf(url: string): Promise<Blob> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    // El backend devuelve JSON de error aunque pidamos binario
    const texto = await res.text();
    let mensaje = `Error ${res.status}: ${res.statusText}`;
    try {
      const json = JSON.parse(texto);
      if (json?.message) mensaje = json.message;
    } catch {
      // no era JSON; dejamos el mensaje genérico
    }
    throw new Error(mensaje);
  }

  return res.blob();
}

// ============================================================
// HELPER: forzar descarga de un Blob en el navegador
// ============================================================
function descargarBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============================================================
// HORAS - TODOS (JSON paginado)
// ============================================================
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

// ============================================================
// AUSENCIAS - TODOS (JSON paginado)
// ============================================================
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
// HORAS - UN EMPLEADO (JSON paginado)
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
// AUSENCIAS - UN EMPLEADO (JSON paginado)
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

// ============================================================
// 📄 PDF - HORAS - TODOS
// Descarga el archivo directamente en el navegador.
// ============================================================
export async function descargarReporteHorasPdf(
  fechaInicio: string,
  fechaFin: string,
  search?: string,
): Promise<void> {
  const qs = buildQuery({ fechaInicio, fechaFin, search });
  const blob = await pedirPdf(`${baseUrl}/reporte/horas-todos/pdf?${qs}`);
  descargarBlob(blob, `reporte-horas-${fechaInicio}_${fechaFin}.pdf`);
}

// ============================================================
// 📄 PDF - AUSENCIAS - TODOS
// ============================================================
export async function descargarReporteAusenciasPdf(
  fechaInicio: string,
  fechaFin: string,
  search?: string,
): Promise<void> {
  const qs = buildQuery({ fechaInicio, fechaFin, search });
  const blob = await pedirPdf(`${baseUrl}/reporte/ausencias-todos/pdf?${qs}`);
  descargarBlob(blob, `reporte-ausencias-${fechaInicio}_${fechaFin}.pdf`);
}

// ============================================================
// 📄 PDF - HORAS - UN EMPLEADO
// ============================================================
export async function descargarReporteHorasEmpleadoPdf(
  idEm: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<void> {
  const qs = buildQuery({ fechaInicio, fechaFin });
  const blob = await pedirPdf(
    `${baseUrl}/reporte/horas-empleado/${encodeURIComponent(idEm)}/pdf?${qs}`,
  );
  descargarBlob(
    blob,
    `reporte-horas-empleado-${idEm}-${fechaInicio}_${fechaFin}.pdf`,
  );
}

// ============================================================
// 📄 PDF - AUSENCIAS - UN EMPLEADO
// ============================================================
export async function descargarReporteAusenciasEmpleadoPdf(
  idEm: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<void> {
  const qs = buildQuery({ fechaInicio, fechaFin });
  const blob = await pedirPdf(
    `${baseUrl}/reporte/ausencias-empleado/${encodeURIComponent(idEm)}/pdf?${qs}`,
  );
  descargarBlob(
    blob,
    `reporte-ausencias-empleado-${idEm}-${fechaInicio}_${fechaFin}.pdf`,
  );
}

// ============================================================
// 📧 Enviar horas + ausencias por email (2 PDFs en un correo)
// ============================================================
export async function enviarReportesPorEmail(
  destinatario: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<{ ok: boolean; mensaje: string }> {
  const res = await fetch(`${baseUrl}/reporte/enviar-email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinatario, fechaInicio, fechaFin }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}