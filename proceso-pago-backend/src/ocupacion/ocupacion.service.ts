import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Prisma, tipo_ocupacion } from 'generated/prisma';
import { Ocupacion } from './dto/ocupacion.dto';

@Injectable()
export class OcupacionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convierte los campos Decimal de Prisma a number.
   * Prisma devuelve `Decimal`, pero la interfaz Ocupacion usa `number`.
   */
  private toOcupacion(raw: {
    id_oc: string;
    salario_mes_oc: Prisma.Decimal;
    costo_hora_guardia_oc: Prisma.Decimal;
    tipo_ocupacion: tipo_ocupacion;
    cant_horas_jornada: number;
    cant_horas_guardia_oc: number;
  }): Ocupacion {
    return {
      id_oc: raw.id_oc,
      salario_mes_oc: Number(raw.salario_mes_oc),
      costo_hora_guardia_oc: Number(raw.costo_hora_guardia_oc),
      tipo_ocupacion: raw.tipo_ocupacion,
      cant_horas_jornada: raw.cant_horas_jornada,
      cant_horas_guardia_oc: raw.cant_horas_guardia_oc,
    };
  }

  /**
   * Inserta una nueva ocupación.
   */
  async create(ocupacion: Ocupacion): Promise<Ocupacion> {
    const existente = await this.prisma.ocupacion.findUnique({
      where: { id_oc: ocupacion.id_oc },
    });

    if (existente) {
      throw new ConflictException(
        `La ocupación "${ocupacion.id_oc}" ya existe en la base de datos`
      );
    }

    try {
      const creada = await this.prisma.ocupacion.create({
        data: {
          id_oc: ocupacion.id_oc,
          salario_mes_oc: ocupacion.salario_mes_oc,
          cant_horas_jornada: ocupacion.cant_horas_jornada,
          tipo_ocupacion: ocupacion.tipo_ocupacion,
          cant_horas_guardia_oc: ocupacion.cant_horas_guardia_oc,
          costo_hora_guardia_oc: ocupacion.costo_hora_guardia_oc,
        },
      });

      return this.toOcupacion(creada);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `La ocupación "${ocupacion.id_oc}" ya existe en la base de datos`
        );
      }
      throw error;
    }
  }

  /**
   * Lista paginada para la tabla.
   * Devuelve filas ya formateadas como string[][].
   */
  async findAll(
    offset: number,
    limit: number
  ): Promise<{ data: string[][]; total: number }> {
    const [rawData, total] = await Promise.all([
      this.prisma.ocupacion.findMany({
        skip: offset,
        take: limit,
        orderBy: { id_oc: 'asc' },
      }),
      this.prisma.ocupacion.count(),
    ]);

    // Orden EXACTO que las columnas de la página
    const columnas = [
      'id_oc',
      'salario_mes_oc',
      'cant_horas_jornada',
      'tipo_ocupacion',
      'cant_horas_guardia_oc',
      'costo_hora_guardia_oc',
    ] as const;

    const data: string[][] = rawData.map((fila) =>
      columnas.map((col) => {
        const valor = fila[col];
        if (col === 'tipo_ocupacion') {
          return valor === 'No_Propia' ? 'No Propia' : String(valor);
        }
        return String(valor);
      })
    );

    return { data, total };
  }

  /**
   * Lista completa sin paginar (por si la necesitas en otro sitio).
   */
  async findAllCompleto(): Promise<Ocupacion[]> {
    const ocupaciones = await this.prisma.ocupacion.findMany({
      orderBy: { id_oc: 'asc' },
    });
    return ocupaciones.map((oc) => this.toOcupacion(oc));
  }

  /**
   * Devuelve solo los ids de las ocupaciones no propias.
   */
  async findAllNoPropias(): Promise<string[]> {
    const ocupaciones = await this.prisma.ocupacion.findMany({
      select: { id_oc: true },
      where: { tipo_ocupacion: 'No_Propia' },
      orderBy: { id_oc: 'asc' },
    });
    return ocupaciones.map((oc) => oc.id_oc);
  }

  /**
   * Devuelve solo los ids de las ocupaciones propias.
   */
  async findAllPropias(): Promise<string[]> {
    const ocupaciones = await this.prisma.ocupacion.findMany({
      select: { id_oc: true },
      where: { tipo_ocupacion: 'Propia' },
      orderBy: { id_oc: 'asc' },
    });
    return ocupaciones.map((oc) => oc.id_oc);
  }

  /**
   * Verifica si una ocupación existe. Usado por el formulario.
   */
  async existe(idOc: string): Promise<boolean> {
    const existente = await this.prisma.ocupacion.findUnique({
      where: { id_oc: idOc },
      select: { id_oc: true },
    });

    return existente !== null;
  }

  /**
   * Busca una ocupación por su id (devuelve el objeto completo).
   */
  async findOne(idOc: string): Promise<Ocupacion> {
    const ocupacion = await this.prisma.ocupacion.findUnique({
      where: { id_oc: idOc },
    });

    if (!ocupacion) {
      throw new NotFoundException(`La ocupación "${idOc}" no existe`);
    }

    return this.toOcupacion(ocupacion);
  }

  /**
   * Busca una ocupación por su id y devuelve una fila string[]
   * en el mismo orden que las columnas de la tabla.
   * Usado por el buscador de PaginaBusquedaTablaPaginacion.
   */
  async findOneEmployee(idOc: string): Promise<string[]> {
    const fila = await this.prisma.ocupacion.findUnique({
      where: { id_oc: idOc },
    });

    if (!fila) {
      return [];
    }

    const columnas: (keyof typeof fila)[] = [
      'id_oc',
      'salario_mes_oc',
      'cant_horas_jornada',
      'tipo_ocupacion',
      'cant_horas_guardia_oc',
      'costo_hora_guardia_oc',
    ];

    return columnas.map((col) => {
      const valor = fila[col];
      if (col === 'tipo_ocupacion') {
        return valor === 'No_Propia' ? 'No Propia' : String(valor);
      }
      return String(valor);
    });
  }

  /**
   * Actualiza una ocupación.
   */
  async update(idOc: string, ocupacion: Ocupacion): Promise<Ocupacion> {
    const existente = await this.prisma.ocupacion.findUnique({
      where: { id_oc: idOc },
    });

    if (!existente) {
      throw new NotFoundException(`La ocupación "${idOc}" no existe`);
    }

    const actualizada = await this.prisma.ocupacion.update({
      where: { id_oc: idOc },
      data: {
        salario_mes_oc: ocupacion.salario_mes_oc,
        cant_horas_jornada: ocupacion.cant_horas_jornada,
        tipo_ocupacion: ocupacion.tipo_ocupacion,
        cant_horas_guardia_oc: ocupacion.cant_horas_guardia_oc,
        costo_hora_guardia_oc: ocupacion.costo_hora_guardia_oc,
      },
    });

    return this.toOcupacion(actualizada);
  }

  /**
   * Elimina una ocupación por su id.
   */
  async remove(idOc: string): Promise<void> {
    try {
      await this.prisma.ocupacion.delete({
        where: { id_oc: idOc },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`La ocupación "${idOc}" no existe`);
        }
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new ConflictException(
            `No se puede eliminar la ocupación "${idOc}": tiene registros asociados`
          );
        }
      }
      throw error;
    }
  }
}