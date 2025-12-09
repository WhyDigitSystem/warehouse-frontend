import apiClient from "./apiClient";

export const vasPutawayAPI = {
  // Get VAS Putaway Document ID
  getVasPutawayDocId: async (params) => {
    const response = await apiClient.get("/api/vasputaway/getVasPutawayDocId", {
      params,
    });
    return response?.data || response;
  },

  // Get all VAS Putaways
  getAllVasPutaway: async (params) => {
    const response = await apiClient.get("/api/vasputaway/getAllVasPutaway", {
      params,
    });
    return response?.data || response;
  },

  // Get VAS Putaway by ID
  getVasPutawayById: async (id) => {
    const response = await apiClient.get("/api/vasputaway/getVasPutawayById", {
      params: { id },
    });
    return response?.data || response;
  },

  // Create/Update VAS Putaway
  createUpdateVasPutaway: async (data) => {
    const response = await apiClient.put(
      "/api/vasputaway/createUpdateVasPutaway",
      data
    );
    return response?.data || response;
  },

  // Get VAS Pick No dropdown list
  getDocIdFromVasPick: async (params) => {
    const response = await apiClient.get(
      "/api/vasputaway/getDocIdFromVasPickForVasPutaway",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get fill grid details
  getFillGridFromVasPutaway: async (params) => {
    const response = await apiClient.get(
      "/api/vasputaway/getAllFillGridFromVasPutaway",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get To Bin details
  getToBinDetailsVasPutaway: async (params) => {
    const response = await apiClient.get(
      "/api/vasputaway/getToBinDetailsVasPutaway",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
