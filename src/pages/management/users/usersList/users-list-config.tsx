import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const UsersList = React.lazy(() => import("./users-list"));

const UsersListContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UsersList />
    </Suspense>
  );
};

const UsersListConfig = {
  path: "/management/users/list",
  title: "Users List",
  element: <UsersListContainer />,
};

export default UsersListConfig;
