import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SupplyPartners = React.lazy(() => import("./supply"));

const SupplyContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SupplyPartners />
  </Suspense>
);

const SuperAdminSupplyConfig = {
  path: "/super-admin/supply",
  title: "Supply Partners",
  element: <SupplyContainer />,
};

export default SuperAdminSupplyConfig;
