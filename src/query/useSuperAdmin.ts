import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import {
  superAdminService,
  type SuperAdminRangeParams,
} from "@/services/superAdmin";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";

// Super-admin login: email + password only (no org). Stores token+user; the
// caller navigates to the super-admin dashboard on success.
export const useSuperAdminLogin = () => {
  const loginAction = useAppStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      authService.superAdminLogin(payload),
    onSuccess: (response: any) => {
      const message = response?.data?.message || "Logged in successfully";
      const token = response?.data?.data?.token;
      const user = response?.data?.data?.user;

      if (token && user) {
        loginAction(token, {
          _id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
        });
        toast.success(message);
      } else {
        toast.error("Invalid response format from server");
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};

export const useSuperAdminSummary = (payload: SuperAdminRangeParams) => {
  return useQuery({
    queryKey: ["superAdminSummary", payload?.preset, payload?.startDate, payload?.endDate],
    queryFn: () => superAdminService.dashboardSummary(payload),
    placeholderData: keepPreviousData,
  });
};

export const useSuperAdminOrgs = (payload: SuperAdminRangeParams) => {
  return useQuery({
    queryKey: ["superAdminOrgs", payload?.preset, payload?.startDate, payload?.endDate],
    queryFn: () => superAdminService.orgs(payload),
    placeholderData: keepPreviousData,
  });
};

// Live bid-engine counters. Polls on an interval so the dashboard updates in
// near real time; polling pauses while the browser tab is hidden.
export const useSuperAdminEngineCounts = (intervalMs = 5000) => {
  return useQuery({
    queryKey: ["superAdminEngineCounts"],
    queryFn: () => superAdminService.engineCounts(),
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
  });
};
