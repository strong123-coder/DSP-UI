import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const InventoryUploads = React.lazy(() => import("./inventory"));

const SuperAdminInventoryConfig = {
  path: "/super-admin/inventory",
  title: "Inventory",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <InventoryUploads />
    </Suspense>
  ),
};

export default SuperAdminInventoryConfig;
