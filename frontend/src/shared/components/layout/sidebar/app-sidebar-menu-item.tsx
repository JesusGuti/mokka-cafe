import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

const NAV_ITEM_CLASS = "h-11 gap-3 px-4 text-base [&_svg]:size-5";

interface AppSidebarMenuItemProps {
  icon: ReactNode;
  onClick?: () => void;
  label: string;
  tooltip: string;
}

export const AppSidebarMenuItem = ({
  icon,
  onClick,
  label,
  tooltip,
}: AppSidebarMenuItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={tooltip}
        className={NAV_ITEM_CLASS}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

type AppSidebarLinkMenuItemProps = Omit<AppSidebarMenuItemProps, "onClick"> & {
  href: string;
  isActive: boolean;
};

export const AppSidebarLinkMenuItem = ({
  href,
  isActive,
  icon,
  label,
  tooltip,
}: AppSidebarLinkMenuItemProps) => {
  return (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={isActive}
        tooltip={tooltip}
        className={NAV_ITEM_CLASS}
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

type AppSidebarSubMenuWithItemsProps = Omit<
  AppSidebarLinkMenuItemProps,
  "href"
> & {
  items: { href: string; label: string }[];
  pathname: string;
};

export const AppSidebarSubMenuWithItems = ({
  isActive,
  icon,
  items,
  label,
  pathname,
  tooltip,
}: AppSidebarSubMenuWithItemsProps) => {
  const [open, setOpen] = useState(isActive);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={tooltip}
        className={NAV_ITEM_CLASS}
        isActive={isActive}
        onClick={() => setOpen((prev) => !prev)}
      >
        {icon}
        <span>{label}</span>
        <ChevronRight
          className={cn("ml-auto transition-transform", open && "rotate-90")}
        />
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {items.map((subitem) => (
            <SidebarMenuSubItem key={subitem.href}>
              <SidebarMenuSubButton
                render={<Link href={subitem.href} />}
                isActive={pathname.startsWith(subitem.href)}
              >
                <span>{subitem.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};
