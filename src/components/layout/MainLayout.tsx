import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Settings,
  Menu,
  LogOut,
  Circle,
  UserCircle,
  FolderLock,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Find page title for top header
  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard")
      return "Dashboard Overview";
    if (pathname === "/profile") return "User Profile";
    if (pathname.includes("/management/users")) return "User Management";
    if (pathname.includes("/management/logs")) return "System Security Logs";
    if (pathname.includes("/settings/theme")) return "Theme Preferences";
    if (pathname.includes("/settings/account")) return "Account Configurations";
    return "DSP-UI Console";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Upper Brand and Nav */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-border">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-primary/60 rounded-(--radius) flex items-center justify-center shadow-lg shadow-primary/25 transform transition-all hover:scale-105">
              <span className="text-primary-foreground text-lg font-bold">
                D
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground leading-tight">
                DSP-UI Console
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-primary dark:text-blue-400 font-semibold">
                {user?.role || "Console Administrator"}
              </span>
            </div>
          </div>

          {/* Navigation Directory */}
          <nav className="p-4 space-y-2">
            {/* FLAT TABS */}
            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-(--radius) text-sm font-medium transition-all duration-250 relative group
                  ${
                    isActive || pathname === "/"
                      ? "text-primary dark:text-white bg-primary/10 border-l-3 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <LayoutDashboard className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span>Dashboard</span>
                {(pathname === "/dashboard" || pathname === "/") && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                )}
              </NavLink>

              <NavLink
                to="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-(--radius) text-sm font-medium transition-all duration-250 relative group
                  ${
                    isActive
                      ? "text-primary dark:text-white bg-primary/10 border-l-3 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span>My Profile</span>
                {pathname === "/profile" && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                )}
              </NavLink>
            </div>

            {/* COLLAPSIBLE ACCORDION TABS */}
            <Accordion
              type="single"
              collapsible
              className="w-full border-none rounded-none p-0 space-y-1"
            >
              {/* ACCORDION 1: MANAGEMENT */}
              <AccordionItem value="management" className="border-none p-0">
                <AccordionTrigger className="flex items-center gap-3.5 px-4 py-3 rounded-(--radius) text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 justify-between w-full hover:no-underline transition-all duration-200">
                  <span className="flex items-center gap-3.5">
                    <FolderLock className="w-5 h-5 text-muted-foreground" />
                    <span>Management</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0 pl-7 space-y-1 mt-1">
                  <NavLink
                    to="/management/users"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 rounded-(--radius) text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-primary dark:text-white bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    <Circle className="w-2.5 h-2.5 fill-current opacity-70 mr-1.5" />
                    <span>User Management</span>
                  </NavLink>
                  <NavLink
                    to="/management/logs"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 rounded-(--radius) text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-primary dark:text-white bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    <Circle className="w-2.5 h-2.5 fill-current opacity-70 mr-1.5" />
                    <span>System Logs</span>
                  </NavLink>
                </AccordionContent>
              </AccordionItem>

              {/* ACCORDION 2: SETTINGS */}
              <AccordionItem value="settings" className="border-none p-0">
                <AccordionTrigger className="flex items-center gap-3.5 px-4 py-3 rounded-(--radius) text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 justify-between w-full hover:no-underline transition-all duration-200">
                  <span className="flex items-center gap-3.5">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span>System Settings</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0 pl-7 space-y-1 mt-1">
                  <NavLink
                    to="/settings/theme"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 rounded-(--radius) text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-primary dark:text-white bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    <Circle className="w-2.5 h-2.5 fill-current opacity-70 mr-1.5" />
                    <span>Theme Options</span>
                  </NavLink>
                  <NavLink
                    to="/settings/account"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 rounded-(--radius) text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-primary dark:text-white bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    <Circle className="w-2.5 h-2.5 fill-current opacity-70 mr-1.5" />
                    <span>Account Settings</span>
                  </NavLink>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </div>

        {/* Sidebar Footer User Detail and Logout */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between gap-3 px-2 py-2 mb-2 rounded-(--radius)">
            <div className="flex items-center gap-2.5">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {user?.name || "Console User"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
                  {user?.role || "Console Admin"}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-scroll px-4 md:px-6 py-4 w-full">
        {/* Workspace Top Header */}
        <header className="h-14 shrink-0 flex items-center justify-between border-b border-border bg-transparent mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Content View Outlet */}
        <main className="flex-1 w-full h-full min-w-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
