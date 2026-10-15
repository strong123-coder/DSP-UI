import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SuperAdminGuard } from "@/components/auth/SuperAdminGuard";
import { SupplyGuard } from "@/components/auth/SupplyGuard";
import SupplyLayout from "@/components/layout/SupplyLayout";
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
import CampaignConfig from "@/pages/campaign/campaign-config";
import AdvertiserConfig from "@/pages/advertiser/advertiser-config";
import ReportConfig from "@/pages/report/report-config";
import ReportCampaignBundlesConfig from "@/pages/report/report-campaign-bundles-config";
import SuperAdminDashboardConfig from "@/pages/super-admin/dashboard/dashboard-config";
import SuperAdminBidConfigConfig from "@/pages/super-admin/bid-config/bid-config-config";
import SuperAdminReportConfig from "@/pages/super-admin/report/report-config";
import SuperAdminDemandConfig from "@/pages/super-admin/demand/demand-config";
import { SuperAdminDemandNewConfig, SuperAdminDemandEditConfig } from "@/pages/super-admin/demand/demand-form-config";
import SuperAdminSupplyConfig from "@/pages/super-admin/supply/supply-config";
import { SuperAdminSupplyNewConfig, SuperAdminSupplyEditConfig } from "@/pages/super-admin/supply/supply-form-config";
import SuperAdminMcpReviewConfig from "@/pages/super-admin/mcp-review/mcp-review-config";
import { SupplyLoginConfig, SupplySignupConfig } from "@/pages/supply/auth/supply-auth-config";
import {
  SupplyServersConfig,
  SupplyServerNewConfig,
  SupplyServerEditConfig,
  SupplyServerDetailConfig,
} from "@/pages/supply/servers/servers-config";
import SupplyGuideConfig from "@/pages/supply/guide/guide-config";

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
      AdvertiserConfig,
      CampaignConfig,
      ReportConfig,
      ReportCampaignBundlesConfig,
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
      {
        index: true,
        element: <Navigate to="/super-admin/dashboard" replace />,
      },
      SuperAdminDashboardConfig,
      SuperAdminReportConfig,
      SuperAdminDemandConfig,
      SuperAdminDemandNewConfig,
      SuperAdminDemandEditConfig,
      SuperAdminSupplyConfig,
      SuperAdminSupplyNewConfig,
      SuperAdminSupplyEditConfig,
      SuperAdminBidConfigConfig,
      SuperAdminMcpReviewConfig,
    ],
  },
  // MCP publisher (supply) area: self-serve "Monetize your MCP".
  {
    path: "/supply",
    element: (
      <SupplyGuard>
        <SupplyLayout />
      </SupplyGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/supply/servers" replace />,
      },
      SupplyServersConfig,
      SupplyServerNewConfig,
      SupplyServerEditConfig,
      SupplyServerDetailConfig,
      SupplyGuideConfig,
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
  LoginConfig,
  SuperAdminLoginConfig,
  SupplyLoginConfig,
  SupplySignupConfig,
];

const router = createBrowserRouter(routes);

export default router;
