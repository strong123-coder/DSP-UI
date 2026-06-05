import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";
import UsersAdd from "./users-add";

const UsersAddContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UsersAdd />
    </Suspense>
  );
};

const UsersAddConfig = {
  path: "/management/users/add",
  title: "Add User",
  element: <UsersAddContainer />,
};

export default UsersAddConfig;
