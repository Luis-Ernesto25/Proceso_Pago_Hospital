import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AusenciaService {
  constructor(private prisma: PrismaService) { }

  /**
   * Calcula los días entre dos fechas (inclusive).
   * Ej: 15 → 15 = 1 día. 15 → 20 = 6 días.
   */
  private calcularDias(inicio: Date, fin: Date): number {
    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    const diff = fin.getTime() - inicio.getTime();
    return Math.floor(diff / MS_POR_DIA) + 1;
  }

  /**
   * Formatea una fecha a "dd/MM/yyyy".
   */
  private formatearFecha(valor: any): string {
    if (!valor) return '';
    const d = new Date(valor);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${day}/${m}/${y}`;
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: {
    id_em: string;
    id_tipo_ausencia: string;
    fecha_inicio: string;
    fecha_fin: string;
  }) {
    const idEm = Number(dto.id_em);
    if (isNaN(idEm)) {
      throw new ConflictException('El ID del empleado debe ser numérico');
    }

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (fin < inicio) {
      throw new ConflictException(
        'La fecha de fin no puede ser anterior a la de inicio',
      );
    }

    // Verificar solapamiento
    const solapa = await this.prisma.ausencia.findFirst({
      where: {
        id_em: idEm,
        AND: [
          { fecha_inicio_au: { lte: fin } },
          { fecha_fin_au: { gte: inicio } },
        ],
      },
    });

    if (solapa) {
      throw new ConflictException(
        'Ya existe una ausencia para el empleado que se solapa con el rango indicado',
      );
    }

    const dias = this.calcularDias(inicio, fin);

    return this.prisma.ausencia.create({
      data: {
        id_em: idEm,
        id_tipo_ausencia: dto.id_tipo_ausencia,
        fecha_inicio_au: inicio,
        fecha_fin_au: fin,
        dias_au: dias,
      },
    });
  }

  // ============================================================
  // READ - Paginado
  // ============================================================
  async findAll(
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const [filas, total] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT
          a.id_em,
          e.nombre_em,
          e.apellido1_em,
          a.id_tipo_ausencia,
          a.fecha_inicio_au,
          a.fecha_fin_au,
          a.dias_au
        FROM ausencia a
        JOIN empleado e ON e.id_em = a.id_em
        ORDER BY a.fecha_inicio_au DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.prisma.ausencia.count(),
    ]);

    const data = filas.map((f) => [
      String(f.id_em),
      `${f.nombre_em} ${f.apellido1_em}`.trim(),
      f.id_tipo_ausencia,
      this.formatearFecha(f.fecha_inicio_au),
      this.formatearFecha(f.fecha_fin_au),
      String(f.dias_au),
    ]);

    return { data, total };
  }

  // ============================================================
  // READ - Básico (una fila string[] para la búsqueda)
  // ============================================================
  async findOne(idEm: string): Promise<string[]> {
    const id = Number(idEm);
    if (isNaN(id)) return [];

    const fila = await this.prisma.$queryRaw<any[]>`
      SELECT
        a.id_em,
        e.nombre_em,
        e.apellido1_em,
        a.id_tipo_ausencia,
        a.fecha_inicio_au,
        a.fecha_fin_au,
        a.dias_au
      FROM ausencia a
      JOIN empleado e ON e.id_em = a.id_em
      WHERE a.id_em = ${id}::integer
      ORDER BY a.fecha_inicio_au DESC
      LIMIT 1
    `;

    if (!fila || fila.length === 0) return [];

    const f = fila[0];
    return [
      String(f.id_em),
      `${f.nombre_em} ${f.apellido1_em}`.trim(),
      f.id_tipo_ausencia,
      this.formatearFecha(f.fecha_inicio_au),
      this.formatearFecha(f.fecha_fin_au),
      String(f.dias_au),
    ];
  }

  // ============================================================
  // READ - Detalle (para editar)
  // ============================================================
  async findDetalle(idEm: string, fechaInicio: string) {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const fecha = new Date(fechaInicio);

    const ausencia = await this.prisma.ausencia.findUnique({
      where: {
        id_em_fecha_inicio_au: {
          id_em: id,
          fecha_inicio_au: fecha,
        },
      },
    });

    if (!ausencia) {
      throw new NotFoundException('La ausencia no existe');
    }

    return {
      id_em: ausencia.id_em,
      id_tipo_ausencia: ausencia.id_tipo_ausencia,
      fecha_inicio: ausencia.fecha_inicio_au.toISOString().split('T')[0],
      fecha_fin: ausencia.fecha_fin_au.toISOString().split('T')[0],
      dias_au: ausencia.dias_au,
    };
  }

  // ============================================================
  // VERIFICACIONES
  // ============================================================
  async existeEnRango(
    idEm: string,
    inicio: string,
    fin: string,
  ): Promise<boolean> {
    const id = Number(idEm);
    if (isNaN(id)) return false;

    const i = new Date(inicio);
    const f = new Date(fin);

    const fila = await this.prisma.ausencia.findFirst({
      where: {
        id_em: id,
        AND: [
          { fecha_inicio_au: { lte: f } },
          { fecha_fin_au: { gte: i } },
        ],
      },
    });

    return fila !== null;
  }

  async existe(
    idEm: string,
    idTipo: string,
    inicio: string,
    fin: string,
  ): Promise<boolean> {
    const id = Number(idEm);
    if (isNaN(id)) return false;

    const fila = await this.prisma.ausencia.findFirst({
      where: {
        id_em: id,
        id_tipo_ausencia: idTipo,
        fecha_inicio_au: new Date(inicio),
        fecha_fin_au: new Date(fin),
      },
    });

    return fila !== null;
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(
    idEm: string,
    fechaInicioOriginal: string,
    dto: {
      id_tipo_ausencia: string;
      fecha_inicio: string;
      fecha_fin: string;
    },
  ) {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new ConflictException('El ID del empleado debe ser numérico');
    }

    const inicioOriginal = new Date(fechaInicioOriginal);
    const nuevoInicio = new Date(dto.fecha_inicio);
    const nuevoFin = new Date(dto.fecha_fin);

    if (nuevoFin < nuevoInicio) {
      throw new ConflictException(
        'La fecha de fin no puede ser anterior a la de inicio',
      );
    }

    // Verificar que existe
    const existente = await this.prisma.ausencia.findFirst({
      where: { id_em: id, fecha_inicio_au: inicioOriginal },
    });

    if (!existente) {
      throw new NotFoundException('La ausencia no existe');
    }

    // Verificar solapamiento con OTRAS ausencias (excluir la actual)
    const solapa = await this.prisma.ausencia.findFirst({
      where: {
        id_em: id,
        NOT: { fecha_inicio_au: inicioOriginal },
        AND: [
          { fecha_inicio_au: { lte: nuevoFin } },
          { fecha_fin_au: { gte: nuevoInicio } },
        ],
      },
    });

    if (solapa) {
      throw new ConflictException(
        'Ya existe una ausencia para el empleado que se solapa con el nuevo rango',
      );
    }

    const dias = this.calcularDias(nuevoInicio, nuevoFin);

    // Como la PK incluye fecha_inicio, hay que borrar e insertar.
    // Lo envolvemos en una transacción para que sea atómico.
    return this.prisma.$transaction(async (tx) => {
      await tx.ausencia.delete({
        where: {
          id_em_fecha_inicio_au: {
            id_em: id,
            fecha_inicio_au: inicioOriginal,
          },
        },
      });

      return tx.ausencia.create({
        data: {
          id_em: id,
          id_tipo_ausencia: dto.id_tipo_ausencia,
          fecha_inicio_au: nuevoInicio,
          fecha_fin_au: nuevoFin,
          dias_au: dias,
        },
      });
    });
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(idEm: string, fechaInicio: string): Promise<void> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new ConflictException('El ID del empleado debe ser numérico');
    }

    const fecha = new Date(fechaInicio);

    try {
      await this.prisma.ausencia.delete({
        where: {
          id_em_fecha_inicio_au: {
            id_em: id,
            fecha_inicio_au: fecha,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('La ausencia no existe');
      }
      throw error;
    }
  }

  async findAllByMonthAndId(
    fecha: Date,
    idEm: number,
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    // Primer día del mes a las 00:00:00 UTC
    const inicioMes = new Date(
      Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1),
    );

    // Primer día del siguiente mes
    const inicioMesSiguiente = new Date(
      Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1),
    );

    const where = {
      id_em: idEm,
      fecha_inicio_au: {
        gte: inicioMes,
        lt: inicioMesSiguiente,
      },
    };

    const [filas, total] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
      SELECT
        a.id_em,
        e.nombre_em,
        e.apellido1_em,
        a.id_tipo_ausencia,
        a.fecha_inicio_au,
        a.fecha_fin_au,
        a.dias_au
      FROM ausencia a
      JOIN empleado e ON e.id_em = a.id_em
      WHERE a.id_em = ${idEm}::integer
        AND a.fecha_inicio_au >= ${inicioMes}::date
        AND a.fecha_inicio_au <  ${inicioMesSiguiente}::date
      ORDER BY a.fecha_inicio_au ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
      this.prisma.ausencia.count({ where }),
    ]);

    const data: string[][] = filas.map((f) => [
      String(f.id_em),
      `${f.nombre_em} ${f.apellido1_em}`.trim(),
      f.id_tipo_ausencia,
      this.formatearFecha(f.fecha_inicio_au),
      this.formatearFecha(f.fecha_fin_au),
      String(f.dias_au),
    ]);

    return { data, total };
  }
}