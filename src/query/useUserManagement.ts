import { useMutation } from "@tanstack/react-query";
import { userManagement } from "@/services/userManagement-service";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";
import type { LoginFormValues } from "@/utils/schemas/auth";

export const useLogin = () => {
  const loginAction = useAppStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => userManagement.login(payload),
    onSuccess: (response: any) => {
      const message = response?.data?.message || "Logged in successfully";
      const token = response?.data?.data?.token;
      const user = response?.data?.data?.user;

      if (token && user) {
        const storeUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
          orgId: user.orgId,
        };
        loginAction(token, storeUser);
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
