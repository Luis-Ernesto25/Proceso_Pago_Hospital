"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SelectorConBusqueda } from "@/components/SelectorConBusqueda";
import BarraBusqueda from "@/components/BarraBusqueda";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  editarAusencia,
  existeAusencia,
  existeAusenciaEnRango,
  insertarAusencia,
} from "@/api/ausencia.api";
import { Ausencia } from "@/entidades/Ausencia";

const formSchema = z
  .object({
    idEmpleado: z
      .string()
      .trim()
      .min(1, { message: "Debe seleccionar un empleado" }),

    tipoAusencia: z
      .string()
      .trim()
      .min(1, { message: "Debe seleccionar un tipo de ausencia" }),

    fechaInicio: z.date({ message: "La fecha de inicio es obligatoria" }),

    fechaFin: z.date({ message: "La fecha de fin es obligatoria" }),

    unSoloDia: z.boolean(),
  })
  .refine((data) => data.fechaFin >= data.fechaInicio, {
    message: "La fecha de fin no puede ser anterior a la de inicio",
    path: ["fechaFin"],
  });

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  idEmpleado: "",
  tipoAusencia: "",
  fechaInicio: undefined as unknown as Date,
  fechaFin: undefined as unknown as Date,
  unSoloDia: false,
};

// Formatea una fecha a "yyyy-MM-dd" usando UTC
function formatearFechaParaURL(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface Props {
  listaEmpleados: string[]; // "id - nombre apellido"
  listaTipos: string[];     // ids de tipo de ausencia
  ausencia?: Ausencia | null; // 👈 si llega, modo edición
}

function FormularioAusencia({
  listaEmpleados,
  listaTipos,
  ausencia = null,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empleadoTexto, setEmpleadoTexto] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;
  const unSoloDia = form.watch("unSoloDia");

  // Cargar datos cuando llega la prop `ausencia` (modo edición)
  useEffect(() => {
    if (ausencia) {
      const empleado = listaEmpleados.find(
        (e) => e.split(" - ")[0] === ausencia.id_em,
      );
      setEmpleadoTexto(empleado ?? ausencia.id_em);

      form.reset({
        idEmpleado: ausencia.id_em,
        tipoAusencia: ausencia.id_tipo_ausencia,
        fechaInicio: ausencia.fecha_inicio,
        fechaFin: ausencia.fecha_fin,
        unSoloDia: false,
      });
    } else {
      form.reset(defaultValues);
      setEmpleadoTexto("");
    }
  }, [ausencia, listaEmpleados, form]);

  // Buscar empleado por id en la lista
  const manejarBusquedaEmpleado = (texto: string) => {
    if (!texto.trim()) {
      setEmpleadoTexto("");
      form.setValue("idEmpleado", "");
      return;
    }

    const encontrado = listaEmpleados.find(
      (e) => e.split(" - ")[0] === texto.trim(),
    );

    if (encontrado) {
      setEmpleadoTexto(encontrado);
      form.setValue("idEmpleado", encontrado.split(" - ")[0], {
        shouldValidate: true,
      });
    } else {
      setEmpleadoTexto("");
      form.setValue("idEmpleado", "", { shouldValidate: true });
      alert("⚠️ No se encontró un empleado con ese ID");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const inicio = values.fechaInicio;
      const fin = values.unSoloDia ? inicio : values.fechaFin;

      const payload: Ausencia = {
        id_em: values.idEmpleado,
        id_tipo_ausencia: values.tipoAusencia,
        fecha_inicio: inicio,
        fecha_fin: fin,
      };

      if (ausencia) {
        // ===================== MODO EDICIÓN =====================
        await editarAusencia(
          ausencia.id_em,
          formatearFechaParaURL(ausencia.fecha_inicio),
          payload,
        );
        alert(`✅ ¡Éxito! La ausencia fue actualizada correctamente.`);
      } else {
        // ===================== MODO CREACIÓN =====================
        // 1) Verificar solapamiento con otras ausencias
        const solapa = await existeAusenciaEnRango(
          payload.id_em,
          payload.fecha_inicio,
          payload.fecha_fin,
        );
        if (solapa) {
          alert(
            "⚠️ Ya existe una ausencia para ese empleado que se solapa con el rango indicado.",
          );
          return;
        }

        // 2) Verificar duplicado exacto
        const exacta = await existeAusencia(payload);
        if (exacta) {
          alert(
            "⚠️ Ya existe una ausencia idéntica para ese empleado en esa fecha.",
          );
          return;
        }

        // 3) Insertar
        await insertarAusencia(payload);
        alert("✅ ¡Éxito! La ausencia fue registrada correctamente.");
        form.reset(defaultValues);
        setEmpleadoTexto("");
      }
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al guardar la ausencia"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (ausencia) {
      // Restaurar valores originales
      form.reset({
        idEmpleado: ausencia.id_em,
        tipoAusencia: ausencia.id_tipo_ausencia,
        fechaInicio: ausencia.fecha_inicio,
        fechaFin: ausencia.fecha_fin,
        unSoloDia: false,
      });
    } else {
      form.reset(defaultValues);
      setEmpleadoTexto("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Por favor corrige los siguientes errores:
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empleado */}
            <div className="md:col-span-2 space-y-2">
              <FormLabel>Empleado</FormLabel>

              {ausencia ? (
                // En modo edición: solo mostramos el empleado (no editable)
                <div className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  {empleadoTexto || ausencia.id_em}
                </div>
              ) : (
                // En modo creación: barra de búsqueda
                <>
                  <BarraBusqueda onBuscar={manejarBusquedaEmpleado} />
                  {empleadoTexto ? (
                    <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
                      {empleadoTexto}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Escriba el ID del empleado y pulse buscar
                    </p>
                  )}
                </>
              )}

              {form.formState.errors.idEmpleado && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.idEmpleado.message}
                </p>
              )}
            </div>

            {/* Tipo de ausencia */}
            <FormField
              control={form.control}
              name="tipoAusencia"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Tipo de ausencia</FormLabel>
                  <FormControl>
                    <SelectorConBusqueda
                      value={field.value}
                      onChange={field.onChange}
                      options={listaTipos}
                      placeholder="Buscar tipo de ausencia..."
                      onEmptyMessage="No se encontró el tipo de ausencia."
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Checkbox un solo día */}
            <FormField
              control={form.control}
              name="unSoloDia"
              render={({ field }) => (
                <FormItem className="flex flex-row items-end gap-2 pb-1">
                  <input
                    id="unSoloDia"
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      field.onChange(checked);
                      if (checked && form.getValues("fechaInicio")) {
                        form.setValue("fechaFin", form.getValues("fechaInicio"));
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <label htmlFor="unSoloDia" className="text-sm font-medium">
                    Ausencia de un solo día
                  </label>
                </FormItem>
              )}
            />

            {/* Fecha inicio */}
            <FormField
              control={form.control}
              name="fechaInicio"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col md:col-span-2">
                  <FormLabel>Fecha de inicio</FormLabel>
                  <Popover>
                    <PopoverTrigger
                      render={(props) => (
                        <Button
                          {...props}
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                            fieldState.error &&
                              "!border-red-500 !focus-visible:ring-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy", { locale: es })
                            : "Seleccione una fecha"}
                        </Button>
                      )}
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => {
                          field.onChange(d);
                          if (form.getValues("unSoloDia") && d) {
                            form.setValue("fechaFin", d);
                          }
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha fin */}
            <FormField
              control={form.control}
              name="fechaFin"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col md:col-span-2">
                  <FormLabel>Fecha de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger
                      render={(props) => (
                        <Button
                          {...props}
                          type="button"
                          variant="outline"
                          disabled={unSoloDia}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                            fieldState.error &&
                              "!border-red-500 !focus-visible:ring-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy", { locale: es })
                            : "Seleccione una fecha"}
                        </Button>
                      )}
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  {unSoloDia && (
                    <FormDescription>
                      Igual a la fecha de inicio (un solo día)
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="!bg-blue-300 hover:!bg-blue-600"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              {ausencia ? "Restablecer" : "Limpiar"}
            </Button>

            <Button
              type="submit"
              className="!bg-blue-300 hover:!bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Procesando..."
                : ausencia
                  ? "Actualizar Ausencia"
                  : "Insertar Ausencia"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioAusencia;