import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoBonoDto } from './create-empleado_bono.dto';

export class UpdateEmpleadoBonoDto extends PartialType(CreateEmpleadoBonoDto) {}
