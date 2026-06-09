import { Navigate } from "react-router-dom";
import MyProfileConfig from "./myProfile/my-profile-config";

const ProfileConfig = {
  path: "/profile",
  title: "Profile",
  children: [
    {
      index: true,
      element: <Navigate to="/profile/view" replace />,
    },
    MyProfileConfig,
  ],
};

export default ProfileConfig;

