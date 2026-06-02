import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Theme = React.lazy(() => import("./theme"));

const ThemeContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Theme />
    </Suspense>
  );
};

const ThemeConfig = {
  path: "/settings/theme",
  element: <ThemeContainer />,
};

export default ThemeConfig;
