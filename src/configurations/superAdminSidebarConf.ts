import { LayoutDashboard, SlidersHorizontal, BarChart3, Server, Radio, Sparkles, ListChecks, UsersRound } from "lucide-react";
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
  { title: "Inventory", url: "/super-admin/inventory", icon: ListChecks },
  { title: "Segments", url: "/super-admin/segments", icon: UsersRound },
  { title: "Bid Configuration", url: "/super-admin/bid-config", icon: SlidersHorizontal },
  { title: "MCP Review", url: "/super-admin/mcp-review", icon: Sparkles },
];
