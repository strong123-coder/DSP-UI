import { apiClient } from "@/api/apiClient";
import type { AddUserFormValues, EditUserFormValues } from "@/utils/schemas/user";

export const userService = {
  userList: async (params?: object) => {
    const response = await apiClient().get("userList", params);
    return response.data;
  },
  addUser: async (payload: AddUserFormValues) => {
    const processedPayload = {
      ...payload,
      age: payload.age !== undefined && payload.age !== null && String(payload.age).trim() !== ""
        ? Number(payload.age)
        : undefined,
    };
    const response = await apiClient().post("addUser", processedPayload);
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await apiClient().get("getUser", undefined, undefined, { id });
    return response.data;
  },
  editUser: async (id: string, payload: EditUserFormValues) => {
    const processedPayload = {
      ...payload,
      age: payload.age !== undefined && payload.age !== null && String(payload.age).trim() !== ""
        ? Number(payload.age)
        : undefined,
    };
    const response = await apiClient().patch("editUser", processedPayload, {}, { id });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await apiClient().del("deleteUser", undefined, undefined, { id });
    return response.data;
  },
};
