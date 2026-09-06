"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Coffee, LogOut, Settings } from "lucide-react";

import { NAV_ITEMS } from "@/shared/config/nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { getQueryClient } from "@/shared/lib/query-client";
import { useAuthStore } from "@/shared/store/auth-store";

const NAV_ITEM_CLASS = "h-11 gap-3 px-4 text-base [&_svg]:size-5";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    // El refresh token emitido sigue siendo válido hasta su expiración
    // natural si alguien lo capturó antes de este logout — no hay tabla de
    // refresh tokens revocables en v1 (ver auth-strategy.md).
    clearSession();
    getQueryClient().clear();
    router.push("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 px-4 py-6">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {/* Placeholder de marca — reemplazar por el isotipo real de Mokka */}
          <Avatar size="lg" className="shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Coffee className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading truncate text-xl font-semibold text-sidebar-foreground">
              Mokka Café
            </span>
            <p className="truncate text-xs text-muted-foreground">
              Panel de barista
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className={NAV_ITEM_CLASS}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ajustes" className={NAV_ITEM_CLASS}>
              <Settings />
              <span>Ajustes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              className={NAV_ITEM_CLASS}
              onClick={handleLogout}
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
