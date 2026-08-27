import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SupplyForm = React.lazy(() => import("./supply-form"));

const SupplyFormContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SupplyForm />
  </Suspense>
);

export const SuperAdminSupplyNewConfig = {
  path: "/super-admin/supply/new",
  title: "New Supply Partner",
  element: <SupplyFormContainer />,
};

export const SuperAdminSupplyEditConfig = {
  path: "/super-admin/supply/:id/edit",
  title: "Edit Supply Partner",
  element: <SupplyFormContainer />,
};
