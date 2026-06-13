import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SuperAdminDashboard = React.lazy(() => import("./dashboard"));

// Content container; the guard + layout are applied by the /super-admin parent route.
const SuperAdminDashboardContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SuperAdminDashboard />
  </Suspense>
);

export default SuperAdminDashboardContainer;
