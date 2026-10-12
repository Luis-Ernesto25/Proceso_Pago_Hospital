import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TipoAusencia {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id_tipo_ausencia: string;

  @IsBoolean()
  se_paga_sueldo_ti: boolean;
}