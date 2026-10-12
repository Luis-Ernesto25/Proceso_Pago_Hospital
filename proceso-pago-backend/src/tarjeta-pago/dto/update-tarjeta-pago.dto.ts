import { PartialType } from '@nestjs/mapped-types';
import { CreateTarjetaPagoDto } from './create-tarjeta-pago.dto';

export class UpdateTarjetaPagoDto extends PartialType(CreateTarjetaPagoDto) {}
