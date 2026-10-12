import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Prisma } from '../../generated/prisma';
import { DiaFeriado } from './dto/dia-feriado.dto';

@Injectable()
export class DiaFeriadoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Inserta un nuevo día feriado.
   */
  async create(diaFeriado: DiaFeriado): Promise<DiaFeriado> {
  const fecha = this.parseFecha(diaFeriado.fecha_dia);

  // Verifica si ya existe dentro de la misma operación
  const existente = await this.prisma.dias_feriados.findUnique({
    where: { fecha_dia: fecha },
  });

  if (existente) {
    throw new ConflictException(
      'El día feriado ya existe en la base de datos'
    );
  }

  try {
    return await this.prisma.dias_feriados.create({
      data: { fecha_dia: fecha },
    });
  } catch (error) {
    // Por si otra petición insertó entre el check y el create (race condition)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' // unique constraint
    ) {
      throw new ConflictException(
        'El día feriado ya existe en la base de datos'
      );
    }
    throw error;
  }
}

  /**
   * Devuelve todos los días feriados ordenados por fecha ascendente.
   */
  async findAll(): Promise<DiaFeriado[]> {
    return this.prisma.dias_feriados.findMany({
      orderBy: { fecha_dia: 'asc' },
    });
  }


  /**
   * Busca un día feriado por su fecha.
   */
  async findOne(fecha: Date | string): Promise<DiaFeriado> {
    const fechaNorm = this.parseFecha(fecha);

    const dia = await this.prisma.dias_feriados.findFirst({
      where: { fecha_dia: fechaNorm },
    });

    if (!dia) {
      throw new NotFoundException('El día feriado no existe');
    }

    return dia;
  }

  /**
   * Actualiza un día feriado. Se identifica por la fecha original
   * y se cambia a la nueva fecha indicada en `diaFeriado`.
   */
  async update(
    fechaOriginal: Date | string,
    diaFeriado: DiaFeriado
  ): Promise<DiaFeriado> {
    const fechaVieja = this.parseFecha(fechaOriginal);

    const existente = await this.prisma.dias_feriados.findFirst({
      where: { fecha_dia: fechaVieja },
    });

    if (!existente) {
      throw new NotFoundException('El día feriado no existe');
    }

    const fechaNueva = this.parseFecha(diaFeriado.fecha_dia);

    return this.prisma.dias_feriados.update({
      where: { fecha_dia: fechaVieja },
      data: { fecha_dia: fechaNueva },
    });
  }

  /**
   * Elimina un día feriado por su fecha.
   */
  async remove(fecha: Date | string): Promise<void> {
    const fechaNorm = this.parseFecha(fecha);

    try {
      await this.prisma.dias_feriados.delete({
        where: { fecha_dia: fechaNorm },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('El día feriado no existe');
      }
      throw error;
    }
  }

  /**
   * Normaliza cualquier entrada a un Date a medianoche UTC.
   * Acepta Date o string "yyyy-MM-dd".
   * Evita el desfase de zona horaria que mueve el día.
   */
  private parseFecha(fecha: Date | string): Date {
    if (fecha instanceof Date) {
      return new Date(
        Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
      );
    }

    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
}