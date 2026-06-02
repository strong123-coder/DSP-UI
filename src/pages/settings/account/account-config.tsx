import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Account = React.lazy(() => import("./account"));

const AccountContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Account />
    </Suspense>
  );
};

const AccountConfig = {
  path: "/settings/account",
  element: <AccountContainer />,
};

export default AccountConfig;
