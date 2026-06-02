import { apiConfig, type ApiEndpoint } from "./config";
import instance from "./instance";

export const apiClient = () => {
  const getEndpoint = (name: string): ApiEndpoint => {
    const endpoints = apiConfig;
    const endpoint = endpoints && endpoints.find((e) => e.name === name);
    if (!endpoint) throw new Error(`Endpoint ${name} not found!`);
    return endpoint;
  };

  const constructUrl = (
    endpoint: ApiEndpoint,
    pathParams?: Record<string, string>
  ): string => {
    let url = endpoint.path;
    if (endpoint.hasPathParams && pathParams) {
      Object.keys(pathParams).forEach((param) => {
        url = url.replace(`{${param}}`, pathParams[param]);
      });
    }
    return url;
  };

  const get = async (
    name: string,
    params?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    try {
      const response = await instance.get(url, {
        params,
        headers,
      });
      return response;
    } catch (error) {
      console.error("GET request error:", error);
      throw error;
    }
  };

  const post = async (
    name: string,
    data?: object,
    config?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);

    try {
      const response = await instance.post(url, data, config);
      return response;
    } catch (error) {
      console.error("POST request error:", error);
      throw error;
    }
  };

  const patch = async (
    name: string,
    data?: object,
    config?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    try {
      const response = await instance.patch(url, data, config);
      return response;
    } catch (error) {
      console.error("PATCH request error:", error);
      throw error;
    }
  };

  const put = async (
    name: string,
    data?: object,
    config?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    try {
      const response = await instance.put(url, data, config);
      return response;
    } catch (error) {
      console.error("PUT request error:", error);
      throw error;
    }
  };

  const del = async (
    name: string,
    params?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    try {
      const response = await instance.delete(url, {
        params,
        headers,
      });
      return response;
    } catch (error) {
      console.error("DELETE request error:", error);
      throw error;
    }
  };

  return { get, post, patch, put, del };
};
