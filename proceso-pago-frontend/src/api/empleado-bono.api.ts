"use server";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

export async function getEmpleadosBono(offset: number, limit: number): Promise<{ data: string[][], total: number }> {
    const res = await fetch(`${baseUrl}/empleado-bono/?offset=${String(offset)}&limit=${String(limit)}`, {
        method: "GET"
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
}

export async function getEmpleadoBono(idEmp: number): Promise<string[]> {
    if (!idEmp || isNaN(Number(idEmp))) {
        throw new Error("El ID del empleado debe ser un número válido");
    }

    const res = await fetch(`${baseUrl}/empleado-bono/${String(idEmp)}`, {
        method: "GET"
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}