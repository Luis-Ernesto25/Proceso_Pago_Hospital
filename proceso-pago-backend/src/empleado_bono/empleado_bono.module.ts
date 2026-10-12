import { Module } from '@nestjs/common';
import { EmpleadoBonoService } from './empleado_bono.service';
import { EmpleadoBonoController } from './empleado_bono.controller';

@Module({
  controllers: [EmpleadoBonoController],
  providers: [EmpleadoBonoService],
})
export class EmpleadoBonoModule {}
