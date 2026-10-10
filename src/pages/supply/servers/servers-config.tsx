import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const McpServers = React.lazy(() => import("./servers"));
const McpServerForm = React.lazy(() => import("./server-form"));
const McpServerDetail = React.lazy(() => import("./server-detail"));

const wrap = (el: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{el}</Suspense>;

export const SupplyServersConfig = {
  path: "/supply/servers",
  title: "My MCP Servers",
  element: wrap(<McpServers />),
};

export const SupplyServerNewConfig = {
  path: "/supply/servers/new",
  title: "Add MCP Server",
  element: wrap(<McpServerForm />),
};

export const SupplyServerEditConfig = {
  path: "/supply/servers/:id/edit",
  title: "Edit MCP Server",
  element: wrap(<McpServerForm />),
};

export const SupplyServerDetailConfig = {
  path: "/supply/servers/:id",
  title: "MCP Server",
  element: wrap(<McpServerDetail />),
};
