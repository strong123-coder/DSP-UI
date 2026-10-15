import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

const TargetingListList = React.lazy(() => import("./targeting-list-list"));
const TargetingListForm = React.lazy(() => import("./targeting-list-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

const TargetingListConfig = {
  path: "/targeting-list",
  title: "Targeting lists",
  children: [
    { index: true, element: <Navigate to="/targeting-list/list" replace /> },
    { path: "/targeting-list/list", title: "Targeting lists", element: lazyPage(TargetingListList) },
    { path: "/targeting-list/new", title: "Create targeting list", element: lazyPage(TargetingListForm) },
    { path: "/targeting-list/edit/:id", title: "Edit targeting list", element: lazyPage(TargetingListForm) },
  ],
};

export default TargetingListConfig;
