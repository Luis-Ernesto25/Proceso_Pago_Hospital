import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('reporte')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

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

  // GET /reporte/horas-empleado/:idEm?fechaInicio=...&fechaFin=...&offset=0&limit=16
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
      idEm,
      fechaInicio,
      fechaFin,
      offset,
      limit,
    );
  }

  // GET /reporte/ausencias-empleado/:idEm?fechaInicio=...&fechaFin=...&offset=0&limit=16
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
      idEm,
      fechaInicio,
      fechaFin,
      offset,
      limit,
    );
  }

  // ============================================================
  // Validaciones comunes
  // ============================================================
  private validarFechas(fechaInicio: string, fechaFin: string) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Debe enviar fechaInicio y fechaFin (formato YYYY-MM-DD)',
      );
    }
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(fechaInicio) || !re.test(fechaFin)) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la de inicio',
      );
    }
  }
}