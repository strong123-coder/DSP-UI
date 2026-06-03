import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";
import DashboardConfig from "@/pages/dashboard/dashboard-config";
import ProfileConfig from "@/pages/profile/profile-config";
import UsersConfig from "@/pages/management/users/users-config";
import LogsConfig from "@/pages/management/logs/logs-config";
import ThemeConfig from "@/pages/settings/theme/theme-config";
import AccountConfig from "@/pages/settings/account/account-config";
import LoginConfig from "@/pages/auth/login-config";
import CampaignConfig from "@/pages/campaign/campaign-config";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      DashboardConfig,
      CampaignConfig,
      ProfileConfig,
      UsersConfig,
      LogsConfig,
      ThemeConfig,
      AccountConfig,
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
  LoginConfig,
]);

export default router;
