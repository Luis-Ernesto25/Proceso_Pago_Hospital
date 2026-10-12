"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Selector from "@/components/Selector";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  editarOcupacion,
  existeOcupacion,
  insertarOcupacion,
} from "@/api/ocupacion.api";
import { Ocupacion } from "@/entidades/Ocupacion";

const TIPOS_OCUPACION = ["Propia", "No_Propia"] as const;
type TipoOcupacion = (typeof TIPOS_OCUPACION)[number];

const COSTOS_POR_TIPO: Record<TipoOcupacion, string[]> = {
  Propia: ["30", "40", "50", "100"],
  No_Propia: ["0.96"],
};

const decimalRegex = /^\d+([.,]\d{1,2})?$/;

const formSchema = z.object({
  idOc: z
    .string()
    .trim()
    .min(1, { message: "El nombre de la ocupación es obligatorio" })
    .max(50, { message: "Máximo 50 caracteres" }),

  tipoOcupacion: z.enum(TIPOS_OCUPACION, {
    message: "Seleccione un tipo de ocupación",
  }),

  costoHoraGuardia: z.string().min(1, {
    message: "El costo por hora de guardia es obligatorio",
  }),

  salarioMes: z
    .string()
    .trim()
    .min(1, { message: "El salario mensual es obligatorio" })
    .regex(decimalRegex, {
      message: "Salario inválido. Usa por ejemplo 500.00 o 500,00",
    })
    .refine((v) => Number(v.replace(",", ".")) > 0, {
      message: "El salario debe ser un número mayor que 0",
    }),

  cantHorasJornada: z
    .string()
    .trim()
    .min(1, { message: "Las horas por jornada son obligatorias" })
    .refine(
      (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 24;
      },
      { message: "Debe ser un número entero entre 1 y 24" }
    ),

  cantHorasGuardia: z
    .string()
    .trim()
    .min(1, { message: "Las horas de guardia son obligatorias" })
    .refine(
      (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 999;
      },
      { message: "Debe ser un número entero entre 0 y 999" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  idOc: "",
  tipoOcupacion: "Propia",
  costoHoraGuardia: "",
  salarioMes: "",
  cantHorasJornada: "8",
  cantHorasGuardia: "0",
};

interface FormularioOcupacionProps {
  ocupacion?: Ocupacion | null;
}

function FormularioOcupacion({ ocupacion = null }: FormularioOcupacionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;

  const tipoActual = form.watch("tipoOcupacion");
  const costosDisponibles = COSTOS_POR_TIPO[tipoActual] ?? [];

  // Cargar datos cuando llega la prop de edición
  useEffect(() => {
    if (ocupacion) {
      form.reset({
        idOc: ocupacion.id_oc ?? "",
        tipoOcupacion: ocupacion.tipo_ocupacion,
        costoHoraGuardia: String(ocupacion.costo_hora_guardia_oc),
        salarioMes: String(ocupacion.salario_mes_oc),
        cantHorasJornada: String(ocupacion.cant_horas_jornada),
        cantHorasGuardia: String(ocupacion.cant_horas_guardia_oc),
      });
    } else {
      form.reset(defaultValues);
    }
  }, [ocupacion, form]);

  // Al cambiar el tipo, limpiamos el costo SOLO si estamos creando
  useEffect(() => {
    if (!ocupacion) {
      form.setValue("costoHoraGuardia", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoActual]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload: Ocupacion = {
        id_oc: values.idOc,
        tipo_ocupacion: values.tipoOcupacion,
        salario_mes_oc: Number(values.salarioMes.replace(",", ".")),
        costo_hora_guardia_oc: Number(
          values.costoHoraGuardia.replace(",", ".")
        ),
        cant_horas_jornada: Number(values.cantHorasJornada),
        cant_horas_guardia_oc: Number(values.cantHorasGuardia),
      };

      if (ocupacion) {
        // Modo edición
        await editarOcupacion(ocupacion.id_oc, payload);
        alert(
          `✅ ¡Éxito! La ocupación "${payload.id_oc}" fue actualizada correctamente.`
        );
      } else {
        // Modo creación: verificar duplicado
        const existe = await existeOcupacion(payload);
        if (existe) {
          alert(
            `⚠️ La ocupación "${payload.id_oc}" ya existe en la base de datos`
          );
          return;
        }

        await insertarOcupacion(payload);
        alert(
          `✅ ¡Éxito! La ocupación "${payload.id_oc}" fue registrada correctamente.`
        );
        form.reset(defaultValues);
      }
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al guardar la ocupación"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="idOc"
              render={({ field, fieldState }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre de la ocupación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Médico de guardia"
                      {...field}
                      disabled={!!ocupacion}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  {ocupacion && (
                    <FormDescription>
                      El id no se puede modificar en modo edición
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de ocupación */}
            <FormField
              control={form.control}
              name="tipoOcupacion"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Tipo de ocupación</FormLabel>
                  <FormControl>
                    <Selector
                      items={[...TIPOS_OCUPACION]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccione un tipo"
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

            {/* Costo por hora de guardia */}
            <FormField
              control={form.control}
              name="costoHoraGuardia"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Costo por hora de guardia</FormLabel>
                  <FormControl>
                    <Selector
                      items={costosDisponibles}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccione el costo"
                    />
                  </FormControl>
                  <FormDescription>
                    {tipoActual === "Propia"
                      ? "Opciones: 30, 40, 50, 100"
                      : "Opción única: 0.96"}
                  </FormDescription>
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Salario mensual */}
            <FormField
              control={form.control}
              name="salarioMes"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Salario mensual</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 500.00 o 500,00"
                      {...field}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormDescription>Acepta punto o coma decimal</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horas por jornada */}
            <FormField
              control={form.control}
              name="cantHorasJornada"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Horas por jornada</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      step={1}
                      {...field}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormDescription>Entre 1 y 24</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horas de guardia */}
            <FormField
              control={form.control}
              name="cantHorasGuardia"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Horas de guardia</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      step={1}
                      {...field}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormDescription>Entre 0 y 999</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="!bg-blue-300 hover:!bg-blue-600"
              onClick={() => form.reset(defaultValues)}
              disabled={isSubmitting}
            >
              Borrar Campos
            </Button>

            <Button
              type="submit"
              className="!bg-blue-300 hover:!bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Procesando..."
                : ocupacion
                ? "Actualizar Ocupación"
                : "Insertar Ocupación"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioOcupacion;
