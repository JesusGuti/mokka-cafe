import { SidebarHeader } from "@/shared/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Coffee } from "lucide-react";

export const AppSidebarHeader = () => {
  return (
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
  );
};
