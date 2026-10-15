import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

const AdvertiserList = React.lazy(() => import("./advertiser-list"));
const AdvertiserForm = React.lazy(() => import("./advertiser-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

const AdvertiserConfig = {
  path: "/advertiser",
  title: "Advertisers",
  children: [
    { index: true, element: <Navigate to="/advertiser/list" replace /> },
    { path: "/advertiser/list", title: "Advertisers", element: lazyPage(AdvertiserList) },
    { path: "/advertiser/new", title: "Create Advertiser", element: lazyPage(AdvertiserForm) },
    { path: "/advertiser/edit/:id", title: "Edit Advertiser", element: lazyPage(AdvertiserForm) },
  ],
};

export default AdvertiserConfig;
