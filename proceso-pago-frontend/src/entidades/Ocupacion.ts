export type TipoOcupacion = "Propia" | "No_Propia";

export interface Ocupacion {
  id_oc: string;
  salario_mes_oc: number;
  cant_horas_jornada: number;
  tipo_ocupacion: TipoOcupacion;
  cant_horas_guardia_oc: number;
  costo_hora_guardia_oc: number;
}