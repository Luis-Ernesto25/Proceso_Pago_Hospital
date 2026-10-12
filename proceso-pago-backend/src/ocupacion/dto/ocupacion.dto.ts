import { tipo_ocupacion } from 'generated/prisma';

export interface Ocupacion {
  id_oc: string;
  salario_mes_oc: number;
  cant_horas_jornada: number;
  tipo_ocupacion: tipo_ocupacion;
  cant_horas_guardia_oc: number;
  costo_hora_guardia_oc: number;
}