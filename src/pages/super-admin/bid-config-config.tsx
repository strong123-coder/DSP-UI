import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const BidConfig = React.lazy(() => import("./bid-config"));

// Content container; the guard + layout are applied by the /super-admin parent route.
const BidConfigContainer: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <BidConfig />
  </Suspense>
);

export default BidConfigContainer;
