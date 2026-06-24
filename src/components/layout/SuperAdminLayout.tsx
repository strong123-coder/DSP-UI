import { useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
  matchRoutes,
} from "react-router-dom";
import { LogOut, Menu, UserCircle, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store";
import logo from "@/assets/strongmetrics-logo.webp";
import { Button } from "@/components/ui/button";
import { superAdminNavMain } from "@/configurations/superAdminSidebarConf";
import { routes } from "@/routes/router";

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Find page title dynamically based on route configuration
  const getPageTitle = () => {
    const matches = matchRoutes(routes, location);
    if (matches) {
      // Find the last matched route that has a title
      for (let i = matches.length - 1; i >= 0; i--) {
        const route = matches[i].route as { title?: string };
        if (route.title) {
          return route.title;
        }
      }
    }
    return "Super Admin Console";
  };

  const handleLogout = () => {
    logout();
    navigate("/super-admin/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col justify-between transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="p-6 flex flex-col gap-2 border-b border-border">
            <img src={logo} alt="Strongmetrics" className="w-40 h-auto" />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {superAdminNavMain.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${
                      isActive
                        ? "text-primary-foreground bg-primary shadow-md shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <UserCircle className="w-8 h-8 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                {user?.name || "Super Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
                {user?.type || "super_admin"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        </header>

        {/* Content View Outlet */}
        <main className="flex-1 w-full h-full min-w-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
