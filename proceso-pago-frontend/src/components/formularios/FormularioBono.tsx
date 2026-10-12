"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { editarBono, insertarBono } from "@/api/bono.api";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bono } from "@/entidades/Bono";

// Schema fuera del componente: no se recrea en cada render
const formSchema = z.object({
  idBo: z
    .string()
    .trim()
    .min(1, { message: "El ID del bono es obligatorio" })
    .max(20, { message: "Máximo 20 caracteres" }),
  montoMensual: z
    .string()
    .trim()
    .min(1, { message: "El monto es obligatorio" })
    .regex(/^\d+([.,]\d{1,2})?$/, {
      message: "Monto inválido. Usa por ejemplo 500.04 o 500,04",
    }),
});

type FormValues = z.infer<typeof formSchema>; // { idBo: string; montoMensual: string }

const defaultValues: FormValues = {
  idBo: "",
  montoMensual: "",
};

interface FormularioBonoProps {
  bono?: Bono | null;
}

function FormularioBono({ bono = null }: FormularioBonoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Cargar datos del bono cuando cambia la prop (modo edición)
  useEffect(() => {
    if (bono) {
      form.reset({
        idBo: bono.id_bo ?? "",
        montoMensual:
          bono.monto_mensual_bo != null ? String(bono.monto_mensual_bo) : "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [bono, form]);

  const { errors } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload: Bono = {
        id_bo: values.idBo,
        monto_mensual_bo: Number(values.montoMensual.replace(",", ".")),
      };

      if (bono?.id_bo) {
        //console.log('editando')
        await editarBono(payload);
        alert("✅ Bono editado exitosamente");
      } else {
        //console.log('creando')
        await insertarBono(payload);
        alert("✅ Bono creado exitosamente");
        form.reset(defaultValues);
      }
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al guardar el bono"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Resumen de errores */}
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

          <div className="grid grid-cols-1 gap-4">
            {/* ID Bono */}
            <FormField
              control={form.control}
              name="idBo"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>ID del bono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: BONO-001"
                      {...field}
                      disabled={!!bono}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto Mensual */}
            <FormField
              control={form.control}
              name="montoMensual"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Monto mensual</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 500.04 o 500,04"
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
                : bono
                ? "Actualizar Bono"
                : "Crear Bono"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioBono;
