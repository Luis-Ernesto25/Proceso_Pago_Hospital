"use client";
import { Home, UserCog } from "lucide-react";
import { NavItem } from "@/components/SideBar";
import SideBarProvider from "@/components/SideBarProvider";

const navItems: NavItem[] = [
  { title: "Inicio", icon: Home, url: "/admin" },
  {
    title: "Usuarios",
    icon: UserCog,
    subItems: [
      { title: "Crear Usuario", url: "/admin/usuario/crear" },
      { title: "Ver Usuario", url: "/admin/usuario/ver" },
    ],
  }
];

export default function SideBarAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SideBarProvider
      navItems={navItems}
      label="Panel Admin"
      tituloApp="Mi App · Admin"
    >
      {children}
    </SideBarProvider>
  );
}