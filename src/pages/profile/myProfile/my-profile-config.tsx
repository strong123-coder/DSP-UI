import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const MyProfile = React.lazy(() => import("./my-profile"));

const MyProfileContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyProfile />
    </Suspense>
  );
};

const MyProfileConfig = {
  path: "/profile/view",
  title: "My Profile",
  element: <MyProfileContainer />,
};

export default MyProfileConfig;
