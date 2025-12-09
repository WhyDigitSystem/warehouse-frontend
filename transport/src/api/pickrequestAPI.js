import apiClient from "./apiClient";

export const PickRequestAPI = {
  // Get new document ID
  getNewDocId: async (params) => {
    const response = await apiClient.get(
      "/api/pickrequest/getPickRequestDocId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get all Pick Requests
  getAllPickRequests: async (params) => {
    const response = await apiClient.get(
      "/api/pickrequest/getAllPickRequestByOrgId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Pick Request by ID
  getPickRequestById: async (id) => {
    const response = await apiClient.get(
      "/api/pickrequest/getPickRequestById",
      {
        params: { id },
      }
    );
    return response?.data || response;
  },

  // Get Buyer Reference Numbers for Pick Request
  getBuyerRefNoForPickRequest: async (params) => {
    const response = await apiClient.get(
      "/api/pickrequest/getBuyerRefNoForPickRequest",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Create/Update Pick Request
  savePickRequest: async (data) => {
    const response = await apiClient.put(
      "/api/pickrequest/createUpdatePickRequest",
      data
    );
    return response?.data || response;
  },

  // Update picked items
  updatePick: async (data) => {
    const response = await apiClient.post("/api/pickrequest/updatePick", data);
    return response?.data || response;
  },
};
