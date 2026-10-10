import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const McpCampaignForm = React.lazy(() => import("./mcp-campaign-form"));

const wrap = (el: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{el}</Suspense>;

export const McpCampaignAddConfig = {
  path: "/campaign/mcp/new",
  title: "New MCP Campaign",
  element: wrap(<McpCampaignForm />),
};

export const McpCampaignEditConfig = {
  path: "/campaign/mcp/:id/edit",
  title: "Edit MCP Campaign",
  element: wrap(<McpCampaignForm />),
};
