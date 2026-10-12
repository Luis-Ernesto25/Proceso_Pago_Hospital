import { Module } from '@nestjs/common';
import { TarjetaPagoService } from './tarjeta-pago.service';
import { TarjetaPagoController } from './tarjeta-pago.controller';

@Module({
  controllers: [TarjetaPagoController],
  providers: [TarjetaPagoService],
})
export class TarjetaPagoModule {}
