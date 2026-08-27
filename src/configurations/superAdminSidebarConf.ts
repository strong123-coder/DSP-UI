import { LayoutDashboard, SlidersHorizontal, BarChart3, Server, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SuperAdminSidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const superAdminNavMain: SuperAdminSidebarItem[] = [
  { title: "Dashboard", url: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Aggregate Report", url: "/super-admin/report", icon: BarChart3 },
  { title: "Demand Partners", url: "/super-admin/demand", icon: Server },
  { title: "Supply Partners", url: "/super-admin/supply", icon: Radio },
  { title: "Bid Configuration", url: "/super-admin/bid-config", icon: SlidersHorizontal },
];
