import { Module } from '@nestjs/common';
import { EmpleadoOcupacionService } from './empleado_ocupacion.service';
import { EmpleadoOcupacionController } from './empleado_ocupacion.controller';

@Module({
  controllers: [EmpleadoOcupacionController],
  providers: [EmpleadoOcupacionService],
})
export class EmpleadoOcupacionModule {}
