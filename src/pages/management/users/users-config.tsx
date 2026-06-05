import { Navigate } from "react-router";
import UsersListConfig from "./usersList/users-list-config";
import UsersAddConfig from "./usersAdd/users-add-config";
import UsersEditConfig from "./usersEdit/users-edit-config";

const UsersConfig = {
  path: "/management/users",
  title: "Users",
  children: [
    {
      index: true,
      element: <Navigate to="/management/users/list" replace />,
    },
    UsersListConfig,
    UsersAddConfig,
    UsersEditConfig,
  ],
};

export default UsersConfig;
