import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OcupacionService } from './ocupacion.service';
import { Ocupacion } from './dto/ocupacion.dto';

@Controller('ocupacion')
export class OcupacionController {
  constructor(private readonly ocupacionService: OcupacionService) {}

  @Post()
  create(@Body() ocupacion: Ocupacion) {
    return this.ocupacionService.create(ocupacion);
  }

  // Lista paginada (la que usa la tabla)
  @Get()
  findAll(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.ocupacionService.findAll(offset, limit);
  }

  // Lista completa sin paginar
  @Get('todas')
  findAllCompleto() {
    return this.ocupacionService.findAllCompleto();
  }

  // ⚠️ Rutas específicas ANTES de :id
  @Get('basico/:idOc')
  findOneEmployee(@Param('idOc') idOc: string) {
    return this.ocupacionService.findOneEmployee(idOc);
  }

  @Get('propias')
  findAllPropias() {
    return this.ocupacionService.findAllPropias();
  }

  @Get('no-propias')
  findAllNoPropias() {
    return this.ocupacionService.findAllNoPropias();
  }

  @Get('existe/:id')
  async existe(@Param('id') id: string) {
    const existe = await this.ocupacionService.existe(id);
    return { existe };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocupacionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() ocupacion: Ocupacion) {
    return this.ocupacionService.update(id, ocupacion);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ocupacionService.remove(id);
  }
}