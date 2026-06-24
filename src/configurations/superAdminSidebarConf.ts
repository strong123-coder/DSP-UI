import { LayoutDashboard, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SuperAdminSidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const superAdminNavMain: SuperAdminSidebarItem[] = [
  { title: "Dashboard", url: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Bid Configuration", url: "/super-admin/bid-config", icon: SlidersHorizontal },
];
