import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  targetingListService,
  type TargetingList,
  type TargetingListKind,
  type TargetingListParams,
} from "@/services/targetingList";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useTargetingLists = (params: TargetingListParams) =>
  useQuery({
    queryKey: ["targetingLists", params],
    queryFn: () => targetingListService.list(params),
    placeholderData: keepPreviousData,
  });

// networkId (org level): only lists that network's line items may use.
export const useTargetingListOptions = (kind: TargetingListKind = "bundle", networkId?: string) =>
  useQuery({
    queryKey: ["targetingListOptions", kind, networkId || ""],
    queryFn: () => targetingListService.options(kind, networkId),
  });

export const useTargetingList = (id?: string) =>
  useQuery({ queryKey: ["targetingList", id], queryFn: () => targetingListService.get(id as string), enabled: !!id });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["targetingLists"] });
    qc.invalidateQueries({ queryKey: ["targetingListOptions"] });
    qc.invalidateQueries({ queryKey: ["targetingList"] });
  };
};

export const useCreateTargetingList = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<TargetingList>) => targetingListService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "List created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateTargetingList = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TargetingList> }) =>
      targetingListService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "List updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteTargetingList = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => targetingListService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "List deleted");
      invalidate();
    },
    onError: onErr,
  });
};
