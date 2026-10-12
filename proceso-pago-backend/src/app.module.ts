import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma-service/prisma.module';
import { BonoModule } from './bono/bono.module';
import { OcupacionModule } from './ocupacion/ocupacion.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { EmpleadoOcupacionModule } from './empleado_ocupacion/empleado_ocupacion.module';
import { EmpleadoBonoModule } from './empleado_bono/empleado_bono.module';
import { DiaFeriadoModule } from './dia-feriado/dia-feriado.module';
import { TarjetaPagoModule } from './tarjeta-pago/tarjeta-pago.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AusenciaModule } from './ausencia/ausencia.module';
import { TipoAusenciaModule } from './tipo-ausencia/tipo-ausencia.module';
import { ReporteModule } from './reporte/reporte.module';
@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),PrismaModule, BonoModule, OcupacionModule, EmpleadoModule, EmpleadoOcupacionModule, EmpleadoBonoModule, DiaFeriadoModule, TarjetaPagoModule, AuthModule, TipoAusenciaModule, AusenciaModule, ReporteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
