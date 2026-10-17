import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store";
import { approvalService } from "@/services/approval";
import { isNetworkUser } from "@/utils/roles";

// Where the signed-in user is working and what that allows:
//   - network users: always inside their own network
//   - org users / super admins: at org level, or inside a network they entered
// Org team members' rights come from their permission checklist.
export const useScope = () => {
  const user = useAppStore((s) => s.user);
  const selectedNetwork = useAppStore((s) => s.selectedNetwork);
  const networkUser = isNetworkUser(user);
  const orgAdmin = user?.type === "admin" || user?.type === "super_admin";
  const team = user?.type === "team";

  const { data: me } = useQuery({
    queryKey: ["myPermissions", user?._id],
    queryFn: () => approvalService.myPermissions(),
    enabled: team,
    staleTime: 5 * 60 * 1000,
  });
  const perms: Record<string, string[]> = me?.data?.config?.status === "active" ? me?.data?.config?.permissions || {} : {};

  const network = networkUser
    ? user?.networkId
      ? { id: user.networkId, name: user.networkName || "Your network" }
      : null
    : selectedNetwork;

  return {
    user,
    networkUser,
    // The network everything is filtered to right now (null = whole org).
    network,
    // At org level: show network columns, filters and pickers.
    orgLevel: !network,
    // Org users who entered a network can leave it again.
    enteredNetwork: !networkUser ? selectedNetwork : null,
    canManageNetworks: !networkUser && (orgAdmin || (perms.network || []).includes("view")),
    canApprove: !networkUser && (orgAdmin || (perms.campaign || []).includes("approve")),
  };
};
