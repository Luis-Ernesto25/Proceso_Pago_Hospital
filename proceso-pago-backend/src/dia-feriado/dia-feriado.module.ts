import { Module } from '@nestjs/common';
import { DiaFeriadoService } from './dia-feriado.service';
import { DiaFeriadoController } from './dia-feriado.controller';

@Module({
  controllers: [DiaFeriadoController],
  providers: [DiaFeriadoService],
})
export class DiaFeriadoModule {}
