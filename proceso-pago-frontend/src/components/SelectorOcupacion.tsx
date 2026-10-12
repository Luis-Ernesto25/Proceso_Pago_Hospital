"use client";

import { Label } from "@/components/ui/label";
import { SelectorConBusqueda } from '@/components/SelectorConBusqueda';

interface SelectorOcupacionProps {
  tipoOcupacion: "propio" | "noPropio";
  onTipoChange: (value: "propio" | "noPropio") => void;
  ocupacion1: string;
  onOcupacion1Change: (value: string) => void;
  ocupacion2: string;
  onOcupacion2Change: (value: string) => void;
  ocupaciones: string[];
}

export function SelectorOcupacion({
  tipoOcupacion,
  onTipoChange,
  ocupacion1,
  onOcupacion1Change,
  ocupacion2,
  onOcupacion2Change,
  ocupaciones,
}: SelectorOcupacionProps) {
  const OpcionTipo = ({
    etiqueta,
    activo,
    onClick,
  }: {
    etiqueta: string;
    activo: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
        activo
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          activo ? "border-white bg-blue-600" : "border-gray-400 bg-white"
        }`}
      >
        {activo && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </span>
      {etiqueta}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Ocupación</Label>
        <div className="flex gap-4">
          <OpcionTipo
            etiqueta="Propio"
            activo={tipoOcupacion === "propio"}
            onClick={() => onTipoChange("propio")}
          />
          <OpcionTipo
            etiqueta="No Propio"
            activo={tipoOcupacion === "noPropio"}
            onClick={() => onTipoChange("noPropio")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          {tipoOcupacion === "propio" ? "Ocupación" : "Primera Ocupación"}
        </Label>

        <SelectorConBusqueda
          value={ocupacion1}
          onChange={onOcupacion1Change}
          options={ocupaciones}
          placeholder="Buscar ocupación..."
          onEmptyMessage="No se encontraron ocupaciones."
        />
      </div>

      {tipoOcupacion === "noPropio" && (
        <div className="space-y-2">
          <Label>Segunda Ocupación (Opcional)</Label>

          <SelectorConBusqueda
            value={ocupacion2}
            onChange={onOcupacion2Change}
            options={ocupaciones}
            placeholder="Buscar segunda ocupación..."
            onEmptyMessage="No se encontraron ocupaciones."
            excluirValor={ocupacion1}
          />
        </div>
      )}
    </div>
  );
}