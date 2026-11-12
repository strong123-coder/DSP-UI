import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SegmentLibrary = React.lazy(() => import("./segment-library"));

const SegmentConfig = {
  path: "/segments",
  title: "Audience segments",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <SegmentLibrary />
    </Suspense>
  ),
};

export default SegmentConfig;
