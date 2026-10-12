"use client";

import FormularioUsuario from "@/components/formularios/FormularioUsuario";

export function CrearUsuario() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Crear Usuario
      </h1>
      <FormularioUsuario />
    </div>
  );
}