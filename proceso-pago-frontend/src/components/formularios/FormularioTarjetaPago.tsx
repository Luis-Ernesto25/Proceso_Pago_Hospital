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
import Selector from "@/components/Selector";
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
  editarTarjetaPago,
  existeTarjetaPago,
  insertarTarjetaPago,
} from "@/api/tarjeta-pago.api";
import { TarjetaPago } from "@/entidades/TarjetaPago";

const HORAS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTOS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const formSchema = z
  .object({
    idEmpleado: z
      .string()
      .trim()
      .min(1, { message: "Debe seleccionar un empleado" }),

    fechaEntrada: z.date({ message: "La fecha de entrada es obligatoria" }),
    fechaSalida: z.date({ message: "La fecha de salida es obligatoria" }),

    horaEntrada: z.string().regex(/^\d{2}$/, { message: "Hora inválida" }),
    minutoEntrada: z.string().regex(/^\d{2}$/, { message: "Minuto inválido" }),
    horaSalida: z.string().regex(/^\d{2}$/, { message: "Hora inválida" }),
    minutoSalida: z.string().regex(/^\d{2}$/, { message: "Minuto inválido" }),
  })
  .refine((data) => data.fechaSalida >= data.fechaEntrada, {
    message: "La fecha de salida no puede ser anterior a la de entrada",
    path: ["fechaSalida"],
  });

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  idEmpleado: "",
  fechaEntrada: undefined as unknown as Date,
  fechaSalida: undefined as unknown as Date,
  horaEntrada: "00",
  minutoEntrada: "00",
  horaSalida: "00",
  minutoSalida: "00",
};

function formatearFechaParaURL(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface Props {
  listaEmpleados: string[]; // "id - Nombre Apellido"
  tarjeta?: TarjetaPago | null;
}

function FormularioTarjetaPago({
  listaEmpleados,
  tarjeta = null,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empleadoTexto, setEmpleadoTexto] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;

  // Cargar datos cuando llega la prop `tarjeta` (modo edición)
  useEffect(() => {
    if (tarjeta) {
      const empleado = listaEmpleados.find(
        (e) => e.split(" - ")[0] === tarjeta.id_em,
      );
      setEmpleadoTexto(empleado ?? tarjeta.id_em);

      const [hEnt, mEnt] = tarjeta.hora_entrada.split(":");
      const [hSal, mSal] = tarjeta.hora_salida.split(":");

      form.reset({
        idEmpleado: tarjeta.id_em,
        fechaEntrada: tarjeta.fecha_entrada,
        fechaSalida: tarjeta.fecha_salida,
        horaEntrada: hEnt ?? "00",
        minutoEntrada: mEnt ?? "00",
        horaSalida: hSal ?? "00",
        minutoSalida: mSal ?? "00",
      });
    } else {
      form.reset(defaultValues);
      setEmpleadoTexto("");
    }
  }, [tarjeta, listaEmpleados, form]);

  // Helpers
  const ponerFechaHoy = () => {
    form.setValue("fechaEntrada", new Date());
  };
  const ponerFechaManana = () => {
    const m = new Date();
    m.setDate(m.getDate() + 1);
    form.setValue("fechaSalida", m);
  };
  const ponerHoraActual = () => {
    const now = new Date();
    form.setValue("horaEntrada", String(now.getHours()).padStart(2, "0"));
    form.setValue("minutoEntrada", String(now.getMinutes()).padStart(2, "0"));
  };
  const ponerHoraPorDefecto = () => {
    form.setValue("horaSalida", "16");
    form.setValue("minutoSalida", "30");
  };

  // Búsqueda de empleado (solo en modo creación)
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

      const payload: TarjetaPago = {
        id_em: values.idEmpleado,
        fecha_entrada: values.fechaEntrada,
        fecha_salida: values.fechaSalida,
        hora_entrada: `${values.horaEntrada}:${values.minutoEntrada}`,
        hora_salida: `${values.horaSalida}:${values.minutoSalida}`,
      };

      if (tarjeta) {
        // MODO EDICIÓN
        await editarTarjetaPago(
          tarjeta.id_em,
          formatearFechaParaURL(tarjeta.fecha_entrada),
          payload,
        );
        alert("✅ ¡Éxito! La tarjeta de pago fue actualizada correctamente.");
      } else {
        // MODO CREACIÓN
        const existe = await existeTarjetaPago(
          payload.id_em,
          payload.fecha_entrada,
        );
        if (existe) {
          alert(
            "⚠️ Ya existe una tarjeta de pago para ese empleado en esa fecha",
          );
          return;
        }

        await insertarTarjetaPago(payload);
        alert("✅ ¡Éxito! La tarjeta de pago fue insertada correctamente.");
        form.reset(defaultValues);
        setEmpleadoTexto("");
      }
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al guardar la tarjeta"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (tarjeta) {
      const [hEnt, mEnt] = tarjeta.hora_entrada.split(":");
      const [hSal, mSal] = tarjeta.hora_salida.split(":");
      form.reset({
        idEmpleado: tarjeta.id_em,
        fechaEntrada: tarjeta.fecha_entrada,
        fechaSalida: tarjeta.fecha_salida,
        horaEntrada: hEnt ?? "00",
        minutoEntrada: mEnt ?? "00",
        horaSalida: hSal ?? "00",
        minutoSalida: mSal ?? "00",
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
              {tarjeta ? (
                <div className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  {empleadoTexto || tarjeta.id_em}
                </div>
              ) : (
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

            {/* Fecha entrada */}
            <FormField
              control={form.control}
              name="fechaEntrada"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col md:col-span-2">
                  <FormLabel>Fecha de entrada</FormLabel>
                  <div className="flex gap-3">
                    <Popover>
                      <PopoverTrigger
                        render={(props) => (
                          <Button
                            {...props}
                            type="button"
                            variant="outline"
                            disabled={!!tarjeta}
                            className={cn(
                              "w-[200px] justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              fieldState.error &&
                                "!border-red-500 !focus-visible:ring-red-500",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy", {
                                  locale: es,
                                })
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
                    {!tarjeta && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={ponerFechaHoy}
                        className="shrink-0"
                      >
                        Hoy
                      </Button>
                    )}
                  </div>
                  {tarjeta && (
                    <FormDescription>
                      La fecha de entrada no se puede modificar
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha salida */}
            <FormField
              control={form.control}
              name="fechaSalida"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col md:col-span-2">
                  <FormLabel>Fecha de salida</FormLabel>
                  <div className="flex gap-3">
                    <Popover>
                      <PopoverTrigger
                        render={(props) => (
                          <Button
                            {...props}
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-[200px] justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              fieldState.error &&
                                "!border-red-500 !focus-visible:ring-red-500",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy", {
                                  locale: es,
                                })
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={ponerFechaManana}
                      className="shrink-0"
                    >
                      Mañana
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hora entrada */}
            <FormField
              control={form.control}
              name="horaEntrada"
              render={({ field: fh }) => (
                <FormItem>
                  <FormLabel>Hora de entrada</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Selector
                        items={HORAS}
                        value={fh.value}
                        onChange={fh.onChange}
                        placeholder="HH"
                      />
                    </div>
                    <span className="text-lg">:</span>
                    <FormField
                      control={form.control}
                      name="minutoEntrada"
                      render={({ field: fm }) => (
                        <div className="flex-1">
                          <Selector
                            items={MINUTOS}
                            value={fm.value}
                            onChange={fm.onChange}
                            placeholder="MM"
                          />
                        </div>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={ponerHoraActual}
                      className="shrink-0"
                    >
                      Ahora
                    </Button>
                  </div>
                  <FormDescription>Formato 24h (HH:mm)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hora salida */}
            <FormField
              control={form.control}
              name="horaSalida"
              render={({ field: fh }) => (
                <FormItem>
                  <FormLabel>Hora de salida</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Selector
                        items={HORAS}
                        value={fh.value}
                        onChange={fh.onChange}
                        placeholder="HH"
                      />
                    </div>
                    <span className="text-lg">:</span>
                    <FormField
                      control={form.control}
                      name="minutoSalida"
                      render={({ field: fm }) => (
                        <div className="flex-1">
                          <Selector
                            items={MINUTOS}
                            value={fm.value}
                            onChange={fm.onChange}
                            placeholder="MM"
                          />
                        </div>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={ponerHoraPorDefecto}
                      className="shrink-0"
                    >
                      16:30
                    </Button>
                  </div>
                  <FormDescription>Formato 24h (HH:mm)</FormDescription>
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
              {tarjeta ? "Restablecer" : "Borrar Campos"}
            </Button>

            <Button
              type="submit"
              className="bg-blue-300! hover:bg-blue-600!"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Procesando..."
                : tarjeta
                  ? "Actualizar Tarjeta"
                  : "Insertar Tarjeta de Pago"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioTarjetaPago;