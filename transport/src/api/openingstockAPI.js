import apiClient from "./apiClient";

export const openingStockAPI = {
  // Get opening stock list
  getOpeningStockList: async (params) => {
    const response = await apiClient.get(
      "/api/openingStock/getOpeningStockList",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Create opening stock
  createOpeningStock: async (data) => {
    const response = await apiClient.post(
      "/api/openingStock/createOpeningStock",
      data
    );
    return response?.data || response;
  },

  // Update opening stock
  updateOpeningStock: async (data) => {
    const response = await apiClient.put(
      "/api/openingStock/updateOpeningStock",
      data
    );
    return response?.data || response;
  },

  // Delete opening stock
  deleteOpeningStock: async (params) => {
    const response = await apiClient.delete(
      "/api/openingStock/deleteOpeningStock",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get parts
  getParts: async (params) => {
    const response = await apiClient.get("/api/openingStock/getParts", {
      params,
    });
    return response?.data || response;
  },

  // Get bins
  getBins: async (params) => {
    const response = await apiClient.get("/api/openingStock/getBins", {
      params,
    });
    return response?.data || response;
  },

  // Get UOMs
  getUOMs: async (params) => {
    const response = await apiClient.get("/api/openingStock/getUOMs", {
      params,
    });
    return response?.data || response;
  },

  // Excel upload
  excelUpload: async (params, formData) => {
    const response = await apiClient.post(
      "/api/openingStock/upload",
      formData,
      {
        params,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response?.data || response;
  },
};
