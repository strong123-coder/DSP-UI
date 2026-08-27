import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const DemandPartners = React.lazy(() => import("./demand"));

const DemandContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <DemandPartners />
  </Suspense>
);

const SuperAdminDemandConfig = {
  path: "/super-admin/demand",
  title: "Demand Partners",
  element: <DemandContainer />,
};

export default SuperAdminDemandConfig;
