import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SuperAdminBidConfig = React.lazy(() => import("./bid-config"));

const SuperAdminBidConfigContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperAdminBidConfig />
    </Suspense>
  );
};

const SuperAdminBidConfigConfig = {
  path: "/super-admin/bid-config",
  title: "Bid Configuration",
  element: <SuperAdminBidConfigContainer />,
};

export default SuperAdminBidConfigConfig;
