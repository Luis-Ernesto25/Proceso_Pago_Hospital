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
import { TipoAusenciaService } from './tipo-ausencia.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tipo-ausencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoAusenciaController {
  constructor(private readonly tipoAusenciaService: TipoAusenciaService) {}

  // ============================================================
  // === ENDPOINTS EXISTENTES (NO MODIFICAR) ===================
  // ============================================================

  @Get()
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findAll() {
    return this.tipoAusenciaService.findAll();
  }

  @Get('completos')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findAllCompletos() {
    return this.tipoAusenciaService.findAllCompletos();
  }

  // ⚠️ Nuevos endpoints específicos DEBEN ir antes que ':id'
  // ============================================================
  // === ENDPOINTS NUEVOS ======================================
  // ============================================================

  @Get('paginado')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findPaginado(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.tipoAusenciaService.findPaginado(offset, limit);
  }

  @Get('existe/:id')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  async existe(@Param('id') id: string) {
    const existe = await this.tipoAusenciaService.existe(id);
    return { existe };
  }

  @Get('detalle/:id')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findDetalle(@Param('id') id: string) {
    return this.tipoAusenciaService.findDetalle(id);
  }

  // ============================================================
  // === RUTA PARAMÉTRICA (debe ir DESPUÉS de las específicas) =
  // ============================================================

  @Get(':id')
  @Roles('Admin', 'Tecnico_RH', 'SuperAdmin')
  findOne(@Param('id') id: string) {
    return this.tipoAusenciaService.findOne(id);
  }

  // ============================================================
  // === MUTACIONES ============================================
  // ============================================================

  @Post()
  @Roles('Admin', 'SuperAdmin', 'Tecnico_RH')
  create(
    @Body() dto: { id_tipo_ausencia: string; se_paga_sueldo_ti: boolean },
  ) {
    return this.tipoAusenciaService.create(dto);
  }

  @Put(':id')
  @Roles('Admin', 'SuperAdmin', 'Tecnico_RH')
  update(
    @Param('id') id: string,
    @Body() dto: { id_tipo_ausencia: string; se_paga_sueldo_ti: boolean },
  ) {
    return this.tipoAusenciaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'SuperAdmin', 'Tecnico_RH')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tipoAusenciaService.remove(id);
  }
}