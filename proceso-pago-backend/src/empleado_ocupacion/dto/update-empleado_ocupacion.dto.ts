import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoOcupacionDto } from './create-empleado_ocupacion.dto';

export class UpdateEmpleadoOcupacionDto extends PartialType(CreateEmpleadoOcupacionDto) {}
