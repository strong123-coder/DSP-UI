import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Login = React.lazy(() => import("./login"));

const LoginContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Login />
    </Suspense>
  );
};

const LoginConfig = {
  path: "/login",
  element: <LoginContainer />,
};

export default LoginConfig;
