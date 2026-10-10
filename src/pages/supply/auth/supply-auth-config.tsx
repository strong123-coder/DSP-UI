import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SupplyLogin = React.lazy(() => import("./supply-login"));
const SupplySignup = React.lazy(() => import("./supply-signup"));

export const SupplyLoginConfig = {
  path: "/supply/login",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <SupplyLogin />
    </Suspense>
  ),
};

export const SupplySignupConfig = {
  path: "/supply/signup",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <SupplySignup />
    </Suspense>
  ),
};
