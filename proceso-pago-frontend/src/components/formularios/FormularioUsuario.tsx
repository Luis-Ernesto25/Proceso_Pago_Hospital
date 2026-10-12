"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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
import { existeUsuario, insertarUsuario } from "@/api/usuario.api";
import { Rol, Usuario } from "@/entidades/Usuario";

const ROLES: Rol[] = ["Admin", "Tecnico_RH", "Contador"];

const NOMBRE_ROL: Record<Rol, string> = {
  Admin: "Admin",
  Tecnico_RH: "Tecnico_RH",
  Contador: "Contador",
};

const formSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, { message: "El usuario debe tener al menos 3 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: "Solo letras, números, punto, guion y guion bajo",
    }),

  contrasena: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" }),

  rol: z.enum(["Admin", "Tecnico_RH", "Contador"], {
    message: "Seleccione un rol",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  usuario: "",
  contrasena: "",
  rol: "Tecnico_RH",
};

function FormularioUsuario() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { errors } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload: Usuario = {
        usuario: values.usuario.trim(),
        contrasena: values.contrasena,
        rol: values.rol,
      };

      // 1) Verificar duplicado
      const existe = await existeUsuario(payload.usuario);
      if (existe) {
        alert(`⚠️ El usuario "${payload.usuario}" ya existe`);
        return;
      }

      // 2) Insertar
      await insertarUsuario(payload);
      alert(`✅ Usuario "${payload.usuario}" creado exitosamente`);
      form.reset(defaultValues);
    } catch (error: any) {
      alert(`❌ ${error.message || "Error al crear el usuario"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
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

          <div className="grid grid-cols-1 gap-4">
            {/* Usuario */}
            <FormField
              control={form.control}
              name="usuario"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: jperez"
                      autoComplete="off"
                      {...field}
                      aria-invalid={!!fieldState.error}
                      className={
                        fieldState.error
                          ? "!border-red-500 !focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre único para iniciar sesión
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contraseña */}
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      {...field}
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

            {/* Rol */}
            <FormField
              control={form.control}
              name="rol"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Selector
                      items={ROLES.map((r) => NOMBRE_ROL[r])}
                      value={NOMBRE_ROL[field.value as Rol] ?? ""}
                      onChange={(label) => {
                        const rol = ROLES.find(
                          (r) => NOMBRE_ROL[r] === label
                        );
                        if (rol) field.onChange(rol);
                      }}
                      placeholder="Seleccione un rol"
                    />
                  </FormControl>
                  <FormDescription>
                    Determina qué secciones podrá ver el usuario
                  </FormDescription>
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="bg-blue-300! hover:bg-blue-600!"
              onClick={() => form.reset(defaultValues)}
              disabled={isSubmitting}
            >
              Borrar Campos
            </Button>

            <Button
              type="submit"
              className="bg-blue-300! hover:bg-blue-600!"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormularioUsuario;