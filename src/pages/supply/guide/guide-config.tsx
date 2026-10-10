import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const McpGuide = React.lazy(() => import("./guide"));

const SupplyGuideConfig = {
  path: "/supply/guide",
  title: "Integration Guide",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <McpGuide />
    </Suspense>
  ),
};

export default SupplyGuideConfig;
