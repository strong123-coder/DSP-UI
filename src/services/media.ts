import { apiClient } from "@/api/apiClient";

export const mediaService = {
  addMedia: async (payload: FormData) => {
    const response = await apiClient().post("addMedia", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  deleteMedia: async (id: string) => {
    const response = await apiClient().del("deleteMedia", undefined, undefined, { id });
    return response.data;
  },
  deleteMedias: async (ids: string[]) => {
    const response = await apiClient().post("deleteMedias", { ids });
    return response.data;
  },
};
