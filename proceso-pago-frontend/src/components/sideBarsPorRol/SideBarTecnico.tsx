"use client";

import {
  Home,
  Users,
  CreditCard,
  FileText,
  CalendarDays,
  Briefcase,
  Settings,
  CalendarX,
  BarChart3,
} from "lucide-react";
import { NavItem } from "@/components/SideBar";
import LayoutConSidebar from "@/components/SideBarProvider";
import SideBarProvider from "@/components/SideBarProvider";

const navItems: NavItem[] = [
  { title: "Inicio", icon: Home, url: "/rrhh" },
  {
    title: "Empleados",
    icon: Users,
    subItems: [
      { title: "Insertar Empleado", url: "/rrhh/empleados/crear" },
      { title: "Editar Empleado", url: "/rrhh/empleados/editar" },
      { title: "Ver Empleados", url: "/rrhh/empleados/ver" },
      {
        title: "Ver Empleados-Ocupaciones",
        url: "/rrhh/empleados/em-ocupacion",
      },
      { title: "Ver Empleados-Bonos", url: "/rrhh/empleados/em-bono" },
    ],
  },
  {
    title: "Tarjetas de Pago",
    icon: CreditCard,
    subItems: [
      { title: "Insertar Tarjeta", url: "/rrhh/tarjeta-pago/crear" },
      { title: "Editar Tarjeta", url: "/rrhh/tarjeta-pago/editar" },
      { title: "Ver Tarjetas", url: "/rrhh/tarjeta-pago/ver" },
      { title: "Ver Tarjetas Por Mes", url: "/rrhh/tarjeta-pago/ver-por-mes" },
    ],
  },
  {
    title: "Ausencias",
    icon: CalendarX,
    subItems: [
      { title: "Insertar Ausencia", url: "/rrhh/ausencia/crear" },
      { title: "Editar Ausencia", url: "/rrhh/ausencia/editar" },
      { title: "Ver Ausencias", url: "/rrhh/ausencia/ver" },
      { title: "Ver Ausencias Por Mes", url: "/rrhh/ausencia/ver-por-mes" },
    ],
  },
  {
    title: "Ocupaciones",
    icon: Briefcase,
    subItems: [
      { title: "Insertar Ocupación", url: "/rrhh/ocupacion/crear" },
      { title: "Editar Ocupación", url: "/rrhh/ocupacion/editar" },
      { title: "Ver Ocupaciones", url: "/rrhh/ocupacion/ver" },
    ],
  },
  {
    title: "Bonos",
    icon: FileText,
    subItems: [
      { title: "Insertar Bono", url: "/rrhh/bonos/crear" },
      { title: "Editar Bono", url: "/rrhh/bonos/editar" },
      { title: "Ver Bonos", url: "/rrhh/bonos/ver" },
      { title: "Eliminar Bonos", url: "/rrhh/bonos/eliminar" },
    ],
  },
  {
    title: "Días Feriados",
    icon: CalendarDays,
    subItems: [
      { title: "Insertar Día Feriado", url: "/rrhh/dias-feriados/crear" },
      { title: "Eliminar Día Feriado", url: "/rrhh/dias-feriados/eliminar" },
    ],
  },
  
  {
    title: "Tipo Ausencia",
    icon: CalendarX,
    subItems: [
      { title: "Insertar Tipo Ausencia", url: "/rrhh/tipo-ausencia/crear" },
      /*{ title: "Editar Ausencia", url: "/rrhh/ausencia/editar" },
      { title: "Ver Ausencias", url: "/rrhh/ausencia/ver" },
      { title: "Ver Ausencias Por Mes", url: "/rrhh/ausencia/ver-por-mes" },*/
    ],
  },
  {
  title: "Reportes",
  icon: BarChart3,
  subItems: [
    { title: "Reporte de Horas y Ausencias", url: "/rrhh/reporte/ver" },
  ],
},
  //{ title: "Configuración", icon: Settings, url: "/rrhh/settings" },
];

export default function SideBarTecnico_RH({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SideBarProvider
      navItems={navItems}
      label="Panel Tecnico RR_HH"
      tituloApp="Mi App · Tecnico RR_HH"
    >
      {children}
    </SideBarProvider>
  );
}
