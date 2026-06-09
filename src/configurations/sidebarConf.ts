import {
  LayoutDashboard,
  User,
  FolderLock,
  Compass,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
}

export interface SidebarCategory {
  title: string;
  icon: LucideIcon;
  value: string;
  items: SidebarItem[];
}

export interface SidebarFlatItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarConfiguration {
  navMain: SidebarFlatItem[];
  navCategories: SidebarCategory[];
}

export const SidebarConf: SidebarConfiguration = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Campaign",
      url: "/campaign/list",
      icon: Compass,
    },
    {
      title: "Report",
      url: "/report",
      icon: BarChart3,
    },
    {
      title: "My Profile",
      url: "/profile",
      icon: User,
    },
  ],
  navCategories: [
    {
      title: "Management",
      icon: FolderLock,
      value: "management",
      items: [
        {
          title: "User Management",
          url: "/management/users",
        },
        // {
        //   title: "System Logs",
        //   url: "/management/logs",
        // },
      ],
    },
    // {
    //   title: "System Settings",
    //   icon: Settings,
    //   value: "settings",
    //   items: [
    //     {
    //       title: "Theme Options",
    //       url: "/settings/theme",
    //     },
    //     {
    //       title: "Account Settings",
    //       url: "/settings/account",
    //     },
    //   ],
    // },
  ],
};

export default SidebarConf;
