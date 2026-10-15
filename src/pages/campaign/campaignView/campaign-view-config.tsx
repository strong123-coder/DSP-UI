import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const CampaignView = React.lazy(() => import("./campaign-view"));
const LineItemForm = React.lazy(() => import("../lineItem/line-item-form"));

const lazyPage = (Page: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Page />
  </Suspense>
);

// Campaign page (its line items) and the line item editor under it.
export const CampaignViewConfig = {
  path: "/campaign/view/:id",
  title: "Campaign",
  element: lazyPage(CampaignView),
};

export const LineItemNewConfig = {
  path: "/campaign/view/:campaignId/line-item/new",
  title: "New Line Item",
  element: lazyPage(LineItemForm),
};

export const LineItemEditConfig = {
  path: "/campaign/view/:campaignId/line-item/:lineItemId",
  title: "Line Item",
  element: lazyPage(LineItemForm),
};
