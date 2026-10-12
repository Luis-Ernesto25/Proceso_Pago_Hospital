import { PartialType } from '@nestjs/mapped-types';
import { CreateAusenciaDto } from './create-ausencia.dto';

export class UpdateAusenciaDto extends PartialType(CreateAusenciaDto) {}
