import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TarjetaPagoService } from './tarjeta-pago.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tarjeta-pago')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TarjetaPagoController {
  constructor(private readonly tarjetaPagoService: TarjetaPagoService) { }

  @Post()
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  create(
    @Body()
    dto: {
      id_em: string;
      fecha_entrada: string;
      fecha_salida: string;
      hora_entrada: string;
      hora_salida: string;
    },
  ) {
    return this.tarjetaPagoService.create(dto);
  }

  @Get()
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  findAll(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.tarjetaPagoService.findAll(offset, limit);
  }

  // ⚠️ Rutas específicas ANTES de las paramétricas

  @Get('existe/:idEm/:fechaEntrada')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  async existe(
    @Param('idEm') idEm: string,
    @Param('fechaEntrada') fechaEntrada: string,
  ) {
    const existe = await this.tarjetaPagoService.existe(idEm, fechaEntrada);
    return { existe };
  }

  @Get('detalle/:idEm/:fechaEntrada')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findDetalle(
    @Param('idEm') idEm: string,
    @Param('fechaEntrada') fechaEntrada: string,
  ) {
    return this.tarjetaPagoService.findDetalle(idEm, fechaEntrada);
  }

  @Get('basico/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  findOne(@Param('idEm') idEm: string) {
    return this.tarjetaPagoService.findOne(idEm);
  }

  @Put(':idEm/:fechaEntrada')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  update(
    @Param('idEm') idEm: string,
    @Param('fechaEntrada') fechaEntrada: string,
    @Body()
    dto: {
      fecha_salida: string;
      hora_entrada: string;
      hora_salida: string;
    },
  ) {
    return this.tarjetaPagoService.update(idEm, fechaEntrada, dto);
  }

  @Delete(':idEm/:fechaEntrada')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('idEm') idEm: string,
    @Param('fechaEntrada') fechaEntrada: string,
  ) {
    return this.tarjetaPagoService.remove(idEm, fechaEntrada);
  }

  @Get('por-mes/:idEm')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin', 'Contador')
  findAllByMonth(
    @Param('idEm', ParseIntPipe) idEm: number,
    @Query('fecha') fecha: string,       // "2026-09-15" o "2026-09"
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    
    const partes = fecha.split('-').map(Number);
    const fechaDate = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2] ?? 1));
    return this.tarjetaPagoService.findAllByMonthAndId(
      fechaDate,
      idEm,
      offset,
      limit,
    );
  }
}