import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const McpReview = React.lazy(() => import("./mcp-review"));

const SuperAdminMcpReviewConfig = {
  path: "/super-admin/mcp-review",
  title: "MCP Review",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <McpReview />
    </Suspense>
  ),
};

export default SuperAdminMcpReviewConfig;
