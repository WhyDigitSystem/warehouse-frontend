import apiClient from "./apiClient";

export const kittingAPI = {
  // Get Kitting by ID
  getKittingById: async (id) => {
    const response = await apiClient.get("/api/kitting/getKittingById", {
      params: { id },
    });
    return response?.data || response;
  },

  // Get all Kitting
  getAllKitting: async (params) => {
    const response = await apiClient.get("/api/kitting/getAllKitting", {
      params,
    });
    return response?.data || response;
  },

  // Create/Update Kitting
  createUpdateKitting: async (data) => {
    const response = await apiClient.put(
      "/api/kitting/createUpdateKitting",
      data
    );
    return response?.data || response;
  },

  // Get Kitting Document ID
  getKittingDocId: async (params) => {
    const response = await apiClient.get("/api/kitting/getKittingInDocId", {
      params,
    });
    return response?.data || response;
  },

  // Child APIs
  getPartNoByChild: async (params) => {
    const response = await apiClient.get("/api/kitting/getPartNOByChild", {
      params,
    });
    return response?.data || response;
  },

  getGrnNoByChild: async (params) => {
    const response = await apiClient.get("/api/kitting/getGrnNOByChild", {
      params,
    });
    return response?.data || response;
  },

  getBatchByChild: async (params) => {
    const response = await apiClient.get("/api/kitting/getBatchByChild", {
      params,
    });
    return response?.data || response;
  },

  getBinByChild: async (params) => {
    const response = await apiClient.get("/api/kitting/getBinByChild", {
      params,
    });
    return response?.data || response;
  },

  getSqtyByKitting: async (params) => {
    const response = await apiClient.get("/api/kitting/getSqtyByKitting", {
      params,
    });
    return response?.data || response;
  },

  // Parent APIs
  getPartNoByParent: async (params) => {
    const response = await apiClient.get("/api/kitting/getPartNOByParent", {
      params,
    });
    return response?.data || response;
  },

  getGrnNoByParent: async (params) => {
    const response = await apiClient.get("/api/kitting/getGrnNOByParent", {
      params,
    });
    return response?.data || response;
  },

  // Get Bin Details
  getAllBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getAllBinDetails",
      {
        params,
      }
    );
    return response?.data || response;
  },
};

export const warehouseAPI = {
  getAllBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getAllBinDetails",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
