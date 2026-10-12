import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadoCompleto } from './dto/Empleado.dto';

@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) { }

  @Post()
  async create(@Body() empleado: EmpleadoCompleto) {
    try {
      const success = await this.empleadoService.create(empleado);

      return {
        success: true,
        message: 'Empleado creado exitosamente'
      };
    } catch (error) {
      // Devolver SIEMPRE el mismo formato de error
      throw new HttpException(
        error.message || 'Error al crear empleado',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  findAll(@Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.empleadoService.findAll(offset, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoService.findOne(Number(id));
  }
    @Get('/basico/:idEmployee')
  findOneEmployee(@Param('idEmployee') id: string) {
    return this.empleadoService.findOneEmployee(Number(id));
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmpleadoDto: EmpleadoCompleto) {
    return this.empleadoService.update(id, updateEmpleadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.remove(+id);
  }
}
