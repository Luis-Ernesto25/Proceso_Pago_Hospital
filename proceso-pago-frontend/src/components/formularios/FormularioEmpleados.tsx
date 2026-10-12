// @ts-nocheck
"use client";

import Selector from "@/components/Selector";
import MultiSelector from "@/components/MultiSelector";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { getTodosBonos } from "@/api/bono.api";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  getOcupacionesNoPropias,
  getOcupacionesPropias,
} from "@/api/ocupacion.api";
import { insertarEmpleado, editarEmpleadoCompleto } from "@/api/empleado.api";
import { EmpleadoCompleto } from "@/entidades/Empleado";
import ComboBox from "@/components/ComboBox";

// Opciones para el nivel educativo
const nivelesEducativos = [
  "Primaria",
  "Secundaria",
  "Técnico",
  "Medio-Superior",
  "Universitario",
  "Postgrado",
];



// Esquema de validación con zod
const formSchema = z.object({
  idEmpleado: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, {
      message: "El ID del empleado debe tener entre 1 y 4 números",
    }),
  carnetEmpleado: z
    .string()
    .trim()
    .regex(/^\d{11}$/, {
      message: "El carnet de identidad debe tener exactamente 11 números",
    }),
  nombreEmpleado: z
    .string()
    .trim()
    .min(1, { message: "Introduce un nombre válido" })
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+)*$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),
  apellidoPaterno: z
    .string()
    .trim()
    .min(1, { message: "Introduce un apellido válido" })
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+)*$/, {
      message: "El apellido solo puede contener letras y espacios",
    }),
  apellidoMaterno: z
    .string()
    .trim()
    .min(1, { message: "Introduce un apellido válido" })
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+)*$/, {
      message: "El apellido solo puede contener letras y espacios",
    }),
  nivelEducEmpleado: z.preprocess(
    (val) => (val === "" ? null : val),
    z.enum(nivelesEducativos).nullable()
  ),
  bonosEmpleado: z.array(z.string()).default([]),
  tipoOcupacion: z.enum(["Propio", "No Propio"]).default("Propio"),
  ocupacion1: z.string().min(1, "Selecciona una ocupación"),
  ocupacion2: z.string().optional(),
  direccionEmpleado: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable()
  ),
  telefonoEmpleado: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string()
      .regex(/^\d{8}$/, {
        message: "El teléfono debe tener exactamente 8 números",
      })
      .nullable()
  ),
});

export function FormularioEmpleado({ empleado = null }) {
  const [listaBonos, setListaBonos] = useState([]);
  const [loadingBonos, setLoadingBonos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [listaOcupacionesPropias, setOcupacionesPropias] = useState([]);
  const [listaOcupacionesNoPropias, setOcupacionesNoPropias] = useState([]);

  useEffect(() => {
    // Cargar bonos
    getTodosBonos()
      .then((data) => {
        setListaBonos(data);
        setLoadingBonos(false);
      })
      .catch((error) => {
        console.error("Error cargando bonos:", error);
        alert("Error al cargar los bonos. Por favor, recarga la página.");
        setLoadingBonos(false);
      });

    // Cargar ocupaciones propias
    getOcupacionesPropias()
      .then((data) => {
        setOcupacionesPropias(data);
      })
      .catch((error) => {
        console.error("Error cargando ocupaciones propias:", error);
        alert("Error al cargar las ocupaciones propias.");
      });

    // Cargar ocupaciones no propias
    getOcupacionesNoPropias()
      .then((data) => {
        setOcupacionesNoPropias(data);
      })
      .catch((error) => {
        console.error("Error cargando ocupaciones no propias:", error);
        alert("Error al cargar las ocupaciones no propias.");
      });
  }, []);

  const defaultValues = {
    idEmpleado: "",
    carnetEmpleado: "",
    nombreEmpleado: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    nivelEducEmpleado: "",
    bonosEmpleado: [],
    tipoOcupacion: "Propio",
    ocupacion1: "",
    ocupacion2: "",
    direccionEmpleado: "",
    telefonoEmpleado: "",
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Efecto para cargar datos del empleado cuando cambia la prop
  useEffect(() => {
    if (empleado) {
      // Normalizar tipoOcupacion: aceptar tanto masculino como femenino
      const tipoOcupacionNormalizado =
        empleado.tipoOcupacion === "No Propia" ||
        empleado.tipoOcupacion === "No Propio"
          ? "No Propio"
          : "Propio";

      const ocup1 = empleado.ocupacion1 ?? "";
      const ocup2 = empleado.ocupacion2 ?? "";

      form.reset({
        idEmpleado: String(empleado.idEmpleado ?? "").padStart(4, "0"),
        carnetEmpleado: String(empleado.carnetEmpleado ?? ""),
        nombreEmpleado: empleado.nombreEmpleado ?? "",
        apellidoPaterno: empleado.apellidoPaterno ?? "",
        apellidoMaterno: empleado.apellidoMaterno ?? "",
        nivelEducEmpleado: empleado.nivelEducEmpleado ?? "",
        bonosEmpleado: empleado.bonosEmpleado ?? [],
        tipoOcupacion: tipoOcupacionNormalizado,
        ocupacion1: ocup1,
        ocupacion2: ocup2,
        direccionEmpleado: empleado.direccionEmpleado ?? "",
        telefonoEmpleado: empleado.telefonoEmpleado ?? "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [empleado, form]);

  async function onSubmit(values: EmpleadoCompleto) {
    try {
      // Convertir campos vacíos a null si es necesario
      if (values.nivelEducEmpleado === "") {
        values.nivelEducEmpleado = null;
      }
      if (values.telefonoEmpleado === "") {
        values.telefonoEmpleado = null;
      }
      if (values.direccionEmpleado === "") {
        values.direccionEmpleado = null;
      }

      if (empleado?.idEmpleado) {
        //console.log("Actualizar empleado:", values);
        await editarEmpleadoCompleto(values);
        alert("✅ Empleado editado exitosamente");
      } else {
        //console.log("Crear empleado:", values);
        await insertarEmpleado(values);
        alert("✅ Empleado creado exitosamente");
        form.reset(defaultValues);
      }
    } catch (error) {
      //console.error("Error:", error);
      // SOLO UN alert con el mensaje
      alert(`❌ ${error.message || "Error al crear empleado"}`);
    }
  }

  const { errors } = form.formState;
  const tipoOcupacion = form.watch("tipoOcupacion");
  const ocupacion1 = form.watch("ocupacion1");

  // Determinar lista de ocupaciones según tipo
  const listaOcupaciones =
    tipoOcupacion === "Propio"
      ? listaOcupacionesPropias
      : listaOcupacionesNoPropias;

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Empleado */}
            <FormField
              control={form.control}
              name="idEmpleado"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>ID Empleado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234"
                      {...field}
                      disabled={!!empleado}
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

            {/* Carnet de Identidad */}
            <FormField
              control={form.control}
              name="carnetEmpleado"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Carnet de Identidad</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678901"
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

            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombreEmpleado"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan"
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

            {/* Apellido Paterno */}
            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pérez"
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

            {/* Apellido Materno */}
            <FormField
              control={form.control}
              name="apellidoMaterno"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Gómez"
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

            {/* Bonos (MultiSelector) */}
            <FormField
              control={form.control}
              name="bonosEmpleado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecciona Bonos</FormLabel>
                  <FormControl>
                    <MultiSelector
                      items={listaBonos}
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nivel Educativo (Selector) */}
            <FormField
              control={form.control}
              name="nivelEducEmpleado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Educativo</FormLabel>
                  <FormControl>
                    <Selector
                      items={nivelesEducativos}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Selecciona un nivel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Ocupación*/}
            <div className="md:col-span-2 space-y-2">
              <Label>Tipo de Ocupación</Label>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="tipoOcupacion"
                  render={({ field }) => (
                    <>
                      <button
                        type="button"
                        onClick={() => field.onChange("Propio")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                          field.value === "Propio"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            field.value === "Propio"
                              ? "border-white bg-blue-600"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {field.value === "Propio" && (
                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </span>
                        Propio
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("No Propio")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                          field.value === "No Propio"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            field.value === "No Propio"
                              ? "border-white bg-blue-600"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {field.value === "No Propio" && (
                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </span>
                        No Propio
                      </button>
                    </>
                  )}
                />
              </div>
              <FormMessage>
                {form.formState.errors.tipoOcupacion?.message}
              </FormMessage>
            </div>

            {/* Primera Ocupación */}
            <FormField
              control={form.control}
              name="ocupacion1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tipoOcupacion === "Propio"
                      ? "Ocupación"
                      : "Primera Ocupación"}
                  </FormLabel>
                  <FormControl>
                    <ComboBox
                      value={field.value}
                      onChange={field.onChange}
                      items={listaOcupaciones}
                      placeholder="Buscar ocupación..."
                      searchPlaceholder="Buscar ocupación..."
                      emptyMessage="No se encontró la ocupación."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Segunda Ocupación (solo No Propio) */}
            {tipoOcupacion === "No Propio" && (
              <FormField
                control={form.control}
                name="ocupacion2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segunda Ocupación (Opcional)</FormLabel>
                    <FormControl>
                      <ComboBox
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        items={listaOcupaciones}
                        placeholder="Buscar segunda ocupación..."
                        searchPlaceholder="Buscar ocupación..."
                        emptyMessage="No se encontró la ocupación."
                        excluirValor={ocupacion1}
                      />
                    </FormControl>
                    <FormDescription>
                      Si no selecciona, se asume que no tiene segunda ocupación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccionEmpleado"
              render={({ field, fieldState }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle, número, ciudad"
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

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="telefonoEmpleado"
              render={({ field, fieldState }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678"
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
                : empleado
                ? "Actualizar Empleado"
                : "Crear Empleado"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
