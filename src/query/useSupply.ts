import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { supplyService, type SupplyListParams, type SupplyPartner } from "@/services/supply";
import { extractApiErrors } from "@/utils/getErrorMessage";

export const useSupplyList = (payload: SupplyListParams) => {
  return useQuery({
    queryKey: ["supplyList", payload],
    queryFn: () => supplyService.list(payload),
    placeholderData: keepPreviousData,
  });
};

export const useSupplyPartner = (id?: string) => {
  return useQuery({
    queryKey: ["supplyPartner", id],
    queryFn: () => supplyService.getById(id as string),
    enabled: !!id,
  });
};

const onErr = (error: AxiosError<{ message?: string }>) => {
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));
};

export const useCreateSupply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SupplyPartner>) => supplyService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Supply partner created");
      qc.invalidateQueries({ queryKey: ["supplyList"] });
    },
    onError: onErr,
  });
};

export const useUpdateSupply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SupplyPartner> }) =>
      supplyService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Supply partner updated");
      qc.invalidateQueries({ queryKey: ["supplyList"] });
    },
    onError: onErr,
  });
};

export const useSupplyStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      supplyService.changeStatus(id, status),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Status updated");
      qc.invalidateQueries({ queryKey: ["supplyList"] });
    },
    onError: onErr,
  });
};

export const useDeleteSupply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplyService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Supply partner deleted");
      qc.invalidateQueries({ queryKey: ["supplyList"] });
    },
    onError: onErr,
  });
};
