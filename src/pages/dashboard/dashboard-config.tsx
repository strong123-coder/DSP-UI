import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Dashboard = React.lazy(() => import("./dashboard"));

const DashboardContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Dashboard />
    </Suspense>
  );
};

const DashboardConfig = {
  path: "/dashboard",
  element: <DashboardContainer />,
};

export default DashboardConfig;
