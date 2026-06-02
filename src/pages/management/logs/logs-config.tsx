import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Logs = React.lazy(() => import("./logs"));

const LogsContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Logs />
    </Suspense>
  );
};

const LogsConfig = {
  path: "/management/logs",
  element: <LogsContainer />,
};

export default LogsConfig;
