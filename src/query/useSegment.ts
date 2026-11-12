import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { segmentService, type SegmentListParams } from "@/services/segment";
import { extractApiErrors } from "@/utils/getErrorMessage";

export const useSegments = (params: SegmentListParams, enabled = true) =>
  useQuery({
    queryKey: ["segmentList", params],
    queryFn: () => segmentService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useSegmentFacets = (country = "IN") =>
  useQuery({ queryKey: ["segmentFacets", country], queryFn: () => segmentService.facets(country), staleTime: 5 * 60 * 1000 });

// The segments behind a line item's keys (sorted so the cache is shared).
export const useSegmentResolve = (keys: string[]) => {
  const sorted = [...new Set(keys)].sort();
  return useQuery({
    queryKey: ["segmentResolve", sorted],
    queryFn: () => segmentService.resolve(sorted),
    enabled: sorted.length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

// Super admin only.
export const useSegmentUploads = () => useQuery({ queryKey: ["segmentUploads"], queryFn: () => segmentService.uploads() });

export const useUploadSegments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { country: string; fileName: string; file: string }) => segmentService.upload(payload),
    onSuccess: (r: { data?: { message?: string } }) => {
      toast.success(r?.data?.message || "Segments loaded");
      for (const key of ["segmentUploads", "segmentList", "segmentFacets", "segmentResolve"]) qc.invalidateQueries({ queryKey: [key] });
    },
    onError: (error: AxiosError<{ message?: string }>) => extractApiErrors(error.response?.data).forEach((m) => toast.error(m)),
  });
};
