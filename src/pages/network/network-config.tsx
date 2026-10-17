import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

const NetworkList = React.lazy(() => import("./network-list"));
const NetworkForm = React.lazy(() => import("./network-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

const NetworkConfig = {
  path: "/network",
  title: "Networks",
  children: [
    { index: true, element: <Navigate to="/network/list" replace /> },
    { path: "/network/list", title: "Networks", element: lazyPage(NetworkList) },
    { path: "/network/new", title: "Create Network", element: lazyPage(NetworkForm) },
    { path: "/network/edit/:id", title: "Edit Network", element: lazyPage(NetworkForm) },
  ],
};

export default NetworkConfig;
