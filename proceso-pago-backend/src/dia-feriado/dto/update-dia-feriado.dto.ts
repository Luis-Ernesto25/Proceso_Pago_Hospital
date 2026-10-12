import { PartialType } from '@nestjs/mapped-types';
import { CreateDiaFeriadoDto } from './create-dia-feriado.dto';

export class UpdateDiaFeriadoDto extends PartialType(CreateDiaFeriadoDto) {}
