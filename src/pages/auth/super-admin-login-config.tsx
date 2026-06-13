import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const SuperAdminLogin = React.lazy(() => import("./super-admin-login"));

const SuperAdminLoginContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperAdminLogin />
    </Suspense>
  );
};

const SuperAdminLoginConfig = {
  path: "/super-admin/login",
  element: <SuperAdminLoginContainer />,
};

export default SuperAdminLoginConfig;
