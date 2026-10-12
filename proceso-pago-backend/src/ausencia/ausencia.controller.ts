import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AusenciaService } from './ausencia.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('ausencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AusenciaController {
  constructor(private readonly ausenciaService: AusenciaService) { }

  @Post()
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  create(
    @Body()
    dto: {
      id_em: string;
      id_tipo_ausencia: string;
      fecha_inicio: string;
      fecha_fin: string;
    },
  ) {
    return this.ausenciaService.create(dto);
  }

  @Get()
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findAll(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.ausenciaService.findAll(offset, limit);
  }

  // ⚠️ Rutas específicas ANTES de las paramétricas

  @Get('existe-rango/:idEm/:inicio/:fin')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  async existeRango(
    @Param('idEm') idEm: string,
    @Param('inicio') inicio: string,
    @Param('fin') fin: string,
  ) {
    const existe = await this.ausenciaService.existeEnRango(idEm, inicio, fin);
    return { existe };
  }

  @Get('existe/:idEm/:idTipo/:inicio/:fin')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  async existe(
    @Param('idEm') idEm: string,
    @Param('idTipo') idTipo: string,
    @Param('inicio') inicio: string,
    @Param('fin') fin: string,
  ) {
    const existe = await this.ausenciaService.existe(idEm, idTipo, inicio, fin);
    return { existe };
  }

  @Get('detalle/:idEm/:fechaInicio')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findDetalle(
    @Param('idEm') idEm: string,
    @Param('fechaInicio') fechaInicio: string,
  ) {
    return this.ausenciaService.findDetalle(idEm, fechaInicio);
  }

  @Get('basico/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findOne(@Param('idEm') idEm: string) {
    return this.ausenciaService.findOne(idEm);
  }

  @Put(':idEm/:fechaInicio')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  update(
    @Param('idEm') idEm: string,
    @Param('fechaInicio') fechaInicio: string,
    @Body()
    dto: {
      id_tipo_ausencia: string;
      fecha_inicio: string;
      fecha_fin: string;
    },
  ) {
    return this.ausenciaService.update(idEm, fechaInicio, dto);
  }

  @Get('por-mes/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findAllByMonth(
    @Param('idEm', ParseIntPipe) idEm: number,
    @Query('fecha') fecha: string,        // "YYYY-MM"
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    const [anio, mes] = fecha.split('-').map(Number);
    const fechaDate = new Date(Date.UTC(anio, mes - 1, 1));
    return this.ausenciaService.findAllByMonthAndId(
      fechaDate,
      idEm,
      offset,
      limit,
    );
  }
  
  @Delete(':idEm/:fechaInicio')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('idEm') idEm: string,
    @Param('fechaInicio') fechaInicio: string,
  ) {
    return this.ausenciaService.remove(idEm, fechaInicio);
  }


}