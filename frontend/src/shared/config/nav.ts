import {
  ChartColumn,
  ChefHat,
  Package,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  items?: { href: string; label: string }[];
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/cocina", label: "Cocina", icon: ChefHat },
  {
    href: "/inventario",
    label: "Inventario",
    icon: Package,
    items: [{ href: "/inventario/ingredientes", label: "Ingredientes" }],
  },
  { href: "/reportes", label: "Reportes", icon: ChartColumn },
  { href: "/usuarios", label: "Usuarios", icon: Users },
] as const;
