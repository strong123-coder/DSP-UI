import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store";

// Org user enters a network: from now on every page shows only that network's
// advertisers, campaigns and reports (the API client sends x-network-id).
export const useEnterNetwork = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const enterNetwork = useAppStore((s) => s.enterNetwork);
  return (network: { id: string; name: string }) => {
    enterNetwork(network);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "orgConfig" });
    navigate("/advertiser/list");
  };
};
