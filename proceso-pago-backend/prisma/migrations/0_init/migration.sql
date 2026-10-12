-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "tipo_ocupacion" AS ENUM ('Propia', 'No Propia');

-- CreateEnum
CREATE TYPE "tipo_rol" AS ENUM ('Tecnico RH', 'Economista', 'Admin', 'Contador', 'SuperAdmin');

-- CreateTable
CREATE TABLE "ausencia" (
    "id_em" INTEGER NOT NULL,
    "fecha_inicio_au" DATE NOT NULL,
    "fecha_fin_au" DATE NOT NULL,
    "dias_au" INTEGER NOT NULL,
    "id_tipo_ausencia" VARCHAR NOT NULL,

    CONSTRAINT "ausenciaPkey" PRIMARY KEY ("id_em","fecha_inicio_au")
);

-- CreateTable
CREATE TABLE "bono" (
    "id_bo" VARCHAR NOT NULL,
    "monto_mensual_bo" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "bono_pkey" PRIMARY KEY ("id_bo")
);

-- CreateTable
CREATE TABLE "credenciales" (
    "id_credencial" SERIAL NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "rol" "tipo_rol" NOT NULL,

    CONSTRAINT "credenciales_pkey" PRIMARY KEY ("id_credencial")
);

-- CreateTable
CREATE TABLE "dias_feriados" (
    "fecha_dia" DATE NOT NULL,

    CONSTRAINT "Dias_Feriados_pkey" PRIMARY KEY ("fecha_dia")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id_em" INTEGER NOT NULL,
    "carnet_em" VARCHAR(11) NOT NULL,
    "nombre_em" VARCHAR NOT NULL,
    "apellido1_em" VARCHAR NOT NULL,
    "apellido2_em" VARCHAR NOT NULL,
    "nivel_ed_em" VARCHAR,
    "telefono_em" VARCHAR,
    "direccion_em" VARCHAR,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id_em")
);

-- CreateTable
CREATE TABLE "empleado_bono" (
    "id_em" INTEGER NOT NULL,
    "id_bo" VARCHAR NOT NULL,

    CONSTRAINT "Empleado_Bono_pkey" PRIMARY KEY ("id_em","id_bo")
);

-- CreateTable
CREATE TABLE "empleado_horas" (
    "id_em" INTEGER NOT NULL,
    "fecha_inicio_eh" VARCHAR NOT NULL,
    "fecha_fin_eh" VARCHAR NOT NULL,
    "horas_ausencia_eh" INTEGER NOT NULL,
    "horas_trabajo_eh" INTEGER NOT NULL,
    "horas_extras_eh" INTEGER NOT NULL,
    "horas_guardia_eh" INTEGER NOT NULL,
    "horas_feriadas_eh" INTEGER NOT NULL,

    CONSTRAINT "Empleado_Horas_pkey" PRIMARY KEY ("id_em","fecha_inicio_eh","fecha_fin_eh")
);

-- CreateTable
CREATE TABLE "empleado_ocupacion" (
    "id_em" INTEGER NOT NULL,
    "id_oc" VARCHAR NOT NULL,

    CONSTRAINT "empleado_ocupacion_pkey" PRIMARY KEY ("id_em","id_oc")
);

-- CreateTable
CREATE TABLE "guardia" (
    "id_em" INTEGER NOT NULL,
    "fecha_gu" DATE NOT NULL,
    "costo_gu" DECIMAL(5,0),
    "dia_semana_gu" VARCHAR,
    "horas_guardia_gu" INTEGER,

    CONSTRAINT "Guardia_pkey" PRIMARY KEY ("fecha_gu","id_em")
);

-- CreateTable
CREATE TABLE "ocupacion" (
    "id_oc" VARCHAR NOT NULL,
    "salario_mes_oc" DECIMAL(7,2) NOT NULL,
    "costo_hora_guardia_oc" DECIMAL(5,2) NOT NULL,
    "tipo_ocupacion" "tipo_ocupacion" NOT NULL,
    "cant_horas_jornada" INTEGER NOT NULL,
    "cant_horas_guardia_oc" INTEGER NOT NULL,

    CONSTRAINT "Ocupacion_pkey" PRIMARY KEY ("id_oc")
);

-- CreateTable
CREATE TABLE "tarjeta_pago" (
    "id_em" INTEGER NOT NULL,
    "fecha_entrada_ta" DATE NOT NULL,
    "fecha_salida_ta" DATE NOT NULL,
    "hora_entrada_ta" TIME(6) NOT NULL,
    "hora_salida_ta" TIME(6) NOT NULL,

    CONSTRAINT "Tarjeta_Pago_pkey" PRIMARY KEY ("id_em","fecha_entrada_ta")
);

-- CreateTable
CREATE TABLE "tipo_ausencia" (
    "id_tipo_ausencia" VARCHAR NOT NULL,
    "se_paga_sueldo_ti" BOOLEAN NOT NULL,

    CONSTRAINT "Tipo_Ausencia_pkey" PRIMARY KEY ("id_tipo_ausencia")
);

-- AddForeignKey
ALTER TABLE "ausencia" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ausencia" ADD CONSTRAINT "id_tipo_ausencia" FOREIGN KEY ("id_tipo_ausencia") REFERENCES "tipo_ausencia"("id_tipo_ausencia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empleado_bono" ADD CONSTRAINT "id_bo" FOREIGN KEY ("id_bo") REFERENCES "bono"("id_bo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empleado_bono" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empleado_horas" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empleado_ocupacion" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empleado_ocupacion" ADD CONSTRAINT "id_oc" FOREIGN KEY ("id_oc") REFERENCES "ocupacion"("id_oc") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "guardia" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarjeta_pago" ADD CONSTRAINT "id_em" FOREIGN KEY ("id_em") REFERENCES "empleado"("id_em") ON DELETE NO ACTION ON UPDATE NO ACTION;
