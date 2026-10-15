import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

const BidModifierList = React.lazy(() => import("./bid-modifier-list"));
const BidModifierForm = React.lazy(() => import("./bid-modifier-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

const BidModifierConfig = {
  path: "/bid-modifier",
  title: "Bid modifiers",
  children: [
    { index: true, element: <Navigate to="/bid-modifier/list" replace /> },
    { path: "/bid-modifier/list", title: "Bid modifiers", element: lazyPage(BidModifierList) },
    { path: "/bid-modifier/new", title: "Create bid modifier", element: lazyPage(BidModifierForm) },
    { path: "/bid-modifier/edit/:id", title: "Edit bid modifier", element: lazyPage(BidModifierForm) },
  ],
};

export default BidModifierConfig;
