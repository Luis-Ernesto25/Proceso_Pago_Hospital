import { Module } from '@nestjs/common';
import { AusenciaService } from './ausencia.service';
import { AusenciaController } from './ausencia.controller';

@Module({
  controllers: [AusenciaController],
  providers: [AusenciaService],
})
export class AusenciaModule {}
