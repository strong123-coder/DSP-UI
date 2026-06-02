import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import MainLayout from "@/components/layout/MainLayout";
import DashboardConfig from "@/pages/dashboard/dashboard-config";
import ProfileConfig from "@/pages/profile/profile-config";
import UsersConfig from "@/pages/management/users/users-config";
import LogsConfig from "@/pages/management/logs/logs-config";
import ThemeConfig from "@/pages/settings/theme/theme-config";
import AccountConfig from "@/pages/settings/account/account-config";
import LoginConfig from "@/pages/auth/login-config";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      DashboardConfig,
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
