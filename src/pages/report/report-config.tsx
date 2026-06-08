import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Report = React.lazy(() => import("./report"));

const ReportContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Report />
    </Suspense>
  );
};

const ReportConfig = {
  path: "/report",
  title: "Report Overview",
  element: <ReportContainer />,
};

export default ReportConfig;
