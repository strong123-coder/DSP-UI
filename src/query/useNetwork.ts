import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  networkService,
  type NetworkLoginPayload,
  type NetworkParams,
  type NetworkPayload,
  type NetworkStatus,
} from "@/services/network";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useNetworks = (params: NetworkParams, enabled = true) =>
  useQuery({
    queryKey: ["networks", params],
    queryFn: () => networkService.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });

// Network picker choices (org level only: network users can't list networks).
export const useNetworkOptions = (enabled = true) =>
  useQuery({ queryKey: ["networkOptions"], queryFn: () => networkService.options(), enabled });

export const useNetwork = (id?: string) =>
  useQuery({ queryKey: ["network", id], queryFn: () => networkService.get(id as string), enabled: !!id });

export const useNetworkLogins = (networkId?: string) =>
  useQuery({
    queryKey: ["networkLogins", networkId],
    queryFn: () => networkService.logins(networkId as string),
    enabled: !!networkId,
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["networks"] });
    qc.invalidateQueries({ queryKey: ["networkOptions"] });
    qc.invalidateQueries({ queryKey: ["network"] });
    qc.invalidateQueries({ queryKey: ["networkLogins"] });
  };
};

export const useCreateNetwork = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: NetworkPayload) => networkService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Network created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateNetwork = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NetworkPayload }) => networkService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Network updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useNetworkStatus = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: NetworkStatus }) => networkService.changeStatus(id, status),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Network updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteNetwork = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => networkService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Network deleted");
      invalidate();
    },
    onError: onErr,
  });
};

export const useAddNetworkLogin = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: NetworkLoginPayload) => networkService.addLogin(payload),
    onSuccess: () => {
      toast.success("Login created");
      invalidate();
    },
    onError: onErr,
  });
};
