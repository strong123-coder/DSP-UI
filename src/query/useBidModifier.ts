import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { bidModifierService, type BidModifier, type BidModifierParams } from "@/services/bidModifier";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useModifierFields = () =>
  useQuery({ queryKey: ["bidModifierFields"], queryFn: () => bidModifierService.fields(), staleTime: Infinity });

export const useBidModifiers = (params: BidModifierParams) =>
  useQuery({
    queryKey: ["bidModifiers", params],
    queryFn: () => bidModifierService.list(params),
    placeholderData: keepPreviousData,
  });

export const useBidModifierOptions = (advertiserId?: string) =>
  useQuery({
    queryKey: ["bidModifierOptions", advertiserId],
    queryFn: () => bidModifierService.options(advertiserId as string),
    enabled: !!advertiserId,
  });

export const useBidModifier = (id?: string | null) =>
  useQuery({ queryKey: ["bidModifier", id], queryFn: () => bidModifierService.get(id as string), enabled: !!id });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["bidModifiers"] });
    qc.invalidateQueries({ queryKey: ["bidModifierOptions"] });
    qc.invalidateQueries({ queryKey: ["bidModifier"] });
  };
};

export const useCreateBidModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<BidModifier>) => bidModifierService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Bid modifier created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateBidModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BidModifier> }) => bidModifierService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Bid modifier updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteBidModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => bidModifierService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Bid modifier deleted");
      invalidate();
    },
    onError: onErr,
  });
};
