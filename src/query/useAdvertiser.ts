import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { advertiserService, type Advertiser, type AdvertiserListParams } from "@/services/advertiser";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useAdvertiserList = (params: AdvertiserListParams) =>
  useQuery({
    queryKey: ["advertisers", params],
    queryFn: () => advertiserService.list(params),
    placeholderData: keepPreviousData,
  });

export const useAdvertiserOptions = () =>
  useQuery({ queryKey: ["advertiserOptions"], queryFn: () => advertiserService.options() });

export const useAdvertiserCategories = () =>
  useQuery({
    queryKey: ["advertiserCategories"],
    queryFn: () => advertiserService.categories(),
    staleTime: Infinity,
  });

export const useAdvertiser = (id?: string) =>
  useQuery({ queryKey: ["advertiser", id], queryFn: () => advertiserService.get(id as string), enabled: !!id });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["advertisers"] });
    qc.invalidateQueries({ queryKey: ["advertiserOptions"] });
    qc.invalidateQueries({ queryKey: ["advertiser"] });
  };
};

export const useCreateAdvertiser = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<Advertiser>) => advertiserService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Advertiser created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateAdvertiser = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Advertiser> }) => advertiserService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Advertiser updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useAdvertiserStatus = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" }) =>
      advertiserService.changeStatus(id, status),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Status updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteAdvertiser = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => advertiserService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Advertiser deleted");
      invalidate();
    },
    onError: onErr,
  });
};
