import { IsNumber, Min } from 'class-validator';

export class UpdateBonoDto {
    @IsNumber()
    @Min(0.01)
    monto_mensual_bo: number;
}
