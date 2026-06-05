import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";
import UsersEdit from "./users-edit";

const UsersEditContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UsersEdit />
    </Suspense>
  );
};

const UsersEditConfig = {
  path: "/management/users/edit/:id",
  title: "Edit User",
  element: <UsersEditContainer />,
};

export default UsersEditConfig;
