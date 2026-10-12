"use client";

import { useState } from 'react';
import { FormularioEmpleado } from '@/components/formularios/FormularioEmpleados';
import BarraBusqueda from '@/components/BarraBusqueda';
import { Empleado, EmpleadoCompleto } from '@/entidades/Empleado';
import { getEmpleadoCompleto } from '@/api/empleado.api';

function EditarEmpleado() {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoCompleto | null>(null);

  // Función de búsqueda que se ejecuta al escribir en la barra
  const manejarBusqueda = async (texto: string) => {
    if (!texto.trim()) {
      setEmpleadoSeleccionado(null);
      return;
    }

    try {
      // Convertir texto a número si el ID es numérico
      const id = Number(texto);
      if (isNaN(id)) {
        console.error('El ID debe ser un número');
        setEmpleadoSeleccionado(null);
        return;
      }

      const empleado = await getEmpleadoCompleto(String(id));
      setEmpleadoSeleccionado(empleado);
    } catch (error) {
      console.error('Error al buscar empleado:', error);
      setEmpleadoSeleccionado(null);
    }
  };

  return (
    <div>
      <BarraBusqueda onBuscar={manejarBusqueda} />
      <FormularioEmpleado empleado={empleadoSeleccionado} />
    </div>
  );
}

export default EditarEmpleado;