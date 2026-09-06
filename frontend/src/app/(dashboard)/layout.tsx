import { AuthGate } from "@/shared/components/auth/auth-gate";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/toast";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGate>
      <TooltipProvider delay={300}>
        <SidebarProvider className="h-svh">
          <AppSidebar />
          <SidebarInset className="h-svh overflow-hidden">
            <PageHeader />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthGate>
  );
}
