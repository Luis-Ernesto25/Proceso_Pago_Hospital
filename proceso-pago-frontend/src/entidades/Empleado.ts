export interface Empleado {
    idEmpleado: number;
    carnetEmpleado: number | string;
    nombreEmpleado: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nivelEducEmpleado?: string | null;
    direccionEmpleado?: string | null;
    telefonoEmpleado?: string | null;
    bonosEmpleado: string[];
}

export interface EmpleadoCompleto extends Empleado {
    tipoOcupacion: string,
    ocupacion1: string,
    ocupacion2?: string | null
}

export interface EmpleadoOcupacion {
    idEmpleado: string,
    ocupacion: string,
}

export interface EmpleadoOcupacionEditar extends EmpleadoOcupacion { }

