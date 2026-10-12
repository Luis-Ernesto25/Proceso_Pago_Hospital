import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';
import { Prisma } from 'generated/prisma';
import { TarjetaPago } from './dto/tarjeta-pago.dto';

@Injectable()
export class TarjetaPagoService {
  constructor(private prisma: PrismaService) { }

  private formatearFecha(valor: any): string {
    if (!valor) return '';
    const d = new Date(valor);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${day}/${m}/${y}`;
  }

  private formatearHora(valor: any): string {
    if (!valor) return '';
    const d = new Date(valor);
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // ============================================================
  // ============================================================
  async create(tarjeta: TarjetaPago): Promise<void> {
    const idEm = Number(tarjeta.id_em);
    if (isNaN(idEm)) {
      throw new ConflictException('El ID del empleado debe ser numérico');
    }

    const yaExiste = await this.existe(tarjeta.id_em, tarjeta.fecha_entrada);
    if (yaExiste) {
      throw new ConflictException(
        `Ya existe una tarjeta de pago para el empleado ${idEm} en la fecha ${tarjeta.fecha_entrada}`,
      );
    }

    try {
      await this.prisma.$executeRaw`
        SELECT insertar_tarjeta_pago(
          ${idEm}::integer,
          ${tarjeta.fecha_entrada}::date,
          ${tarjeta.fecha_salida}::date,
          ${tarjeta.hora_entrada}::time,
          ${tarjeta.hora_salida}::time
        )
      `;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mensajeOriginal =
          (error.meta?.message as string) || error.message || '';
        const limpio = mensajeOriginal
          .replace(/^ERROR:\s*/i, '')
          .split('\n')[0]
          .trim();
        throw new ConflictException(
          limpio || 'Error al insertar la tarjeta de pago',
        );
      }
      throw new ConflictException(
        error instanceof Error
          ? error.message
          : 'Error al insertar la tarjeta de pago',
      );
    }
  }

  // ============================================================
  // READ - Paginado
  // ============================================================
  async findAll(
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const [filas, totalRaw] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT
          tp.id_em,
          e.nombre_em,
          e.apellido1_em,
          e.apellido2_em,
          tp.fecha_entrada_ta,
          tp.fecha_salida_ta,
          tp.hora_entrada_ta,
          tp.hora_salida_ta
        FROM tarjeta_pago tp
        JOIN empleado e ON e.id_em = tp.id_em
        ORDER BY tp.fecha_entrada_ta DESC, tp.id_em ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM tarjeta_pago
      `,
    ]);

    const total = Number(totalRaw[0]?.count ?? 0);

    const data: string[][] = filas.map((f) => [
      String(f.id_em),
      `${f.nombre_em} ${f.apellido1_em} ${f.apellido2_em}`.trim(),
      this.formatearFecha(f.fecha_entrada_ta),
      this.formatearFecha(f.fecha_salida_ta),
      this.formatearHora(f.hora_entrada_ta),
      this.formatearHora(f.hora_salida_ta),
    ]);

    return { data, total };
  }

  // ============================================================
  // READ - Buscar por id (una fila)
  // ============================================================
  async findOne(idEm: string): Promise<string[]> {
    const id = Number(idEm);
    if (isNaN(id)) return [];

    const filas = await this.prisma.$queryRaw<any[]>`
      SELECT
        tp.id_em,
        e.nombre_em,
        e.apellido1_em,
        e.apellido2_em,
        tp.fecha_entrada_ta,
        tp.fecha_salida_ta,
        tp.hora_entrada_ta,
        tp.hora_salida_ta
      FROM tarjeta_pago tp
      JOIN empleado e ON e.id_em = tp.id_em
      WHERE tp.id_em = ${id}::integer
      ORDER BY tp.fecha_entrada_ta DESC
      LIMIT 1
    `;

    if (!filas || filas.length === 0) return [];

    const f = filas[0];
    return [
      String(f.id_em),
      `${f.nombre_em} ${f.apellido1_em} ${f.apellido2_em}`.trim(),
      this.formatearFecha(f.fecha_entrada_ta),
      this.formatearFecha(f.fecha_salida_ta),
      this.formatearHora(f.hora_entrada_ta),
      this.formatearHora(f.hora_salida_ta),
    ];
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

  // Primer día del siguiente mes a las 00:00:00 UTC
  const inicioMesSiguiente = new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1),
  );

  const where = {
    id_em: idEm,
    fecha_entrada_ta: {
      gte: inicioMes,
      lt: inicioMesSiguiente,
    },
  };

  // Traer página + total en paralelo
  const [filas, total] = await Promise.all([
    this.prisma.$queryRaw<any[]>`
      SELECT
        tp.id_em,
        e.nombre_em,
        e.apellido1_em,
        e.apellido2_em,
        tp.fecha_entrada_ta,
        tp.fecha_salida_ta,
        tp.hora_entrada_ta,
        tp.hora_salida_ta
      FROM tarjeta_pago tp
      JOIN empleado e ON e.id_em = tp.id_em
      WHERE tp.id_em = ${idEm}::integer
        AND tp.fecha_entrada_ta >= ${inicioMes}::date
        AND tp.fecha_entrada_ta <  ${inicioMesSiguiente}::date
      ORDER BY tp.fecha_entrada_ta ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    this.prisma.tarjeta_pago.count({ where }),
  ]);

  const data: string[][] = filas.map((f) => [
    String(f.id_em),
    `${f.nombre_em} ${f.apellido1_em} ${f.apellido2_em}`.trim(),
    this.formatearFecha(f.fecha_entrada_ta),
    this.formatearFecha(f.fecha_salida_ta),
    this.formatearHora(f.hora_entrada_ta),
    this.formatearHora(f.hora_salida_ta),
  ]);

  return { data, total };
}


  // ============================================================
  // READ - Detalle (para editar)
  // ============================================================
  async findDetalle(idEm: string, fechaEntrada: string) {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const fecha = new Date(fechaEntrada);

    const fila = await this.prisma.tarjeta_pago.findUnique({
      where: {
        id_em_fecha_entrada_ta: {
          id_em: id,
          fecha_entrada_ta: fecha,
        },
      },
    });

    if (!fila) {
      throw new NotFoundException('La tarjeta de pago no existe');
    }

    return {
      id_em: String(fila.id_em),
      fecha_entrada: fila.fecha_entrada_ta.toISOString().split('T')[0],
      fecha_salida: fila.fecha_salida_ta.toISOString().split('T')[0],
      hora_entrada: this.formatearHora(fila.hora_entrada_ta),
      hora_salida: this.formatearHora(fila.hora_salida_ta),
    };
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(
    idEm: string,
    fechaEntradaOriginal: string,
    dto: {
      fecha_salida: string;
      hora_entrada: string;
      hora_salida: string;
    },
  ) {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new ConflictException('El ID del empleado debe ser numérico');
    }

    const fechaEntrada = new Date(fechaEntradaOriginal);
    const fechaSalida = new Date(dto.fecha_salida);

    // Verificar que existe
    const existente = await this.prisma.tarjeta_pago.findUnique({
      where: {
        id_em_fecha_entrada_ta: {
          id_em: id,
          fecha_entrada_ta: fechaEntrada,
        },
      },
    });

    if (!existente) {
      throw new NotFoundException('La tarjeta de pago no existe');
    }

    if (fechaSalida < fechaEntrada) {
      throw new ConflictException(
        'La fecha de salida no puede ser anterior a la de entrada',
      );
    }

    // Como fecha_entrada_ta es PK, solo actualizamos los otros campos
    return this.prisma.tarjeta_pago.update({
      where: {
        id_em_fecha_entrada_ta: {
          id_em: id,
          fecha_entrada_ta: fechaEntrada,
        },
      },
      data: {
        fecha_salida_ta: fechaSalida,
        hora_entrada_ta: new Date(`1970-01-01T${dto.hora_entrada}:00Z`),
        hora_salida_ta: new Date(`1970-01-01T${dto.hora_salida}:00Z`),
      },
    });
  }

  // ============================================================
  // ============================================================
  async remove(idEm: string, fechaEntrada: string): Promise<void> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const resultado = await this.prisma.$executeRaw`
      DELETE FROM tarjeta_pago
      WHERE id_em = ${id}::integer
        AND fecha_entrada_ta = ${fechaEntrada}::date
    `;

    if (resultado === 0) {
      throw new NotFoundException('La tarjeta de pago no existe');
    }
  }

  // ============================================================
  // ============================================================
  async existe(idEm: string, fechaEntrada: string): Promise<boolean> {
    const id = Number(idEm);
    if (isNaN(id)) return false;

    const filas = await this.prisma.$queryRaw<any[]>`
      SELECT 1 FROM tarjeta_pago
      WHERE id_em = ${id}::integer
        AND fecha_entrada_ta = ${fechaEntrada}::date
      LIMIT 1
    `;

    return filas.length > 0;
  }
}