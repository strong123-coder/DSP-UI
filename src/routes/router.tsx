import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SuperAdminGuard } from "@/components/auth/SuperAdminGuard";
import MainLayout from "@/components/layout/MainLayout";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import DashboardConfig from "@/pages/dashboard/dashboard-config";
import ProfileConfig from "@/pages/profile/profile-config";
import UsersConfig from "@/pages/management/users/users-config";
import LogsConfig from "@/pages/management/logs/logs-config";
import ThemeConfig from "@/pages/settings/theme/theme-config";
import AccountConfig from "@/pages/settings/account/account-config";
import LoginConfig from "@/pages/auth/login-config";
import SuperAdminLoginConfig from "@/pages/auth/super-admin-login-config";
import SuperAdminDashboardContainer from "@/pages/super-admin/dashboard-config";
import BidConfigContainer from "@/pages/super-admin/bid-config-config";
import CampaignConfig from "@/pages/campaign/campaign-config";
import ReportConfig from "@/pages/report/report-config";

export const routes = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      DashboardConfig,
      CampaignConfig,
      ReportConfig,
      ProfileConfig,
      UsersConfig,
      LogsConfig,
      ThemeConfig,
      AccountConfig,
    ],
  },
  // Super-admin area: guarded + its own sidebar layout. Add new super-admin
  // sections as children here.
  {
    path: "/super-admin",
    element: (
      <SuperAdminGuard>
        <SuperAdminLayout />
      </SuperAdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/super-admin/dashboard" replace /> },
      { path: "dashboard", element: <SuperAdminDashboardContainer /> },
      { path: "bid-config", element: <BidConfigContainer /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
  LoginConfig,
  SuperAdminLoginConfig,
];

const router = createBrowserRouter(routes);

export default router;
