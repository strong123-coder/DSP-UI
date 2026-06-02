import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const Profile = React.lazy(() => import("./profile"));

const ProfileContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Profile />
    </Suspense>
  );
};

const ProfileConfig = {
  path: "/profile",
  element: <ProfileContainer />,
};

export default ProfileConfig;
