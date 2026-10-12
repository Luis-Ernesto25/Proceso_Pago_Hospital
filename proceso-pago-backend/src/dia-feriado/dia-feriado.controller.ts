import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiaFeriadoService } from './dia-feriado.service';
import { DiaFeriado } from './dto/dia-feriado.dto';

@Controller('dia-feriado')
export class DiaFeriadoController {
  constructor(private readonly diaFeriadoService: DiaFeriadoService) { }

  @Post()
  create(@Body() diaFeriado: DiaFeriado) {
    return this.diaFeriadoService.create(diaFeriado);
  }

  @Get()
  findAll() {
    return this.diaFeriadoService.findAll();
  }

  @Get(':fecha')
  findOne(@Param('fecha') fecha: string) {
    return this.diaFeriadoService.findOne(fecha);
  }

  @Put(':fecha')
  update(
    @Param('fecha') fecha: string,
    @Body() diaFeriado: DiaFeriado
  ) {
    return this.diaFeriadoService.update(fecha, diaFeriado);
  }

  @Delete(':fecha')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('fecha') fecha: string) {
    return this.diaFeriadoService.remove(fecha);
  }
}