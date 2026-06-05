import React from "react";
import { useNavigate } from "react-router-dom";
import UsersListTable from "./components/users-list-table";
import AddUsersButton from "./components/add-users-button";

const UsersList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full">
      <UsersListTable />
      <AddUsersButton onClick={() => navigate("/management/users/add")} />
    </div>
  );
};

export default UsersList;
