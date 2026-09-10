import { NAV_ITEMS } from "@/shared/config/nav";
import {
  AppSidebarLinkMenuItem,
  AppSidebarSubMenuWithItems,
} from "./app-sidebar-menu-item";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "../../ui/sidebar";
import { usePathname } from "next/navigation";

export const AppSidebarContent = () => {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1.5">
            {NAV_ITEMS.map((item) => {
              if (item.items) {
                return (
                  <AppSidebarSubMenuWithItems
                    key={item.label}
                    label={item.label}
                    icon={<item.icon />}
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    items={item.items}
                    pathname={pathname}
                  />
                );
              }

              return (
                <AppSidebarLinkMenuItem
                  key={item.label}
                  label={item.label}
                  icon={<item.icon />}
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  href={item.href}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};
