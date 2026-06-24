import { useQuery } from "@tanstack/react-query";
import { orgService } from "@/services/org";

export const useGetOrgConfig = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["orgConfig"],
    queryFn: () => orgService.getOrgConfig(),
    staleTime: Infinity, // Org config rarely changes during an active session
    enabled,
  });
};

export const useGetOrgList = () => {
  return useQuery({
    queryKey: ["orgList"],
    queryFn: () => orgService.orgList(),
    staleTime: 5 * 60 * 1000,
  });
};
