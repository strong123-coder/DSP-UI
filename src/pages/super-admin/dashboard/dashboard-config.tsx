import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SuperAdminDashboard = React.lazy(() => import("./dashboard"));

const SuperAdminDashboardContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperAdminDashboard />
    </Suspense>
  );
};

const SuperAdminDashboardConfig = {
  path: "/super-admin/dashboard",
  title: "All Organizations — Overview",
  element: <SuperAdminDashboardContainer />,
};

export default SuperAdminDashboardConfig;
