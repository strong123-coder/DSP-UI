import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

const DeliveryModifierList = React.lazy(() => import("./delivery-modifier-list"));
const DeliveryModifierForm = React.lazy(() => import("./delivery-modifier-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

const DeliveryModifierConfig = {
  path: "/delivery-modifier",
  title: "Delivery modifiers",
  children: [
    { index: true, element: <Navigate to="/delivery-modifier/list" replace /> },
    { path: "/delivery-modifier/list", title: "Delivery modifiers", element: lazyPage(DeliveryModifierList) },
    { path: "/delivery-modifier/new", title: "Create delivery modifier", element: lazyPage(DeliveryModifierForm) },
    { path: "/delivery-modifier/edit/:id", title: "Edit delivery modifier", element: lazyPage(DeliveryModifierForm) },
  ],
};

export default DeliveryModifierConfig;
