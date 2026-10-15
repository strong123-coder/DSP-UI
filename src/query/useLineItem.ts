import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { lineItemService, type LineItem } from "@/services/lineItem";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useLineItems = (campaignId?: string) =>
  useQuery({
    queryKey: ["lineItems", campaignId],
    queryFn: () => lineItemService.list(campaignId as string),
    enabled: !!campaignId,
  });

export const useLineItem = (id?: string) =>
  useQuery({ queryKey: ["lineItem", id], queryFn: () => lineItemService.get(id as string), enabled: !!id });

export const useTargetingOptions = () =>
  useQuery({
    queryKey: ["lineItemTargetingOptions"],
    queryFn: () => lineItemService.targetingOptions(),
    staleTime: 5 * 60 * 1000,
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["lineItems"] });
    qc.invalidateQueries({ queryKey: ["lineItem"] });
    qc.invalidateQueries({ queryKey: ["campaigns"] }); // list shows line item counts
  };
};

export const useCreateLineItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<LineItem>) => lineItemService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Line item created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateLineItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LineItem> }) => lineItemService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Line item updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useLineItemStatus = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" }) =>
      lineItemService.changeStatus(id, status),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Status updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteLineItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => lineItemService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Line item deleted");
      invalidate();
    },
    onError: onErr,
  });
};
