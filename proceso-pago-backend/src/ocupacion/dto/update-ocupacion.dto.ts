import { PartialType } from '@nestjs/mapped-types';
import { CreateOcupacionDto } from './create-ocupacion.dto';

export class UpdateOcupacionDto extends PartialType(CreateOcupacionDto) {}
