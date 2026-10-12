import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Bono } from './dto/Bono';

import { Prisma } from '../../generated/prisma';

@Injectable()
export class BonoService {
  constructor(private prisma: PrismaService) { }

  async create(bonoNuevo: Bono): Promise<void> {
    const existente = await this.prisma.bono.findUnique({
      where: { id_bo: bonoNuevo.id_bo },
      select: { id_bo: true },
    });

    if (existente) {
      throw new ConflictException(
        `El bono con id "${bonoNuevo.id_bo}" ya existe`
      );
    }

    await this.prisma.$executeRaw`SELECT insertar_bono(${bonoNuevo.id_bo}, ${bonoNuevo.monto_mensual_bo})`;
  }

  async findAll(offset: number, limit: number): Promise<{ data: string[][]; total: number }> {
    const [res, total] = await this.prisma.$transaction([
      this.prisma.bono.findMany({
        skip: offset,
        take: limit,
        orderBy: { id_bo: 'asc' },
      }),
      this.prisma.bono.count(),
    ]);

    // Cada fila -> array de strings
    const data: string[][] = res.map((fila) => [
      fila.id_bo,
      String(fila.monto_mensual_bo),
    ]);

    return { data, total };
  }

  /*async delete(idBono: string): Promise<boolean> {
    try {
      await this.prisma.bono.delete({
        where: { id_bo: idBono },
      });
      return true;
    } catch (error) {
      // Bono con relaciones (FK constraint)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2003" || error.code === "P2014")
      ) {
        return false;
      }
  
      // Bono no existe
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return false;
      }
  
      // Cualquier otro error, lo dejamos propagar
      throw error;
    }
  }*/
  async delete(idBono: string): Promise<boolean> {
    const tieneRelaciones = await this.prisma.empleado_bono.findFirst({
      where: { id_bo: idBono },
      select: { id_em: true },
    });
    if (tieneRelaciones?.id_em) return false;

    try {
      await this.prisma.bono.delete({ where: { id_bo: idBono } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (["P2003", "P2014", "P2025"].includes(error.code)) return false;
      }
      throw error;
    }
  }
  async findAllId(): Promise<string[]> {
    const bonos = await this.prisma.bono.findMany({
      select: { id_bo: true }
    });
    return bonos.map(bono => bono.id_bo);
  }

  async findOne(id: string): Promise<string[]> {
    const bonoObtenido = await this.prisma.bono.findUnique({
      where: { id_bo: id },
    });

    if (!bonoObtenido) {
      throw new NotFoundException(`Bono con ID ${id} no encontrado`);
    }
    let bonoString: string[] = []
    bonoString[0] = bonoObtenido.id_bo
    bonoString[1] = String(bonoObtenido.monto_mensual_bo)
    return bonoString;
  }

  async update(id: string, bono: Bono): Promise<Bono> {
    try {
      const bonoActualizado = await this.prisma.bono.update({
        where: { id_bo: id },
        data: {
          monto_mensual_bo: bono.monto_mensual_bo,
        },
      });

      return {
        id_bo: bonoActualizado.id_bo,
        monto_mensual_bo: Number(bonoActualizado.monto_mensual_bo),
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Bono con ID ${id} no encontrado`);
      }
      throw error;
    }
  }
}
