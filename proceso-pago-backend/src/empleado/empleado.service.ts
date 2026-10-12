import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma-service/prisma.service';
import { EmpleadoCompleto, Empleado } from './dto/Empleado.dto';
import { empleado, Prisma } from 'generated/prisma';

@Injectable()
export class EmpleadoService {
    constructor(private prisma: PrismaService) { }


    
    async create(empleado: EmpleadoCompleto): Promise<boolean> {
        try {
            // Validar campos obligatorios
            if (!empleado.idEmpleado || !empleado.nombreEmpleado || !empleado.ocupacion1) {
                throw new Error('Faltan campos obligatorios');
            }

            // Convertir idEmpleado a número
            const idEmpleado = typeof empleado.idEmpleado === 'string'
                ? parseInt(empleado.idEmpleado, 10)
                : empleado.idEmpleado;

            // Verificar si el empleado ya existe
            const existe = await this.prisma.$queryRaw`
                SELECT id_em FROM empleado WHERE id_em = ${idEmpleado}::integer
            `;

            if (existe && (existe as any[]).length > 0) {
                throw new Error(`Ya existe un empleado con el ID ${idEmpleado}`);
            }

            // Construir array de ocupaciones
            const ocupaciones: string[] = [empleado.ocupacion1];
            if (empleado.ocupacion2) {
                ocupaciones.push(empleado.ocupacion2);
            }

            // Formatear arrays para PostgreSQL
            const formatArray = (arr: string[] | undefined): string | null => {
                if (!arr || arr.length === 0) return null;
                return `{${arr.join(',')}}`;
            };

            const ocupacionesArray = formatArray(ocupaciones);
            const bonosArray = formatArray(empleado.bonosEmpleado);

            // Normalizar tipoOcupacion
            const tipoOcupacion = empleado.tipoOcupacion === 'No Propio'
                ? 'No Propia'
                : 'Propia';

            // Ejecutar la función SQL
            await this.prisma.$executeRaw`
                SELECT insertar_empleado(
                    ${idEmpleado}::integer,
                    ${empleado.carnetEmpleado}::varchar,
                    ${empleado.nombreEmpleado}::varchar,
                    ${empleado.apellidoPaterno}::varchar,
                    ${empleado.apellidoMaterno}::varchar,
                    ${empleado.nivelEducEmpleado ?? null}::varchar,
                    ${empleado.telefonoEmpleado ?? null}::varchar,
                    ${empleado.direccionEmpleado ?? null}::varchar,
                    ${tipoOcupacion}::varchar,
                    ${ocupacionesArray}::varchar[],
                    ${bonosArray}::varchar[]
                )
            `;

            return true;

        } catch (error) {
            //console.error('Error en create:', error);

            // Unificar mensaje de error
            let mensaje = 'Error al crear empleado';

            if (error.message?.includes('duplicate key') ||
                error.message?.includes('llave duplicada') ||
                error.message?.includes('violates unique constraint')) {
                mensaje = `Ya existe un empleado con el ID ${empleado.idEmpleado}`;
            } else if (error.message) {
                mensaje = error.message;
            }

            throw new Error(mensaje);
        }
    }

    async findOne(id: number): Promise<EmpleadoCompleto> {
        // Ejecuta la función SQL que devuelve una fila con arrays
        const resultado = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM obtener_empleado_con_ocupacion_y_bonos(${id})
    `;

        // Verificar que haya resultado
        if (!resultado || resultado.length === 0) {
            throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
        }

        const fila = resultado[0];
        return {
            idEmpleado: fila.id_em,
            carnetEmpleado: fila.carnet_em,
            nombreEmpleado: fila.nombre_em,
            apellidoPaterno: fila.apellido1_em,
            apellidoMaterno: fila.apellido2_em,
            nivelEducEmpleado: fila.nivel_ed_em,
            direccionEmpleado: fila.direccion_em,
            telefonoEmpleado: fila.telefono_em,
            bonosEmpleado: fila.bonos,
            tipoOcupacion: fila.tipo_ocupacion,
            ocupacion1: fila.ocupaciones[0],
            ocupacion2: fila.ocupaciones[1],
        };
    }

    async update(id: number, empleado: EmpleadoCompleto): Promise<boolean> {
        try {

            // Ejecutar la función SQL que modifica el empleado y devuelve boolean
            const resultado = await this.prisma.$queryRaw<{ modificar_empleado: boolean }[]>`
            SELECT modificar_empleado(
                ${id}::integer,
                ${empleado.carnetEmpleado}::varchar,
                ${empleado.nombreEmpleado}::varchar,
                ${empleado.apellidoPaterno}::varchar,   -- apellido1 (primer apellido)
                ${empleado.apellidoMaterno}::varchar,   -- apellido2 (segundo apellido)
                ${empleado.nivelEducEmpleado ?? null}::varchar,
                ${empleado.direccionEmpleado ?? null}::varchar,
                ${empleado.telefonoEmpleado ?? null}::varchar,
                ${empleado.bonosEmpleado}::varchar[],
                ${empleado.ocupacion1}::varchar,
                ${empleado.ocupacion2 ?? null}::varchar,
                ${empleado.tipoOcupacion}::varchar
            ) AS modificar_empleado
        `;

            // resultado es un arreglo; extraemos el valor booleano del primer elemento
            if (resultado.length > 0) {
                return resultado[0].modificar_empleado;
            }

            // Si no se obtuvo resultado (caso inesperado), devolvemos false
            return false;

        } catch (error) {
            throw new Error(error.message);
        }
    }

    remove(id: number) {
        return `This action removes a #${id} empleado`;
    }

    async findAll(offset: number, limit: number): Promise<{ data: string[][], total: number }> {
    const [rawData, total] = await Promise.all([
        this.prisma.empleado.findMany({
            skip: offset,
            take: limit,
            orderBy: { id_em: 'asc' },
        }),
        this.prisma.empleado.count(),
    ]);

    const columnas = ['id_em', 'carnet_em', 'nombre_em', 'apellido1_em', 'apellido2_em', 'nivel_ed_em', 'direccion_em', 'telefono_em'];
    const data: string[][] = rawData.map((fila) =>
        columnas.map((col) => {
            const valor = fila[col as keyof empleado];
            return valor === null || valor === undefined ? '' : String(valor);
        })
    );

    return { data, total };
}

    async findOneEmployee(idEmp: number): Promise<string[]> {
        // Usa findUnique porque id_em es clave primaria
        const fila = await this.prisma.empleado.findUnique({
            where: { id_em: idEmp },
        });

        if (!fila) {
            return []; // o lanza un error
        }

        // Define el orden de columnas explícitamente
        const columnas: (keyof empleado)[] = [
            'id_em', 'carnet_em', 'nombre_em',
            'apellido1_em', 'apellido2_em',
            'nivel_ed_em', 'direccion_em', 'telefono_em'
        ];

        // Convierte cada valor a string
        const data: string[] = columnas.map((col) => String(fila[col]));
        return data;
    }
}
