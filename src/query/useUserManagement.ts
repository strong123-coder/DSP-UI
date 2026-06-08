import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { userService } from "@/services/user";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";
import type { LoginFormValues } from "@/utils/schemas/auth";
import { apiClient } from "@/api/apiClient";
import { useEffect } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import type { AddUserFormValues, EditUserFormValues } from "@/utils/schemas/user";

export const useLogin = () => {
  const loginAction = useAppStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => authService.login(payload),
    onSuccess: async (response: any) => {
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

        try {
          const configResponse = await apiClient().get("getOrgConfig");
          sessionStorage.setItem("orgConfig", JSON.stringify(configResponse.data));
        } catch (error) {
          console.error("Failed to fetch org config:", error);
        }

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

export const useGetUser = (
  initialized: boolean,
  payload: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
  },
) => {
  return useQuery({
    queryKey: [
      "users",
      payload?.page,
      payload?.limit,
      payload?.search,
      payload?.type,
      payload?.status,
    ],
    queryFn: () => userService.userList(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetUserPrefetch = (
  isPlaceholderData: boolean,
  totalPages: number,
  page: number,
  limit: number,
  search?: string,
  type?: string,
  status?: string,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isPlaceholderData) return;

    const query = (payload: {
      page: number;
      limit: number;
      search?: string;
      type?: string;
      status?: string;
    }) => {
      queryClient.prefetchQuery({
        queryKey: [
          "users",
          payload?.page,
          payload?.limit,
          payload?.search,
          payload?.type,
          payload?.status,
        ],
        queryFn: () => userService.userList(payload),
      });
    };

    if (page < totalPages) {
      query({ page: page + 1, limit, search, type, status });
    }
    if (page === 1 && page + 1 < totalPages) {
      query({ page: page + 2, limit, search, type, status });
    }
    if (page > 1) {
      query({ page: page - 1, limit, search, type, status });
    }
    if (page - 2 > 0 && page === totalPages) {
      query({ page: page - 2, limit, search, type, status });
    }
  }, [
    isPlaceholderData,
    totalPages,
    page,
    limit,
    search,
    type,
    status,
    queryClient,
  ]);
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (response: any) => {
      const message =
        response?.message ||
        response?.data?.message ||
        "User deleted successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (
      error: AxiosError<{ message?: string; data?: { message?: string } }>,
    ) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddUserFormValues) => userService.addUser(payload),
    onSuccess: (response: any) => {
      const message =
        response?.message ||
        response?.data?.message ||
        "User created successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (
      error: AxiosError<{ message?: string; data?: { message?: string } }>,
    ) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};

export const useGetSingleUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getUser(id),
    enabled: enabled && !!id,
  });
};

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: EditUserFormValues;
    }) => userService.editUser(id, payload),
    onSuccess: (response: any, variables) => {
      const message =
        response?.message ||
        response?.data?.message ||
        "User updated successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (
      error: AxiosError<{ message?: string; data?: { message?: string } }>,
    ) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};
