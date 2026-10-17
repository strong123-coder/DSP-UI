import type { User } from "@/store/slices/authSlice";

// Network users are bound to one network in their org (see the backend's
// user TYPE). Everything else they can reach is filtered to that network.
export const NETWORK_TYPES = ["network_admin", "network_team"];

export const isNetworkUser = (user?: Pick<User, "type"> | null) => NETWORK_TYPES.includes(user?.type || "");

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Org admin",
  team: "Org team",
  network_admin: "Network admin",
  network_team: "Network team",
  supply: "Publisher",
};

export const roleLabel = (type?: string) => ROLE_LABEL[type || ""] || type || "";

// The roles a user can be given where the users page is working: inside a
// network its users are network admins / team; at org level, org admins / team.
export const roleOptions = (inNetwork: boolean) =>
  inNetwork
    ? [
        { name: "Network admin", value: "network_admin" },
        { name: "Network team member", value: "network_team" },
      ]
    : [
        { name: "Admin", value: "admin" },
        { name: "Team Member", value: "team" },
      ];

export const isAdminRole = (type?: string) => type === "admin" || type === "network_admin";
