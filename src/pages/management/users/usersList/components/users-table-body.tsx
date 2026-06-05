import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "../../types";
import { useNavigate } from "react-router-dom";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useDeleteUser } from "@/query/useUserManagement";

interface UserTableBodyProps {
  users: User[];
  dataMapping: Record<string, string>;
  getDisplayValue: (user: User, key: string) => React.ReactNode;
  onViewUser: (user: User) => void;
}

const UserTableBody: React.FC<UserTableBodyProps> = ({
  users,
  dataMapping,
  getDisplayValue,
  onViewUser,
}) => {
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);
  const { mutate: deleteUserMutation, isPending: deleteUserPending } =
    useDeleteUser();

  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const orgConfigStr = sessionStorage.getItem("orgConfig");
      if (orgConfigStr) {
        const orgConfig = JSON.parse(orgConfigStr);
        const id = orgConfig?.data?.orgData?.adminId || null;
        setAdminId(id);
      }
    } catch (err) {
      console.error("Failed to parse orgConfig from sessionStorage:", err);
    }
  }, []);

  if (users.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={Object.keys(dataMapping).length + 1}
            className="text-center py-12 text-muted-foreground text-sm"
          >
            No users found. Click the floating "+" button to add one.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {users.map((user: User) => (
        <TableRow
          key={user._id}
          className="cursor-pointer"
          onClick={() => {
            onViewUser(user);
          }}
        >
          {Object.keys(dataMapping).map((key) => (
            <TableCell
              key={key}
              className="py-3.5 px-4 text-sm max-w-[200px] truncate"
            >
              {getDisplayValue(user, key)}
            </TableCell>
          ))}
          <TableCell
            className="py-3.5 px-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={user._id === adminId}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/management/users/edit/${user._id}`);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setShowDeleteModal(user);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
      <DeletePopupModal
        isOpen={!!showDeleteModal}
        title={<strong>Delete User</strong>}
        description={
          <span>
            Are you sure you want to delete the user{" "}
            <strong>{showDeleteModal?.name}</strong>? This action cannot be
            undone.
          </span>
        }
        cancelButtonAction={() => setShowDeleteModal(null)}
        deleteButtonAction={() => {
          if (showDeleteModal?._id) {
            deleteUserMutation(showDeleteModal._id, {
              onSuccess: () => {
                setShowDeleteModal(null);
              },
            });
          }
        }}
        isDeleting={deleteUserPending}
      />
    </TableBody>
  );
};

export const UserStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge
    className={
      status === "active"
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
        : status === "inactive"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
        : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10"
    }
    variant="outline"
  >
    <span className="capitalize">{status || "active"}</span>
  </Badge>
);

export const UserTypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge
    variant="outline"
    className={
      type === "admin"
        ? "capitalize text-sky-500 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/10"
        : "capitalize text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/10"
    }
  >
    {type}
  </Badge>
);

export default UserTableBody;
