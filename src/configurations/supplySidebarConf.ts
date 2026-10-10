import { Server, PlusCircle, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SupplySidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
}

export const supplyNavMain: SupplySidebarItem[] = [
  { title: "My MCP Servers", url: "/supply/servers", icon: Server, end: true },
  { title: "Add MCP Server", url: "/supply/servers/new", icon: PlusCircle },
  { title: "Integration Guide", url: "/supply/guide", icon: BookOpen },
];
