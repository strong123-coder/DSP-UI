import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { campaignService } from "@/services/campaign";
import { extractApiErrors } from "@/utils/getErrorMessage";
import type { AddCampaignFormValues, EditCampaignFormValues } from "@/utils/schemas/campaign";

// MCP campaigns go through the same campaign endpoints with type "mcp".
const onErr = (error: AxiosError<{ message?: string }>) =>
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));

export const useSaveMcpCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: object }) =>
      // The wizard's form types don't cover the `mcp` block; the API validates it.
      id
        ? campaignService.editCampaign(id, payload as unknown as EditCampaignFormValues)
        : campaignService.addCampaign(payload as unknown as AddCampaignFormValues),
    onSuccess: (r, v) => {
      toast.success(r?.data?.message || "Campaign saved");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      if (v.id) qc.invalidateQueries({ queryKey: ["campaign", v.id] });
    },
    onError: onErr,
  });
};
