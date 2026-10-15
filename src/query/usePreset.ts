import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { presetService, type Preset, type PresetKind, type PresetParams } from "@/services/preset";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const usePresets = (params: PresetParams) =>
  useQuery({ queryKey: ["presets", params], queryFn: () => presetService.list(params), placeholderData: keepPreviousData });

export const usePresetOptions = (kind: PresetKind, advertiserId?: string, enabled = true) =>
  useQuery({
    queryKey: ["presetOptions", kind, advertiserId || null],
    queryFn: () => presetService.options(kind, advertiserId),
    enabled,
  });

// Fetches a preset's settings on demand (when the user applies it).
export const useFetchPreset = () => {
  const qc = useQueryClient();
  return (id: string) =>
    qc.fetchQuery({ queryKey: ["preset", id], queryFn: () => presetService.get(id) }).then((r: any) => r?.data?.data as Preset);
};

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["presets"] });
    qc.invalidateQueries({ queryKey: ["presetOptions"] });
    qc.invalidateQueries({ queryKey: ["preset"] });
  };
};

export const useCreatePreset = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<Preset>) => presetService.create(payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Preset saved");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdatePreset = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Preset> }) => presetService.update(id, payload),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Preset updated");
      invalidate();
    },
    onError: onErr,
  });
};

export const useDeletePreset = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => presetService.remove(id),
    onSuccess: (r: any) => {
      toast.success(r?.data?.message || "Preset deleted");
      invalidate();
    },
    onError: onErr,
  });
};
