import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SegmentUploads = React.lazy(() => import("./segments"));

const SuperAdminSegmentsConfig = {
  path: "/super-admin/segments",
  title: "Segments",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <SegmentUploads />
    </Suspense>
  ),
};

export default SuperAdminSegmentsConfig;
