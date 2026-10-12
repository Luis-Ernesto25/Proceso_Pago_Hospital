import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoAusenciaDto } from './create-tipo-ausencia.dto';

export class UpdateTipoAusenciaDto extends PartialType(CreateTipoAusenciaDto) {}
