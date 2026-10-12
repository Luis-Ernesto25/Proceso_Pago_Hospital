export interface Empleado {
    idEmpleado: number;
    carnetEmpleado: string;
    nombreEmpleado: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nivelEducEmpleado?: string | null;
    direccionEmpleado?: string | null;
    telefonoEmpleado?: string | null;
}

export interface EmpleadoCompleto extends Empleado {
    bonosEmpleado: string[];
    tipoOcupacion: string,
    ocupacion1: string,
    ocupacion2?: string | null
}