import { Controller, Get, Post, Body, Patch, Param, Query, Delete, ConflictException} from '@nestjs/common';
import { BonoService } from './bono.service';
import { CreateBonoDto } from './dto/create-bono.dto';
import { UpdateBonoDto } from './dto/update-bono.dto';
import { Bono } from './dto/Bono';

@Controller('bono')
export class BonoController {
  constructor(private readonly bonoService: BonoService) { }

  @Post()
  create(@Body() createBono: Bono) {
    return this.bonoService.create(createBono);
  }

  @Get()
  findAll(@Query('offset')offset:string, @Query('limit')limit:string) {
    return this.bonoService.findAll(Number(offset), Number(limit));
  }

  @Get('ids')
  findAllId() {
    return this.bonoService.findAllId();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() bono: Bono): Promise<Bono> {
    //console.log("en el Controller"); 
    return this.bonoService.update(id, bono);
  }


@Delete(':id')
async delete(@Param('id') id: string) {
  const eliminado = await this.bonoService.delete(id);

  if (!eliminado) {
    throw new ConflictException(
      'No se puede eliminar el bono: tiene empleados asociados o no existe'
    );
  }

  return { message: 'Bono eliminado correctamente' };
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bonoService.findOne(id);
  }

}
