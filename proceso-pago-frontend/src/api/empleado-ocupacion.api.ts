"use server";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

export async function getEmpleadosOcupacion(offset: number, limit:number): Promise<{data: string[][], total:number}> {
    const res = await fetch(`${baseUrl}/empleado-ocupacion/?offset=${String(offset)}&limit=${String(limit)}`, {
        method: "GET"     
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();

}

export async function getEmpleadoOcupacion(idEmp:string): Promise<string[]>{
    if (!idEmp || isNaN(Number(idEmp))) {
        //console.log("El ID del empleado debe ser un número válido consola")
        throw new Error("El ID del empleado debe ser un número válido");
    }
    const res = await fetch(`${baseUrl}/empleado-ocupacion/${String(idEmp)}`, {
        method: "GET"     
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
}

export async function editarEmpleadoOcupacion(idEmp: string, ocupacionNueva:string){
    
}

export async function eliminarEmpleadoOcupacion(idEmp: string) {
    
}

/*export async function getDatosDePaginaEmpleadoOcupacion(paginaActual: number, _: number) {
    const filas = 18
    const tuplas = await getEmpleadosOcupacion(paginaActual/filas, filas);
    return tuplas;
}*/