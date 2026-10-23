import { SidebarFooter, SidebarMenu } from "@/shared/components/ui/sidebar";
import { getQueryClient } from "@/shared/lib/query-client";
import { useAuthStore } from "@/shared/store/auth-store";
import { AppSidebarMenuItem } from "./app-sidebar-menu-item";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export const AppSidebarFooter = () => {
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
    <SidebarFooter className="px-2 pb-4">
      <SidebarMenu className="gap-1.5">
        <AppSidebarMenuItem
          icon={<Settings />}
          label="Ajustes"
          tooltip="Ajustes"
        />
        <AppSidebarMenuItem
          icon={<LogOut />}
          label="Cerrar sesión"
          onClick={handleLogout}
          tooltip="Cerrar sesión"
        />
      </SidebarMenu>
    </SidebarFooter>
  );
};
