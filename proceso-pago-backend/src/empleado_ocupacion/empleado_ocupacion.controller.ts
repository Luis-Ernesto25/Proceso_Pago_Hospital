import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { EmpleadoOcupacionService } from './empleado_ocupacion.service';
import { CreateEmpleadoOcupacionDto } from './dto/create-empleado_ocupacion.dto';
import { UpdateEmpleadoOcupacionDto } from './dto/update-empleado_ocupacion.dto';

@Controller('empleado-ocupacion')
export class EmpleadoOcupacionController {
  constructor(private readonly empleadoOcupacionService: EmpleadoOcupacionService) { }

  @Post()
  create(@Body() createEmpleadoOcupacionDto: CreateEmpleadoOcupacionDto) {
    return this.empleadoOcupacionService.create(createEmpleadoOcupacionDto);
  }

  @Get()
  findAll(
    @Query('offset') offset: string,
    @Query('limit') limit: string
  ) {
    return this.empleadoOcupacionService.findAll(Number(offset), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoOcupacionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoOcupacionDto: UpdateEmpleadoOcupacionDto) {
    return this.empleadoOcupacionService.update(+id, updateEmpleadoOcupacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoOcupacionService.remove(+id);
  }
}
