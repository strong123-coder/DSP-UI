import { useState } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { Menu, LogOut, Circle, UserCircle } from "lucide-react";
import { useAppStore } from "@/store";
import logo from "@/assets/strongmetrics-logo.webp";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import SidebarConf from "@/configurations/sidebarConf";
import { routes } from "@/routes/router";

export default function MainLayout() {
  const { pathname } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          <div className="p-6 flex items-center border-b border-border">
            <img
              src={logo}
              alt="Strongmetrics"
              className="w-40 h-auto"
            />
          </div>

          {/* Navigation Directory */}
          <nav className="p-4 space-y-2">
            {/* FLAT TABS */}
            <div className="space-y-1">
              {SidebarConf.navMain.map((item) => {
                const IconComponent = item.icon;
                const isDashboard = item.url === "/dashboard";
                const isCampaign = item.url === "/campaign/list";
                const isProfile = item.url === "/profile";
                const isSelected = isDashboard
                  ? pathname === "/dashboard" || pathname === "/"
                  : isCampaign
                    ? pathname.startsWith("/campaign")
                    : isProfile
                      ? pathname.startsWith("/profile")
                      : pathname === item.url;

                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-250 relative group
                      ${
                        isSelected || isActive
                          ? "text-primary-foreground bg-primary shadow-md shadow-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.title}</span>
                    {isSelected && (
                      <div className="absolute right-3 w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse"></div>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* COLLAPSIBLE ACCORDION TABS */}
            <Accordion
              type="single"
              collapsible
              className="w-full border-none rounded-none p-0 space-y-1"
            >
              {SidebarConf.navCategories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <AccordionItem
                    key={category.value}
                    value={category.value}
                    className="border-none p-0"
                  >
                    <AccordionTrigger className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 justify-between w-full hover:no-underline transition-all duration-200">
                      <span className="flex items-center gap-3.5">
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                        <span>{category.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 pl-7 space-y-1 mt-1">
                      {category.items.map((subItem) => (
                        <NavLink
                          key={subItem.url}
                          to={subItem.url}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200
                            ${
                              isActive
                                ? "text-primary dark:text-white bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }
                          `}
                        >
                          <Circle className="w-2.5 h-2.5 fill-current opacity-70 mr-1.5" />
                          <span>{subItem.title}</span>
                        </NavLink>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </nav>
        </div>

        {/* Sidebar Footer User Detail and Logout */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between gap-3 px-2 py-2 mb-2 rounded-lg">
            <div className="flex items-center gap-2.5">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {user?.name || "Console User"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
                  {user?.type || "Console Admin"}
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
        </header>

        {/* Content View Outlet */}
        <main className="flex-1 w-full h-full min-w-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
