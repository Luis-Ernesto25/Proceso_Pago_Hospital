import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { EmpleadoOcupacionEditar, EmpleadoOcupacion } from '@/entidades/Empleado';

interface DialogoEditarProps {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  fila: any;
  columnas: string[];
  onGuardar: (valores: EmpleadoOcupacionEditar) => void;
}

function DialogoEditar({
  abierto,
  onAbiertoChange,
  fila,
  columnas,
  onGuardar, 
  //onEliminar,
}: DialogoEditarProps) {
  const [valoresEditados, setValoresEditados] = useState<EmpleadoOcupacionEditar>({
    idEmpleado: "",
    ocupacion: ""
  });

  // Inicializar valores cuando se abre el diálogo
  useEffect(() => {
    if (fila && abierto) {
      //console.log("Fila recibida:", fila);
      //console.log("Columnas:", columnas);
      
      // Determinar los valores según la estructura de la fila
      let idEmpleado = "";
      let ocupacion = "";
      
      if (Array.isArray(fila)) {
        // Si fila es un array: [idEmpleado, ocupacion]
        idEmpleado = String(fila[0] ?? "");
        ocupacion = Array.isArray(fila[1]) ? fila[1].join(", ") : String(fila[1] ?? "");
      } else {
        // Si fila es un objeto
        idEmpleado = String(fila.idEmpleado ?? fila["Id-Empleado"] ?? "");
        ocupacion = String(fila.ocupacion ?? fila["Ocupacion"] ?? "");
      }
      
      //console.log("Valores iniciales:", { idEmpleado, ocupacion });
      
      setValoresEditados({
        idEmpleado,
        ocupacion
      });
    }
  }, [fila, abierto, columnas]);

  const handleCambio = (columna: string, valor: string) => {
    setValoresEditados(prev => ({
      ...prev,
      [columna]: valor
    }));
  };

  const handleGuardar = () => {
    //console.log("Guardando valores:", valoresEditados);
    onGuardar(valoresEditados);
    onAbiertoChange(false);
  };

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
          <DialogDescription>
            Modifica los campos y guarda los cambios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Mostrar idEmpleado (no editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Id-Empleado
              <span className="ml-2 text-xs text-gray-400">
                (No editable)
              </span>
            </label>
            <Input
              value={valoresEditados.idEmpleado}
              disabled
              className="bg-gray-100 cursor-not-allowed opacity-70"
              readOnly
            />
          </div>

          {/* Mostrar ocupacion (editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ocupacion
            </label>
            <Input
              value={valoresEditados.ocupacion}
              onChange={(e) => handleCambio("ocupacion", e.target.value)}
              placeholder="Ingrese ocupación"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onAbiertoChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            className="!bg-blue-300 hover:!bg-blue-600"
            onClick={handleGuardar}
          >
            Actualizar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogoEditar;