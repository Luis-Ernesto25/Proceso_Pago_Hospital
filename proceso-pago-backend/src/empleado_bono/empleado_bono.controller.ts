import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmpleadoBonoService } from './empleado_bono.service';
import { CreateEmpleadoBonoDto } from './dto/create-empleado_bono.dto';
import { UpdateEmpleadoBonoDto } from './dto/update-empleado_bono.dto';

@Controller('empleado-bono')
export class EmpleadoBonoController {
  constructor(private readonly empleadoBonoService: EmpleadoBonoService) {}

  @Post()
  create(@Body() createEmpleadoBonoDto: CreateEmpleadoBonoDto) {
    return this.empleadoBonoService.create(createEmpleadoBonoDto);
  }

  @Get()
  findAll(@Query('offset')offset:string, @Query('limit')limit:string) {
    return this.empleadoBonoService.findAll(Number(offset), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoBonoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoBonoDto: UpdateEmpleadoBonoDto) {
    return this.empleadoBonoService.update(+id, updateEmpleadoBonoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoBonoService.remove(+id);
  }
}
