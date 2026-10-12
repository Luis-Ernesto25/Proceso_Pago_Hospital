"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login } from "@/api/auth-api";

const formSchema = z.object({
  usuario: z.string().trim().min(1, { message: "El usuario es obligatorio" }),
  contrasena: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  usuario: "",
  contrasena: "",
};

const RUTA_INICIAL_POR_ROL: Record<string, string> = {
  Admin: "/admin",
  Tecnico_RH: "/rrhh",   // 👈
  Contador: "/contador",
};

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
  try {
    setIsSubmitting(true);
    setErrorGlobal(null);

    const respuesta = await login(values.usuario, values.contrasena);
    

    const ruta = RUTA_INICIAL_POR_ROL[respuesta.rol] ?? "/";
    

    router.push(ruta);

    router.refresh();
    console.log("5️⃣ router.refresh ejecutado");
  } catch (error: any) {
    console.error("❌ Error en login:", error);
    setErrorGlobal(error.message || "Error al iniciar sesión");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {errorGlobal && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {errorGlobal}
                </div>
              )}

              <FormField
                control={form.control}
                name="usuario"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese su usuario"
                        autoComplete="username"
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

              <FormField
                control={form.control}
                name="contrasena"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingrese su contraseña"
                        autoComplete="current-password"
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

              <Button
                type="submit"
                className="w-full !bg-blue-300 hover:!bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
