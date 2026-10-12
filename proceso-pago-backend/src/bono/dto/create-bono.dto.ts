import { IsString, IsNotEmpty, IsNumber, IsPositive,  Min } from 'class-validator';

export class CreateBonoDto{
  @IsString()
  @IsNotEmpty()
  id_bo: string; 

  @IsNumber()
  @Min(0.01)
  monto_mensual_bo: number;
}
