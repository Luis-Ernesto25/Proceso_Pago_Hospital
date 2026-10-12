import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class TipoAusenciaService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // === MÉTODOS EXISTENTES (NO MODIFICAR) =====================
  // ============================================================

  async findAll(): Promise<string[]> {
    const tipos = await this.prisma.tipo_ausencia.findMany({
      orderBy: { id_tipo_ausencia: 'asc' },
    });
    return tipos.map((t) => t.id_tipo_ausencia);
  }

  async findAllCompletos() {
    return this.prisma.tipo_ausencia.findMany({
      orderBy: { id_tipo_ausencia: 'asc' },
    });
  }

  async findOne(id: string) {
    const tipo = await this.prisma.tipo_ausencia.findUnique({
      where: { id_tipo_ausencia: id },
    });
    if (!tipo) {
      throw new NotFoundException(`El tipo de ausencia "${id}" no existe`);
    }
    return tipo;
  }

  async create(dto: { id_tipo_ausencia: string; se_paga_sueldo_ti: boolean }) {
    return this.prisma.tipo_ausencia.create({ data: dto });
  }

  // ============================================================
  // === MÉTODOS NUEVOS ========================================
  // ============================================================

  /**
   * READ - Paginado. Devuelve filas string[][] + total.
   * (Formato que esperan los componentes de tabla.)
   * Nota: se llama `findPaginado` para no chocar con `findAll()`.
   */
  async findPaginado(
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const [filas, total] = await Promise.all([
      this.prisma.tipo_ausencia.findMany({
        orderBy: { id_tipo_ausencia: 'asc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.tipo_ausencia.count(),
    ]);

    const data: string[][] = filas.map((f) => [
      f.id_tipo_ausencia,
      f.se_paga_sueldo_ti ? 'Sí' : 'No',
    ]);

    return { data, total };
  }

  /**
   * READ - Detalle para formulario de edición.
   */
  async findDetalle(id: string) {
    const fila = await this.prisma.tipo_ausencia.findUnique({
      where: { id_tipo_ausencia: id },
    });

    if (!fila) {
      throw new NotFoundException('El tipo de ausencia no existe');
    }

    return {
      id_tipo_ausencia: fila.id_tipo_ausencia,
      se_paga_sueldo_ti: fila.se_paga_sueldo_ti,
    };
  }

  /**
   * UPDATE - Permite cambiar el ID (PK) con verificación de colisión.
   */
  async update(
    idOriginal: string,
    dto: { id_tipo_ausencia: string; se_paga_sueldo_ti: boolean },
  ) {
    const existente = await this.prisma.tipo_ausencia.findUnique({
      where: { id_tipo_ausencia: idOriginal },
    });

    if (!existente) {
      throw new NotFoundException('El tipo de ausencia no existe');
    }

    // Si cambia el ID, verificar que el nuevo no exista ya
    if (idOriginal !== dto.id_tipo_ausencia) {
      const yaExiste = await this.existe(dto.id_tipo_ausencia);
      if (yaExiste) {
        throw new ConflictException(
          `Ya existe un tipo de ausencia con el ID "${dto.id_tipo_ausencia}"`,
        );
      }
    }

    return this.prisma.tipo_ausencia.update({
      where: { id_tipo_ausencia: idOriginal },
      data: {
        id_tipo_ausencia: dto.id_tipo_ausencia,
        se_paga_sueldo_ti: dto.se_paga_sueldo_ti,
      },
    });
  }

  /**
   * DELETE - Con manejo de FK (hay ausencias asociadas).
   */
  async remove(id: string): Promise<void> {
    const existente = await this.prisma.tipo_ausencia.findUnique({
      where: { id_tipo_ausencia: id },
    });

    if (!existente) {
      throw new NotFoundException('El tipo de ausencia no existe');
    }

    try {
      await this.prisma.tipo_ausencia.delete({
        where: { id_tipo_ausencia: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'No se puede eliminar: hay ausencias asociadas a este tipo',
          );
        }
      }
      throw new ConflictException(
        error instanceof Error
          ? error.message
          : 'Error al eliminar el tipo de ausencia',
      );
    }
  }

  /**
   * EXISTE - Verificación booleana simple.
   */
  async existe(id: string): Promise<boolean> {
    if (!id) return false;
    const fila = await this.prisma.tipo_ausencia.findUnique({
      where: { id_tipo_ausencia: id },
      select: { id_tipo_ausencia: true },
    });
    return !!fila;
  }
}