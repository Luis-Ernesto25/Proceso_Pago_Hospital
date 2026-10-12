"use server";

import { Bono } from "@/entidades/Bono";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:4000/api';
//console.log('🔍 Base URL:', baseUrl); 

export async function getTodosBonos(): Promise<string[]> {
    const res = await fetch(`${baseUrl}/bono/ids`, {
        method: "GET" 
    });
    
    if (!res.ok) {
        throw new Error(`Error al obtener bonos: ${res.status}`);
    }
    return await res.json()
}

export async function deleteBono(idBono: string): Promise<void> {
  const res = await fetch(`${baseUrl}/bono/${idBono}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let mensaje = `Error al eliminar bono: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        mensaje = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {
    }
    throw new Error(mensaje);
  }
}

export async function editarBono(bono: Bono): Promise<Bono> {
  //console.log(bono)
    const res = await fetch(`${baseUrl}/bono/${bono.id_bo}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bono),
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    const mensaje = data?.message || `Error ${res.status}`;
    throw new Error(mensaje);
  }

  return data ?? bono;
}

export async function getBonoString(idBono:string): Promise<string[]>{
    const res = await fetch(`${baseUrl}/bono/${idBono}`, {
        method: "GET" 
    });
    
    if (!res.ok) {
        throw new Error(`No se encontro el bono ${idBono}`);
    }
    return await res.json()
}

export async function getBono(idBono:string): Promise<Bono>{
    const res = await fetch(`${baseUrl}/bono/${idBono}`, {
        method: "GET" 
    });
    if (!res.ok) {
        throw new Error(`No se encontro el bono ${idBono}`);
    }
    const datos = await res.json()
    return {
        id_bo: datos[0],
        monto_mensual_bo: datos[1]
    }
}

export async function getBonos(offset:number, limit:number): Promise<{data: string[][], total:number}>{
    const res = await fetch(`${baseUrl}/bono/?offset=${offset}&limit=${limit}`, {
        method: "GET" 
    });
    
    if (!res.ok) {
        throw new Error(`No se encontraron bonos`);
    }
    return await res.json()
}

export async function insertarBono(bono:Bono): Promise<boolean> {
    //console.log("en el api front"); 
    const res = await fetch(`${baseUrl}/bono`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',   
        },
        body: JSON.stringify(bono), 
    });
    // Intentar parsear la respuesta como JSON
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const mensaje = data?.message || `Error ${res.status}`;
        throw new Error(mensaje);
    }
    
    return true;
}


