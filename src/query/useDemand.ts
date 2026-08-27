import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { demandService, type DemandListParams, type DemandPartner } from "@/services/demand";
import { extractApiErrors } from "@/utils/getErrorMessage";

export const useDemandList = (payload: DemandListParams) => {
  return useQuery({
    queryKey: ["demandList", payload],
    queryFn: () => demandService.list(payload),
    placeholderData: keepPreviousData,
  });
};

export const useDemandPartner = (id?: string) => {
  return useQuery({
    queryKey: ["demandPartner", id],
    queryFn: () => demandService.getById(id as string),
    enabled: !!id,
  });
};

const onErr = (error: AxiosError<{ message?: string }>) => {
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));
};

export const useCreateDemand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DemandPartner>) => demandService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Demand partner created");
      qc.invalidateQueries({ queryKey: ["demandList"] });
    },
    onError: onErr,
  });
};

export const useUpdateDemand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DemandPartner> }) =>
      demandService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Demand partner updated");
      qc.invalidateQueries({ queryKey: ["demandList"] });
    },
    onError: onErr,
  });
};

export const useDemandStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      demandService.changeStatus(id, status),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Status updated");
      qc.invalidateQueries({ queryKey: ["demandList"] });
    },
    onError: onErr,
  });
};

export const useDeleteDemand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demandService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Demand partner deleted");
      qc.invalidateQueries({ queryKey: ["demandList"] });
    },
    onError: onErr,
  });
};
