import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const ApprovalPage = React.lazy(() => import("./approval-page"));

const ApprovalConfig = {
  path: "/approval",
  title: "Approvals",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <ApprovalPage />
    </Suspense>
  ),
};

export default ApprovalConfig;
