import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma.service';

// ============================================================
// COLUMNAS (reutilizables para PDF y para el frontend)
// ============================================================
export const COLUMNAS_HORAS_TODOS = [
  'ID Empleado',
  'ID Ocupación',
  'Tipo Ocupación',
  '263 Días Feriados',
  '267 No Propios',
  '273 No Propios',
  'Horas Guardia (268, 269, 272)',
  '270 Horas Extras',
  '265 Para Choferes',
] as const;

export const COLUMNAS_HORAS_EMPLEADO = [
  'ID Empleado',
  'Tipo de Ocupación',
  'Ocupación',
  '263 Días Feriados',
  '267 No Propios',
  '273 No Propios',
  'Horas de Guardia (268, 269, 272)',
  '270 Horas Extras',
  '265 Para Choferes',
] as const;

export const COLUMNAS_AUSENCIAS = [
  'ID Empleado',
  'ID Ocupación',
  'Tipo Ocupación',
  'Horas AJ',
  'Horas AI',
  'Horas CM',
  'Horas R22',
  'Horas LSS',
  'Horas Pluri',
  'Horas LM',
  'Horas Vac',
  'Horas Guardia',
] as const;

@Injectable()
export class ReporteService {
  constructor(private prisma: PrismaService) { }

  // ============================================================
  // HELPERS
  // ============================================================
  private aEntero(valor: any): number {
    if (valor === null || valor === undefined) return 0;
    return Math.round(Number(valor));
  }

  private aDecimal(valor: any): number {
    if (valor === null || valor === undefined) return 0;
    return Math.round(Number(valor) * 100) / 100;
  }

  // ============================================================
  // REPORTE DE HORAS - TODOS (paginado, para el frontend)
  // ============================================================
  async getReporteHorasTodos(
    fechaInicio: string,
    fechaFin: string,
    offset: number,
    limit: number,
    search?: string,
  ): Promise<{ data: string[][]; total: number }> {
    const texto = search?.trim() ?? '';
    const idBuscado = texto !== '' ? Number(texto) : null;

    if (texto !== '' && (idBuscado === null || isNaN(idBuscado))) {
      return { data: [], total: 0 };
    }

    const [filas, totalRaw] = await Promise.all([
      idBuscado !== null
        ? this.prisma.$queryRaw<any[]>`
            SELECT * FROM (
              SELECT * FROM calculo_completo_todos_empleados(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
            LIMIT ${limit} OFFSET ${offset}
          `
        : this.prisma.$queryRaw<any[]>`
            SELECT * FROM calculo_completo_todos_empleados(
              ${fechaInicio}::date, ${fechaFin}::date
            )
            LIMIT ${limit} OFFSET ${offset}
          `,
      idBuscado !== null
        ? this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count FROM (
              SELECT * FROM calculo_completo_todos_empleados(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
          `
        : this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count
            FROM calculo_completo_todos_empleados(
              ${fechaInicio}::date, ${fechaFin}::date
            )
          `,
    ]);

    const total = Number(totalRaw[0]?.count ?? 0);

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.id_oc ?? f.ocupacion ?? ''), 
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.dias_feriados ?? f.horas_263 ?? f.c263)),
      String(this.aEntero(f.no_propios_267 ?? f.c267)),
      String(this.aEntero(f.no_propios_273 ?? f.c273)),
      String(this.aEntero(f.horas_guardia ?? f.c268_269_272)),
      String(this.aDecimal(f.horas_extras ?? f.c270)),
      String(this.aDecimal(f.para_choferes ?? f.c265)),
    ]);

    return { data, total };
  }

  // ============================================================
  // AUSENCIAS - TODOS (paginado, para el frontend)
  // ============================================================
  async getReporteAusenciasTodos(
    fechaInicio: string,
    fechaFin: string,
    offset: number,
    limit: number,
    search?: string,
  ): Promise<{ data: string[][]; total: number }> {
    const texto = search?.trim() ?? '';
    const idBuscado = texto !== '' ? Number(texto) : null;

    if (texto !== '' && (idBuscado === null || isNaN(idBuscado))) {
      return { data: [], total: 0 };
    }

    const [filas, totalRaw] = await Promise.all([
      idBuscado !== null
        ? this.prisma.$queryRaw<any[]>`
            SELECT * FROM (
              SELECT * FROM public.balance_de_ausencias(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
            LIMIT ${limit} OFFSET ${offset}
          `
        : this.prisma.$queryRaw<any[]>`
            SELECT * FROM public.balance_de_ausencias(
              ${fechaInicio}::date, ${fechaFin}::date
            )
            LIMIT ${limit} OFFSET ${offset}
          `,
      idBuscado !== null
        ? this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count FROM (
              SELECT * FROM public.balance_de_ausencias(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
          `
        : this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count
            FROM public.balance_de_ausencias(
              ${fechaInicio}::date, ${fechaFin}::date
            )
          `,
    ]);

    const total = Number(totalRaw[0]?.count ?? 0);

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.id_oc ?? ''),
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.horas_aj)),
      String(this.aEntero(f.horas_ai)),
      String(this.aEntero(f.horas_cm)),
      String(this.aEntero(f.horas_r22)),
      String(this.aEntero(f.horas_lss)),
      String(this.aEntero(f.horas_pluri)),
      String(this.aEntero(f.horas_lm)),
      String(this.aEntero(f.horas_vac)),
      String(this.aEntero(f.horas_guardia)),
    ]);

    return { data, total };
  }

  // ============================================================
  // REPORTE DE HORAS - UN EMPLEADO (paginado, para el frontend)
  // ============================================================
  async getReporteHorasEmpleado(
    idEm: string,
    fechaInicio: string,
    fechaFin: string,
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const [filas, totalRaw] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM reporte_temporal(
          ${id}::integer,
          ${fechaInicio}::date,
          ${fechaFin}::date
        )
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM reporte_temporal(
          ${id}::integer,
          ${fechaInicio}::date,
          ${fechaFin}::date
        )
      `,
    ]);

    const total = Number(totalRaw[0]?.count ?? 0);

    const data: string[][] = filas.map((f) => [
      String(f['ID Empleado'] ?? f.id_em ?? ''),
      String(f['Tipo de Ocupacion'] ?? f.tipo_ocupacion ?? ''),
      String(f['Ocupacion'] ?? f.ocupacion ?? f.id_oc ?? ''),
      String(this.aEntero(f['263 Dias feriados'])),
      String(this.aEntero(f['267 No Propios'])),
      String(this.aEntero(f['273 No Propios'])),
      String(this.aEntero(f['Horas de Guardia (268, 269, 272)'])),
      String(this.aDecimal(f['270 Horas Extras'])),
      String(this.aDecimal(f['265 Para Choferes'])),
    ]);

    return { data, total };
  }

  // ============================================================
  // REPORTE DE AUSENCIAS - UN EMPLEADO (paginado, para el frontend)
  // ============================================================
  async getReporteAusenciasEmpleado(
    idEm: string,
    fechaInicio: string,
    fechaFin: string,
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const [filas, totalRaw] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM public.balance_de_ausencias_empleado(
          ${id}::integer,
          ${fechaInicio}::date,
          ${fechaFin}::date
        )
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM public.balance_de_ausencias_empleado(
          ${id}::integer,
          ${fechaInicio}::date,
          ${fechaFin}::date
        )
      `,
    ]);

    const total = Number(totalRaw[0]?.count ?? 0);

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.ocupacion ?? ''),
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.horas_aj)),
      String(this.aEntero(f.horas_ai)),
      String(this.aEntero(f.horas_cm)),
      String(this.aEntero(f.horas_r22)),
      String(this.aEntero(f.horas_lss)),
      String(this.aEntero(f.horas_pluri)),
      String(this.aEntero(f.horas_lm)),
      String(this.aEntero(f.horas_vac)),
      String(this.aEntero(f.horas_guardia)),
    ]);

    return { data, total };
  }

  // ============================================================
  // VERSIONES "COMPLETAS" — SIN PAGINACIÓN — PARA GENERAR PDF
  // ============================================================

  /**
   * Reporte de horas de TODOS los empleados, sin paginación.
   * Devuelve columnas + todas las filas → listo para PdfService.
   */
  async getReporteHorasTodosCompleto(
    fechaInicio: string,
    fechaFin: string,
    search?: string,
  ): Promise<{ columnas: string[]; data: string[][] }> {
    const texto = search?.trim() ?? '';
    const idBuscado = texto !== '' ? Number(texto) : null;

    if (texto !== '' && (idBuscado === null || isNaN(idBuscado))) {
      return { columnas: [...COLUMNAS_HORAS_TODOS], data: [] };
    }

    const filas =
      idBuscado !== null
        ? await this.prisma.$queryRaw<any[]>`
            SELECT * FROM (
              SELECT * FROM calculo_completo_todos_empleados(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
          `
        : await this.prisma.$queryRaw<any[]>`
            SELECT * FROM calculo_completo_todos_empleados(
              ${fechaInicio}::date, ${fechaFin}::date
            )
          `;
    console.log(filas)

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.id_oc ?? f.ocupacion ?? ''), 
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.dias_feriados ?? f.horas_263 ?? f.c263)),
      String(this.aEntero(f.no_propios_267 ?? f.c267)),
      String(this.aEntero(f.no_propios_273 ?? f.c273)),
      String(this.aEntero(f.horas_guardia ?? f.c268_269_272)),
      String(this.aDecimal(f.horas_extras ?? f.c270)),
      String(this.aDecimal(f.para_choferes ?? f.c265)),
    ]);

    return { columnas: [...COLUMNAS_HORAS_TODOS], data };
  }

  /**
   * Reporte de ausencias de TODOS los empleados, sin paginación.
   */
  async getReporteAusenciasTodosCompleto(
    fechaInicio: string,
    fechaFin: string,
    search?: string,
  ): Promise<{ columnas: string[]; data: string[][] }> {
    const texto = search?.trim() ?? '';
    const idBuscado = texto !== '' ? Number(texto) : null;

    if (texto !== '' && (idBuscado === null || isNaN(idBuscado))) {
      return { columnas: [...COLUMNAS_AUSENCIAS], data: [] };
    }

    const filas =
      idBuscado !== null
        ? await this.prisma.$queryRaw<any[]>`
            SELECT * FROM (
              SELECT * FROM public.balance_de_ausencias(
                ${fechaInicio}::date, ${fechaFin}::date
              )
            ) AS sub
            WHERE sub.id_em = ${idBuscado}::integer
          `
        : await this.prisma.$queryRaw<any[]>`
            SELECT * FROM public.balance_de_ausencias(
              ${fechaInicio}::date, ${fechaFin}::date
            )
          `;

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.id_oc ?? f.ocupacion ?? ''), 
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.horas_aj)),
      String(this.aEntero(f.horas_ai)),
      String(this.aEntero(f.horas_cm)),
      String(this.aEntero(f.horas_r22)),
      String(this.aEntero(f.horas_lss)),
      String(this.aEntero(f.horas_pluri)),
      String(this.aEntero(f.horas_lm)),
      String(this.aEntero(f.horas_vac)),
      String(this.aEntero(f.horas_guardia)),
    ]);

    return { columnas: [...COLUMNAS_AUSENCIAS], data };
  }

  /**
   * Reporte de horas de UN empleado, sin paginación.
   */
  async getReporteHorasEmpleadoCompleto(
    idEm: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{ columnas: string[]; data: string[][] }> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const filas = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM reporte_temporal(
        ${id}::integer,
        ${fechaInicio}::date,
        ${fechaFin}::date
      )
    `;

    const data: string[][] = filas.map((f) => [
      String(f['ID Empleado'] ?? f.id_em ?? ''),
      String(f['Tipo de Ocupacion'] ?? f.tipo_ocupacion ?? ''),
      String(f['Ocupacion'] ?? f.ocupacion ?? f.id_oc ?? ''),
      String(this.aEntero(f['263 Dias feriados'])),
      String(this.aEntero(f['267 No Propios'])),
      String(this.aEntero(f['273 No Propios'])),
      String(this.aEntero(f['Horas de Guardia (268, 269, 272)'])),
      String(this.aDecimal(f['270 Horas Extras'])),
      String(this.aDecimal(f['265 Para Choferes'])),
    ]);

    return { columnas: [...COLUMNAS_HORAS_EMPLEADO], data };
  }

  /**
   * Reporte de ausencias de UN empleado, sin paginación.
   */
  async getReporteAusenciasEmpleadoCompleto(
    idEm: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{ columnas: string[]; data: string[][] }> {
    const id = Number(idEm);
    if (isNaN(id)) {
      throw new NotFoundException('ID de empleado inválido');
    }

    const filas = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM public.balance_de_ausencias_empleado(
        ${id}::integer,
        ${fechaInicio}::date,
        ${fechaFin}::date
      )
    `;

    const data: string[][] = filas.map((f) => [
      String(f.id_em ?? ''),
      String(f.id_oc ?? ''),
      String(f.tipo_ocupacion ?? ''),
      String(this.aEntero(f.horas_aj)),
      String(this.aEntero(f.horas_ai)),
      String(this.aEntero(f.horas_cm)),
      String(this.aEntero(f.horas_r22)),
      String(this.aEntero(f.horas_lss)),
      String(this.aEntero(f.horas_pluri)),
      String(this.aEntero(f.horas_lm)),
      String(this.aEntero(f.horas_vac)),
      String(this.aEntero(f.horas_guardia)),
    ]);

    return { columnas: [...COLUMNAS_AUSENCIAS], data };
  }
}