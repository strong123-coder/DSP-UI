import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/services/media";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";

export const useAddMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => mediaService.addMedia(payload),
    onSuccess: (response: any) => {
      const msg = response?.message || "Media uploaded successfully";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["medias"] });
    },
    onError: (error: AxiosError<{ message?: string; data?: { message?: string } }>) => {
      const errors = extractApiErrors(error.response?.data);
      errors.forEach((msg) => toast.error(msg));
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: (response: any) => {
      const msg = response?.result || "Media deleted successfully";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["medias"] });
    },
    onError: (error: AxiosError<{ message?: string; data?: { message?: string } }>) => {
      const errors = extractApiErrors(error.response?.data);
      errors.forEach((msg) => toast.error(msg));
    },
  });
};

export const useDeleteMedias = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => mediaService.deleteMedias(ids),
    onSuccess: (response: any) => {
      const msg = response?.result || "Medias deleted successfully";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["medias"] });
    },
    onError: (error: AxiosError<{ message?: string; data?: { message?: string } }>) => {
      const errors = extractApiErrors(error.response?.data);
      errors.forEach((msg) => toast.error(msg));
    },
  });
};
