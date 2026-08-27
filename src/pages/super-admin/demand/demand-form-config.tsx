import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const DemandForm = React.lazy(() => import("./demand-form"));

const DemandFormContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <DemandForm />
  </Suspense>
);

export const SuperAdminDemandNewConfig = {
  path: "/super-admin/demand/new",
  title: "New Demand Partner",
  element: <DemandFormContainer />,
};

export const SuperAdminDemandEditConfig = {
  path: "/super-admin/demand/:id/edit",
  title: "Edit Demand Partner",
  element: <DemandFormContainer />,
};
