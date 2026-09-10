"use client";

import { AppSidebarHeader } from "./app-sidebar-header";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { Sidebar } from "../../ui/sidebar";
import { AppSidebarContent } from "./app-sidebar-content";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <AppSidebarContent />
      <AppSidebarFooter />
    </Sidebar>
  );
}
