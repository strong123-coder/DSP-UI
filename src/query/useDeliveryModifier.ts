import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  deliveryModifierService,
  type DeliveryModifier,
  type DeliveryModifierParams,
} from "@/services/deliveryModifier";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useDeliveryModifiers = (params: DeliveryModifierParams) =>
  useQuery({
    queryKey: ["deliveryModifiers", params],
    queryFn: () => deliveryModifierService.list(params),
    placeholderData: keepPreviousData,
  });

export const useDeliveryModifierOptions = (advertiserId?: string) =>
  useQuery({
    queryKey: ["deliveryModifierOptions", advertiserId],
    queryFn: () => deliveryModifierService.options(advertiserId as string),
    enabled: !!advertiserId,
  });

export const useDeliveryModifier = (id?: string | null) =>
  useQuery({ queryKey: ["deliveryModifier", id], queryFn: () => deliveryModifierService.get(id as string), enabled: !!id });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["deliveryModifiers"] });
    qc.invalidateQueries({ queryKey: ["deliveryModifierOptions"] });
    qc.invalidateQueries({ queryKey: ["deliveryModifier"] });
  };
};

export const useCreateDeliveryModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<DeliveryModifier>) => deliveryModifierService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Delivery modifier created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateDeliveryModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DeliveryModifier> }) => deliveryModifierService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Delivery modifier updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeleteDeliveryModifier = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => deliveryModifierService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Delivery modifier deleted");
      invalidate();
    },
    onError: onErr,
  });
};
