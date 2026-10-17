import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { Menu, LogOut, Circle, UserCircle, Network } from "lucide-react";
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
import { useScope } from "@/query/useScope";
import { useApprovalCount } from "@/query/useApproval";
import { roleLabel } from "@/utils/roles";

export default function MainLayout() {
  const { pathname } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, selectedOrg, exitOrg, exitNetwork } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scope = useScope();
  const { data: approvalCount } = useApprovalCount(scope.canApprove);
  const pendingApprovals: number = approvalCount?.data?.data?.total || 0;

  const isImpersonating = user?.type === "super_admin" && !!selectedOrg;

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: ["orgConfig"] });
    exitNetwork();
    exitOrg();
    logout();
    navigate("/login");
  };

  const queryClient = useQueryClient();

  // Super admin leaving the entered org → back to the all-orgs area.
  const handleExitOrg = () => {
    queryClient.removeQueries({ queryKey: ["orgConfig"] });
    exitNetwork();
    exitOrg();
    navigate("/super-admin/dashboard");
  };

  // Leaving a network: drop everything cached for it, back to the org's networks.
  const handleExitNetwork = () => {
    exitNetwork();
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "orgConfig" });
    navigate("/network/list");
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
            <img src={logo} alt="Strongmetrics" className="w-40 h-auto" />
          </div>

          {/* Navigation Directory */}
          <nav className="p-4 space-y-2">
            {/* FLAT TABS */}
            <div className="space-y-1">
              {SidebarConf.navMain.filter((item) => !item.requires || scope[item.requires]).map((item) => {
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
                      : item.match
                        ? pathname.startsWith(item.match)
                      : // exact, or a sub-page (e.g. /report/campaign/:id stays under Report)
                        pathname === item.url || pathname.startsWith(item.url + "/");

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
                    {item.badge === "approvals" && pendingApprovals > 0 && (
                      <span
                        className={`ml-auto mr-3 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums ${
                          isSelected ? "bg-primary-foreground text-primary" : "bg-amber-500 text-white"
                        }`}
                        aria-label={`${pendingApprovals} waiting for approval`}
                      >
                        {pendingApprovals > 99 ? "99+" : pendingApprovals}
                      </span>
                    )}
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
                  {roleLabel(user?.type) || "Console Admin"}
                </span>
                {scope.networkUser && scope.network && (
                  <span className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Network className="w-3 h-3" /> {scope.network.name}
                  </span>
                )}
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
        {/* Super-admin impersonation banner */}
        {isImpersonating && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40 px-4 py-2.5">
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Viewing <strong>{selectedOrg?.name}</strong> as super admin
            </span>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer border-amber-400 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
              onClick={handleExitOrg}
            >
              <LogOut className="w-4 h-4 mr-2" /> Exit org
            </Button>
          </div>
        )}

        {/* Org user working inside one of the org's networks */}
        {scope.enteredNetwork && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40 px-4 py-2.5">
            <span className="text-sm text-sky-900 dark:text-sky-200 flex items-center gap-2">
              <Network className="w-4 h-4 shrink-0" />
              <span>
                Working in network <strong>{scope.enteredNetwork.name}</strong>. You see and create only this
                network's advertisers and campaigns.
              </span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer shrink-0 border-sky-400 text-sky-900 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-900/40"
              onClick={handleExitNetwork}
            >
              <LogOut className="w-4 h-4 mr-2" /> Exit network
            </Button>
          </div>
        )}

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
