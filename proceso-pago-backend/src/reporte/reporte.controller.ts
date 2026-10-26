import {
  Controller,
  Get,
  Post,                    
  Body,                    
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { PdfService } from 'src/pdf/pdf.service';
import { MailService } from 'src/mail/mail.service';   
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('reporte')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReporteController {
  constructor(
    private readonly reporteService: ReporteService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService, 
  ) {}

  // ============================================================
  // HORAS - TODOS (JSON paginado, para el frontend)
  // ============================================================
  @Get('horas-todos')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  getHorasTodos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    this.validarFechas(fechaInicio, fechaFin);
    return this.reporteService.getReporteHorasTodos(
      fechaInicio, fechaFin, offset, limit, search,
    );
  }

  @Get('ausencias-todos')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  getAusenciasTodos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    this.validarFechas(fechaInicio, fechaFin);
    return this.reporteService.getReporteAusenciasTodos(
      fechaInicio, fechaFin, offset, limit, search,
    );
  }

  @Get('horas-empleado/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  getHorasEmpleado(
    @Param('idEm') idEm: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    this.validarFechas(fechaInicio, fechaFin);
    return this.reporteService.getReporteHorasEmpleado(
      idEm, fechaInicio, fechaFin, offset, limit,
    );
  }

  @Get('ausencias-empleado/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  getAusenciasEmpleado(
    @Param('idEm') idEm: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    this.validarFechas(fechaInicio, fechaFin);
    return this.reporteService.getReporteAusenciasEmpleado(
      idEm, fechaInicio, fechaFin, offset, limit,
    );
  }

  // ============================================================
  // 📄 PDF — HORAS - TODOS
  // ============================================================
  @Get('horas-todos/pdf')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  async getHorasTodosPdf(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('search') search?: string,
  ): Promise<StreamableFile> {
    this.validarFechas(fechaInicio, fechaFin);
    const { columnas, data } =
      await this.reporteService.getReporteHorasTodosCompleto(
        fechaInicio, fechaFin, search,
      );
    const pdfBuffer = await this.pdfService.generarTablaPdf(columnas, data, {
      titulo: this.tituloConRango('Reporte de Horas', fechaInicio, fechaFin, search),
    });
    return this.crearPdfStreamable(
      pdfBuffer,
      `reporte-horas-${fechaInicio}_${fechaFin}.pdf`,
    );
  }

  // ============================================================
  // 📄 PDF — AUSENCIAS - TODOS
  // ============================================================
  @Get('ausencias-todos/pdf')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  async getAusenciasTodosPdf(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('search') search?: string,
  ): Promise<StreamableFile> {
    this.validarFechas(fechaInicio, fechaFin);
    const { columnas, data } =
      await this.reporteService.getReporteAusenciasTodosCompleto(
        fechaInicio, fechaFin, search,
      );
    const pdfBuffer = await this.pdfService.generarTablaPdf(columnas, data, {
      titulo: this.tituloConRango('Reporte de Ausencias', fechaInicio, fechaFin, search),
    });
    return this.crearPdfStreamable(
      pdfBuffer,
      `reporte-ausencias-${fechaInicio}_${fechaFin}.pdf`,
    );
  }

  // ============================================================
  // 📄 PDF — HORAS - UN EMPLEADO
  // ============================================================
  @Get('horas-empleado/:idEm/pdf')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  async getHorasEmpleadoPdf(
    @Param('idEm') idEm: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<StreamableFile> {
    this.validarFechas(fechaInicio, fechaFin);
    const { columnas, data } =
      await this.reporteService.getReporteHorasEmpleadoCompleto(
        idEm, fechaInicio, fechaFin,
      );
    const pdfBuffer = await this.pdfService.generarTablaPdf(columnas, data, {
      titulo: this.tituloConRango(
        `Reporte de Horas — Empleado ${idEm}`,
        fechaInicio, fechaFin,
      ),
    });
    return this.crearPdfStreamable(
      pdfBuffer,
      `reporte-horas-empleado-${idEm}-${fechaInicio}_${fechaFin}.pdf`,
    );
  }

  // ============================================================
  // 📄 PDF — AUSENCIAS - UN EMPLEADO
  // ============================================================
  @Get('ausencias-empleado/:idEm/pdf')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  async getAusenciasEmpleadoPdf(
    @Param('idEm') idEm: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<StreamableFile> {
    this.validarFechas(fechaInicio, fechaFin);
    const { columnas, data } =
      await this.reporteService.getReporteAusenciasEmpleadoCompleto(
        idEm, fechaInicio, fechaFin,
      );
    const pdfBuffer = await this.pdfService.generarTablaPdf(columnas, data, {
      titulo: this.tituloConRango(
        `Reporte de Ausencias — Empleado ${idEm}`,
        fechaInicio, fechaFin,
      ),
    });
    return this.crearPdfStreamable(
      pdfBuffer,
      `reporte-ausencias-empleado-${idEm}-${fechaInicio}_${fechaFin}.pdf`,
    );
  }

  // ============================================================
  // 📧 EMAIL — HORAS + AUSENCIAS (2 PDFs en un correo)
  // POST /reporte/enviar-email
  // Body: { destinatario, fechaInicio, fechaFin }
  // ============================================================
  @Post('enviar-email')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  async enviarReportesPorEmail(
    @Body('destinatario') destinatario: string,
    @Body('fechaInicio') fechaInicio: string,
    @Body('fechaFin') fechaFin: string,
  ): Promise<{ ok: true; mensaje: string }> {
    this.validarFechas(fechaInicio, fechaFin);
    this.validarDestinatario(destinatario);

    const [horas, ausencias] = await Promise.all([
      this.reporteService.getReporteHorasTodosCompleto(fechaInicio, fechaFin),
      this.reporteService.getReporteAusenciasTodosCompleto(fechaInicio, fechaFin),
    ]);

    const [pdfHoras, pdfAusencias] = await Promise.all([
      this.pdfService.generarTablaPdf(horas.columnas, horas.data, {
        titulo: this.tituloConRango('Reporte de Horas', fechaInicio, fechaFin),
      }),
      this.pdfService.generarTablaPdf(ausencias.columnas, ausencias.data, {
        titulo: this.tituloConRango('Reporte de Ausencias', fechaInicio, fechaFin),
      }),
    ]);

    await this.mailService.enviarConPdf({
      destinatario,
      asunto: `Reporte de Horas y Ausencias (${fechaInicio} -> ${fechaFin})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2563eb;">Reportes del periodo</h2>
          <p>Adjuntamos los reportes solicitados para el periodo
             <strong>${fechaInicio}</strong> -> <strong>${fechaFin}</strong>:</p>
          <ul>
            <li><strong>Reporte de Horas</strong> — ${horas.data.length} filas</li>
            <li><strong>Balance de Ausencias</strong> — ${ausencias.data.length} filas</li>
          </ul>
          <p style="color: #888; font-size: 12px;">
            Correo generado automáticamente por el Sistema de Reportes.
          </p>
        </div>
      `,
      adjuntos: [
        {
          filename: `reporte-horas-${fechaInicio}_${fechaFin}.pdf`,
          content: pdfHoras,
        },
        {
          filename: `reporte-ausencias-${fechaInicio}_${fechaFin}.pdf`,
          content: pdfAusencias,
        },
      ],
    });

    return {
      ok: true,
      mensaje: `Correo con 2 PDFs enviado a ${destinatario}`,
    };
  }

  // ============================================================
  // Helpers privados
  // ============================================================
  private tituloConRango(
    base: string,
    fechaInicio: string,
    fechaFin: string,
    search?: string,
  ): string {
    const rango = `${fechaInicio} -> ${fechaFin}`;
    const filtro = search?.trim() ? ` | filtro ID: ${search.trim()}` : '';
    return `${base} (${rango})${filtro}`;
  }

  private crearPdfStreamable(buffer: Buffer, filename: string): StreamableFile {
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    });
  }

  private validarFechas(fechaInicio: string, fechaFin: string) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Debe enviar fechaInicio y fechaFin (formato YYYY-MM-DD)',
      );
    }
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(fechaInicio) || !re.test(fechaFin)) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la de inicio',
      );
    }
  }

  private validarDestinatario(email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException(
        'Debe enviar el campo "destinatario" (email)',
      );
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      throw new BadRequestException('Email de destinatario inválido');
    }
  }
}