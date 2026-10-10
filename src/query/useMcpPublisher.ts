import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { authService } from "@/services/auth";
import {
  mcpPublisherService,
  mcpReviewService,
  type McpListParams,
} from "@/services/mcpPublisher";
import { useAppStore } from "@/store";
import { extractApiErrors } from "@/utils/getErrorMessage";
import type { SupplySignupFormValues } from "@/utils/schemas/auth";

const onErr = (error: AxiosError<{ message?: string }>) => {
  extractApiErrors(error.response?.data).forEach((m) => toast.error(m));
};

interface AuthResponse {
  data?: {
    message?: string;
    data?: { token?: string; user?: { _id: string; name: string; email: string; type: string; orgId?: string } };
  };
}

const useStoreSession = () => {
  const loginAction = useAppStore((state) => state.login);
  return (response: AuthResponse, fallback: string) => {
    const token = response?.data?.data?.token;
    const user = response?.data?.data?.user;
    if (!token || !user) {
      toast.error("Invalid response format from server");
      return;
    }
    loginAction(token, {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      orgId: user.orgId,
    });
    toast.success(response?.data?.message || fallback);
  };
};

// ---- supply auth ----

export const useSupplyLogin = () => {
  const store = useStoreSession();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) => authService.supplyLogin(payload),
    onSuccess: (r) => store(r, "Logged in successfully"),
    onError: onErr,
  });
};

export const useSupplySignup = () => {
  const store = useStoreSession();
  return useMutation({
    mutationFn: (payload: SupplySignupFormValues) => authService.supplySignup(payload),
    onSuccess: (r) => store(r, "Account created"),
    onError: onErr,
  });
};

// ---- publisher: MCP servers ----

export const useMcpCategories = () =>
  useQuery({
    queryKey: ["mcpCategories"],
    queryFn: () => mcpPublisherService.categories(),
    staleTime: Infinity,
  });

export const useMcpServers = (params: McpListParams) =>
  useQuery({
    queryKey: ["mcpServers", params],
    queryFn: () => mcpPublisherService.list(params),
    placeholderData: keepPreviousData,
  });

export const useMcpServer = (id?: string) =>
  useQuery({
    queryKey: ["mcpServer", id],
    queryFn: () => mcpPublisherService.get(id as string),
    enabled: !!id,
  });

export const useMcpKeys = (id?: string) =>
  useQuery({
    queryKey: ["mcpKeys", id],
    queryFn: () => mcpPublisherService.keys(id as string),
    enabled: !!id,
  });

export const useMcpIntegration = (id?: string) =>
  useQuery({
    queryKey: ["mcpIntegration", id],
    queryFn: () => mcpPublisherService.integration(id as string),
    enabled: !!id,
  });

const useInvalidateServer = () => {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: ["mcpServers"] });
    if (id) {
      qc.invalidateQueries({ queryKey: ["mcpServer", id] });
      qc.invalidateQueries({ queryKey: ["mcpKeys", id] });
      qc.invalidateQueries({ queryKey: ["mcpIntegration", id] });
    }
  };
};

export const useCreateMcpServer = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: (payload: object) => mcpPublisherService.create(payload),
    onSuccess: (r) => {
      toast.success(r?.data?.message || "MCP server created");
      invalidate();
    },
    onError: onErr,
  });
};

export const useUpdateMcpServer = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: object }) =>
      mcpPublisherService.update(id, payload),
    onSuccess: (r, v) => {
      toast.success(r?.data?.message || "MCP server updated");
      invalidate(v.id);
    },
    onError: onErr,
  });
};

export const useSubmitMcpServer = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: (id: string) => mcpPublisherService.submit(id),
    onSuccess: (r, id) => {
      toast.success(r?.data?.message || "Submitted for review");
      invalidate(id);
    },
    onError: onErr,
  });
};

export const useMcpServerStatus = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "live" | "paused" }) =>
      mcpPublisherService.changeStatus(id, status),
    onSuccess: (r, v) => {
      toast.success(r?.data?.message || "Status updated");
      invalidate(v.id);
    },
    onError: onErr,
  });
};

export const useDeleteMcpServer = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: (id: string) => mcpPublisherService.remove(id),
    onSuccess: (r) => {
      toast.success(r?.data?.message || "MCP server deleted");
      invalidate();
    },
    onError: onErr,
  });
};

export const useCreateMcpKey = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: ({ id, mode, label }: { id: string; mode: "test" | "live"; label?: string }) =>
      mcpPublisherService.createKey(id, { mode, label }),
    onSuccess: (_r, v) => invalidate(v.id),
    onError: onErr,
  });
};

export const useRevokeMcpKey = () => {
  const invalidate = useInvalidateServer();
  return useMutation({
    mutationFn: ({ id, keyId }: { id: string; keyId: string }) =>
      mcpPublisherService.revokeKey(id, keyId),
    onSuccess: (r, v) => {
      toast.success(r?.data?.message || "Key revoked");
      invalidate(v.id);
    },
    onError: onErr,
  });
};

// ---- super admin: review ----

export const useMcpReviewServers = (params: McpListParams) =>
  useQuery({
    queryKey: ["mcpReviewServers", params],
    queryFn: () => mcpReviewService.servers(params),
    placeholderData: keepPreviousData,
  });

export const useMcpReviewCampaigns = (params: { page?: number; limit?: number; reviewStatus?: string }) =>
  useQuery({
    queryKey: ["mcpReviewCampaigns", params],
    queryFn: () => mcpReviewService.campaigns(params),
    placeholderData: keepPreviousData,
  });

export const useMcpServerDecision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; decision: string; notes?: string; revShare?: number }) =>
      mcpReviewService.decideServer(id, payload),
    onSuccess: (r) => {
      toast.success(r?.data?.message || "Decision saved");
      qc.invalidateQueries({ queryKey: ["mcpReviewServers"] });
    },
    onError: onErr,
  });
};

export const useMcpCampaignDecision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; decision: string; notes?: string }) =>
      mcpReviewService.decideCampaign(id, payload),
    onSuccess: (r) => {
      toast.success(r?.data?.message || "Decision saved");
      qc.invalidateQueries({ queryKey: ["mcpReviewCampaigns"] });
    },
    onError: onErr,
  });
};
