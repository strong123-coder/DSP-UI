import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Users = React.lazy(() => import("./users"));

const UsersContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Users />
    </Suspense>
  );
};

const UsersConfig = {
  path: "/management/users",
  element: <UsersContainer />,
};

export default UsersConfig;
