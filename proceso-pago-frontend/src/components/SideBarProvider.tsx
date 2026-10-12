"use client";

import { useState } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar, NavItem } from "@/components/SideBar";

interface LayoutConSidebarProps {
  children: React.ReactNode;
  navItems: NavItem[];
  label?: string;
  tituloApp?: string;
}

export default function SideBarProvider({
  children,
  navItems,
  label = "Mi App",
  tituloApp = "Mi App",
}: LayoutConSidebarProps) {
  const [tituloSecundario, setTituloSecundario] = useState("");

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        navItems={navItems}
        label={label}
        onChange={setTituloSecundario}
      />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b pb-2 mb-4 p-4">
          <div className="flex items-center gap-10">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">{tituloApp}</h1>
            {tituloSecundario && (
              <h2 className="text-xl font-semibold pl-50">
                {tituloSecundario}
              </h2>
            )}
          </div>
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}