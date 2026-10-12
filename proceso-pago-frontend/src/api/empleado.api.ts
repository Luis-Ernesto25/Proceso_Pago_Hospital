"use server";
import { EmpleadoCompleto } from "@/entidades/Empleado";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

export async function insertarEmpleado(empleado: EmpleadoCompleto): Promise<boolean> {
    const res = await fetch(`${baseUrl}/empleado`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleado),
    });

    // Intentar parsear la respuesta como JSON
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const mensaje = data?.message || `Error ${res.status}`;
        throw new Error(mensaje);
    }

    return true;
}

export async function editarEmpleadoCompleto(
    empleado: EmpleadoCompleto
): Promise<boolean> {
    const res = await fetch(`${baseUrl}/empleado/${String(empleado.idEmpleado)}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleado),
    });

    // Intentar parsear la respuesta como JSON
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const mensaje = data?.message || `Error ${res.status}`;
        throw new Error(mensaje);
    }
    return data;
}

export async function getEmpleados(offset: number, limit: number): Promise<{ data: string[][], total: number }> {
    const res = await fetch(`${baseUrl}/empleado/?offset=${String(offset)}&limit=${String(limit)}`, {
        method: "GET",
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}

export async function getEmpleado(idEmp: string): Promise<string[]> {
    if (!idEmp || isNaN(Number(idEmp))) {
        throw new Error("El ID del empleado debe ser un número válido");
    }
    const res = await fetch(`${baseUrl}/empleado/basico/${String(idEmp)}`, {
        method: "GET",
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}


export async function getEmpleadoCompleto(idEmp: string): Promise<EmpleadoCompleto> {
    const res = await fetch(`${baseUrl}/empleado/${idEmp}`, {
        method: "GET",
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}


/*export async function getEmpleadosOcupacion() {
    const res = await fetch(`${baseUrl}/empleado`, {
        method: "GET"        
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
    return listaEO 
    
}*/

/*export function editarEmpleadoOcupacion(idEmp: string, ocupacionNueva:string){
    const listaEmpleadosOcupacion = getEmpleadosOcupacion()[1]
    //console.log("editarEmpleadoOcupacion")

    console.log(idEmp, ocupacionNueva)
    listaEmpleadosOcupacion.map((tupla)=>{
        if(tupla[0]===Number(idEmp)){
            tupla[1]=ocupacionNueva
           // console.log("se actualizo la ocupacion")
        }
    })
}

export function eliminarEmpleadoOcupacion(idEmp: string): boolean {
    const listaEmpleadosOcupacion = getEmpleadosOcupacion()[1];
    
    console.log("eliminarEmpleadoOcupacion - Buscando ID:", idEmp);
    
    // Encontrar el índice del empleado
    const indice = listaEmpleadosOcupacion.findIndex(
        tupla => String(tupla[0]) === String(idEmp)
    );
    
    // Si no se encuentra, retornar false
    if (indice === -1) {
        console.log("No se encontró empleado con ID:", idEmp);
        return false;
    }
    
    // Eliminar el elemento del array
    listaEmpleadosOcupacion.splice(indice, 1);
    
    return true;
}*/

