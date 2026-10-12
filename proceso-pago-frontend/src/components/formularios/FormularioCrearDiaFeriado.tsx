"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  insertarDiaFeriado,
} from "@/api/dia-feriado.api";
import { DiaFeriado } from "@/entidades/DiaFeriado";

// Schema fuera del componente: no se recrea en cada render
const formSchema = z.object({
  diaFeriado: z.date({
    message: "La fecha del día feriado es obligatoria",
  }),
});

type FormValues = z.infer<typeof formSchema>; // { diaFeriado: Date }

const defaultValues: FormValues = {
  diaFeriado: undefined as unknown as Date,
};

function FormularioDiaFeriado() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload: DiaFeriado = {
        fecha_dia: values.diaFeriado,
      };

      // 2) Insertar
      await insertarDiaFeriado(payload);
      alert("✅ Día feriado insertado exitosamente");
      form.reset(defaultValues);
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al insertar el día feriado"}`);
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
            {/* Día feriado */}
            <FormField
              control={form.control}
              name="diaFeriado"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Día feriado</FormLabel>
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
                              "!border-red-500 !focus-visible:ring-red-500"
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
                  <FormDescription>
                    Seleccione el día feriado a registrar
                  </FormDescription>
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
              {isSubmitting ? "Procesando..." : "Insertar Día Feriado"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioDiaFeriado;