"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  subItems?: { title: string; url: string }[];
};

interface AppSidebarProps {
  navItems: NavItem[];
  label?: string;
  onChange?: (titulo: string) => void;
}

export function AppSidebar({
  navItems,
  label = "Mi App",
  onChange,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (url: string) => pathname === url;

  const isItemActive = (item: NavItem) => {
    if (item.url && isActive(item.url)) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => isActive(sub.url));
    }
    return false;
  };

  return (
    <Sidebar className="[&>div]:bg-white [&>div]:dark:bg-white">
      <SidebarContent className="bg-white dark:bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openMenus[item.title] || false;
                const active = isItemActive(item);

                if (hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        isActive={active}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </span>
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </SidebarMenuButton>
                      {isOpen && (
                        <SidebarMenuSub className="hover:cursor-default">
                          {item.subItems!.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton className = {sub.title.includes("liminar")?'bg-red-400 rounded hover:bg-red-500':'bg-white rounded hover:bg-blue-200'}
                                onClick={() => {
                                  onChange?.(sub.title);
                                  router.push(sub.url);
                                }}
                                isActive={isActive(sub.url)}
                              >
                                <span>{sub.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => {
                        onChange?.(item.title);
                        router.push(item.url!);
                      }}
                      isActive={isActive(item.url!)}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}