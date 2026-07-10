import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SuperAdminReport = React.lazy(() => import("./report"));

const SuperAdminReportContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperAdminReport />
    </Suspense>
  );
};

const SuperAdminReportConfig = {
  path: "/super-admin/report",
  title: "Aggregate Report",
  element: <SuperAdminReportContainer />,
};

export default SuperAdminReportConfig;
