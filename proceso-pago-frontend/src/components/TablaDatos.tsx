import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import DialogoEditar from "./DialogoEditar";
import { EmpleadoOcupacionEditar } from "@/entidades/Empleado";
import {
  editarEmpleadoOcupacion,
  eliminarEmpleadoOcupacion,
} from "@/api/empleado-ocupacion.api";

interface TablaDatosProps {
  columnas: string[];
  datos: string[][];
  caption?: string;
  //onDatosActualizados?: () => void;
}

export interface FuncionesDelDropDownMenu<T, K>{
  label: string,
  funcion: (T)=>K
}


export function TablaDatos({
  columnas,
  datos,
  caption = "",
  //onDatosActualizados,
}: TablaDatosProps) {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [filaAEditar, setFilaAEditar] = useState<string[] | null>(null);
  const [indiceAEditar, setIndiceAEditar] = useState<number | null>(null);

  const handleEditar = (fila: string[], indice: number) => {
    setFilaAEditar(fila);
    setIndiceAEditar(indice);
    setDialogoAbierto(true);
  };

  const handleEliminarFila = async (fila: string[], indice: number) => {
    const idEmpleado = fila[0];
    try {
      await eliminarEmpleadoOcupacion(idEmpleado);
      //if (onDatosActualizados) onDatosActualizados();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleGuardarEdicion = async (valoresEditados: EmpleadoOcupacionEditar) => {
    try {
      await editarEmpleadoOcupacion(
        valoresEditados.idEmpleado,
        valoresEditados.ocupacion
      );
      setDialogoAbierto(false);
      //if (onDatosActualizados) onDatosActualizados();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Función para obtener el valor de una celda según la columna
  const obtenerValorCelda = (fila: string[], indiceColumna: number): string => {
    return fila[indiceColumna] ?? "";
  };

  return (
    <>
      <Table className="table-fixed w-full">
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columnas.map((columna, index) => (
              <TableHead
                key={index}
                className="truncate px-4 py-2 text-center"
                style={{ width: `${100 / (columnas.length + 1)}%` }}
              >
                {columna}
              </TableHead>
            ))}{/*
            <TableHead
              className="truncate px-4 py-2 text-right"
              style={{ width: `${100 / (columnas.length + 1)}%` }}
            >
              Acciones
            </TableHead>*/}
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((fila, idx) => (
            <TableRow key={idx} className="text-center">
              {columnas.map((_, colIdx) => {
                const valorCelda = obtenerValorCelda(fila, colIdx);
                return (
                  <TableCell
                    key={colIdx}
                    className="font-medium truncate px-4 py-0.5"
                    style={{ width: `${100 / (columnas.length + 1)}%` }}
                    title={valorCelda}
                  >
                    {valorCelda}
                  </TableCell>
                );
              })}{/*
              <TableCell className="text-right px-2 py-0">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="size-6">
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => handleEditar(fila, idx)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      className="bg-red-400"
                      onClick={() => handleEliminarFila(fila, idx)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>*/}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dialogoAbierto && filaAEditar && (
        <DialogoEditar
          abierto={dialogoAbierto}
          onAbiertoChange={setDialogoAbierto}
          fila={filaAEditar}
          columnas={columnas}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </>
  );
}