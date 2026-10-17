import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { approvalService, type ApprovalKind, type ApprovalStatus, type ReviewPayload } from "@/services/approval";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useApprovalQueue = (status: ApprovalStatus, enabled = true) =>
  useQuery({ queryKey: ["approvalQueue", status], queryFn: () => approvalService.queue(status), enabled });

// Sidebar badge: refreshed every minute while the app is open.
export const useApprovalCount = (enabled = true) =>
  useQuery({
    queryKey: ["approvalCount"],
    queryFn: () => approvalService.count(),
    enabled,
    refetchInterval: 60_000,
  });

// Anything that shows an approval pill reads campaigns, line items or creatives.
const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    for (const key of ["approvalQueue", "approvalCount", "campaigns", "campaign", "lineItems", "lineItem", "creatives"]) {
      qc.invalidateQueries({ queryKey: [key] });
    }
  };
};

export const useReview = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: ReviewPayload) => approvalService.review(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Done");
      invalidate();
    },
    onError: onErr,
  });
};

export const useResubmit = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: ApprovalKind; id: string }) => approvalService.resubmit(kind, id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Sent for approval");
      invalidate();
    },
    onError: onErr,
  });
};
