import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { creativeService, type CreativeCreatePayload } from "@/services/creative";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useCreatives = (advertiserId?: string, type?: "image" | "video") =>
  useQuery({
    queryKey: ["creatives", advertiserId, type],
    queryFn: () => creativeService.list({ advertiserId: advertiserId as string, type, limit: 200 }),
    enabled: !!advertiserId,
  });

export const useCreateCreative = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreativeCreatePayload) => creativeService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creatives"] }),
    onError: onErr,
  });
};

export const useDeleteCreative = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creativeService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Creative deleted");
      qc.invalidateQueries({ queryKey: ["creatives"] });
    },
    onError: onErr,
  });
};
