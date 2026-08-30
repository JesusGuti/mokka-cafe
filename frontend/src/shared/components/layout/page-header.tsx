"use client";

import { NAV_ITEMS } from "@/shared/config/nav";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Bell, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const getPageTitle = (pathname: string) =>
  NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label ?? "";

export function PageHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {title && (
          <h1 className="font-heading text-xl font-semibold text-foreground">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-accent/30"
        >
          <Bell className="size-5" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full px-2 py-1.5 text-foreground hover:bg-accent/30"
        >
          <UserCircle className="size-5" />
          <span className="hidden text-sm font-medium sm:inline">
            Barista Alex
          </span>
        </button>
      </div>
    </header>
  );
}
