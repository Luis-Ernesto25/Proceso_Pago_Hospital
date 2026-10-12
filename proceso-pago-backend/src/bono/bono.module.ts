import { Global, Module } from '@nestjs/common';
import { BonoService } from './bono.service';
import { BonoController } from './bono.controller';

@Module({
  controllers: [BonoController],
  providers: [BonoService],
})
export class BonoModule {}
