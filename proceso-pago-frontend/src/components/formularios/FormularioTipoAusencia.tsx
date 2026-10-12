"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  editarTipoAusencia,
  existeTipoAusencia,
  insertarTipoAusencia,
} from "@/api/tipo-ausencia.api";
import { TipoAusencia } from "@/entidades/TipoAusencia";

const formSchema = z.object({
  idTipoAusencia: z
    .string()
    .trim()
    .min(1, { message: "El ID del tipo de ausencia es obligatorio" })
    .max(50, { message: "Máximo 50 caracteres" }),

  sePagaSueldo: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  idTipoAusencia: "",
  sePagaSueldo: false,
};

interface Props {
  tipo?: TipoAusencia | null;
}

function FormularioTipoAusencia({ tipo = null }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;

  // Cargar datos cuando llega la prop `tipo` (modo edición)
  useEffect(() => {
    if (tipo) {
      form.reset({
        idTipoAusencia: tipo.id_tipo_ausencia,
        sePagaSueldo: tipo.se_paga_sueldo_ti,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [tipo, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload: TipoAusencia = {
        id_tipo_ausencia: values.idTipoAusencia.trim(),
        se_paga_sueldo_ti: values.sePagaSueldo,
      };

      if (tipo) {
        // MODO EDICIÓN
        await editarTipoAusencia(tipo.id_tipo_ausencia, payload);
        alert("✅ ¡Éxito! El tipo de ausencia fue actualizado correctamente.");
      } else {
        // MODO CREACIÓN
        const existe = await existeTipoAusencia(payload.id_tipo_ausencia);
        if (existe) {
          alert(
            `⚠️ Ya existe un tipo de ausencia con el ID "${payload.id_tipo_ausencia}"`,
          );
          return;
        }

        await insertarTipoAusencia(payload);
        alert("✅ ¡Éxito! El tipo de ausencia fue insertado correctamente.");
        form.reset(defaultValues);
      }
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al guardar el tipo de ausencia"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (tipo) {
      form.reset({
        idTipoAusencia: tipo.id_tipo_ausencia,
        sePagaSueldo: tipo.se_paga_sueldo_ti,
      });
    } else {
      form.reset(defaultValues);
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

          <div className="grid grid-cols-1 gap-6">
            {/* ID del Tipo de Ausencia */}
            <FormField
              control={form.control}
              name="idTipoAusencia"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>ID del Tipo de Ausencia</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      maxLength={50}
                      placeholder="Ej: Vacaciones, Enfermedad, Permiso..."
                      disabled={!!tipo}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldState.error
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${tipo ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                  </FormControl>
                  {tipo && (
                    <FormDescription>
                      El ID no se puede modificar en modo edición
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Se paga sueldo */}
            <FormField
              control={form.control}
              name="sePagaSueldo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      ¿Se paga sueldo durante esta ausencia?
                    </FormLabel>
                    <FormDescription>
                      Activa esta opción si el empleado recibe su salario
                      durante este tipo de ausencia.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </FormControl>
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
              {tipo ? "Restablecer" : "Borrar Campos"}
            </Button>

            <Button
              type="submit"
              className="!bg-blue-300 hover:!bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Procesando..."
                : tipo
                  ? "Actualizar Tipo"
                  : "Insertar Tipo de Ausencia"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioTipoAusencia;