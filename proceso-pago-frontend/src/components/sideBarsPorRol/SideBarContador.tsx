"use client";

import { Home, CreditCard, FileText } from "lucide-react";
import { NavItem } from "@/components/SideBar";
import SideBarProvider from "@/components/SideBarProvider";

const navItems: NavItem[] = [
  { title: "Inicio", icon: Home, url: "/contador" },
  {
    title: "Tarjetas de Pago",
    icon: CreditCard,
    subItems: [
      { title: "Insertar Tarjetas", url: "/contador/tarjeta-pago/crear" },
      { title: "Ver Tarjetas", url: "/contador/tarjeta-pago/ver" },
    ],
  }
];

export default function SideBarContador({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SideBarProvider
      navItems={navItems}
      label="Panel Contador"
      tituloApp="Mi App · Contador"
    >
      {children}
    </SideBarProvider>
  );
}