import apiClient from "./apiClient";

export const multipickRequestAPI = {
  getPendingPickDetails: async (params) => {
    const response = await apiClient.get(
      "/api/pickrequest/getPendingPickDetails",
      {
        params,
      }
    );
    return response.data || response;
  },

  createMultiplePickRequest: async (payload) => {
    const response = await apiClient.post(
      "/api/pickrequest/createMultiplePickRequest",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );
    return response.data || response;
  },
};
