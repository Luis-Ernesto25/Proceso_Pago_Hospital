import { Module } from '@nestjs/common';
import { TipoAusenciaService } from './tipo-ausencia.service';
import { TipoAusenciaController } from './tipo-ausencia.controller';

@Module({
  controllers: [TipoAusenciaController],
  providers: [TipoAusenciaService],
})
export class TipoAusenciaModule {}
