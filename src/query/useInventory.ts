import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { inventoryService, type InventoryAppsParams } from "@/services/inventory";
import { extractApiErrors } from "@/utils/getErrorMessage";

export const useInventoryApps = (params: InventoryAppsParams) =>
  useQuery({
    queryKey: ["inventoryApps", params],
    queryFn: () => inventoryService.apps(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

export const useInventoryFacets = (country: string) =>
  useQuery({ queryKey: ["inventoryFacets", country], queryFn: () => inventoryService.facets(country), staleTime: 5 * 60 * 1000 });

export const useInventoryPartners = () =>
  useQuery({ queryKey: ["inventoryPartners"], queryFn: () => inventoryService.partners(), staleTime: Infinity });

// Super admin only.
export const useInventoryUploads = () =>
  useQuery({ queryKey: ["inventoryUploads"], queryFn: () => inventoryService.uploads() });

export const useUploadInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { country: string; fileName?: string; csv: string }) => inventoryService.upload(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Inventory loaded");
      for (const key of ["inventoryUploads", "inventoryApps", "inventoryFacets"]) qc.invalidateQueries({ queryKey: [key] });
    },
    onError: (error: AxiosError<{ message?: string }>) => extractApiErrors(error.response?.data).forEach((m) => toast.error(m)),
  });
};
