import apiClient from "./apiClient";

export const putawayAPI = {
  // Get Putaway document ID
  getPutAwayDocId: async (params) => {
    const response = await apiClient.get("/api/putaway/getPutAwayDocId", {
      params,
    });
    return response;
  },

  // Get all Putaways
  getAllPutaways: async (params) => {
    const response = await apiClient.get("/api/putaway/getAllPutAway", {
      params,
    });
    return response;
  },

  // Get Putaway by ID
  getPutAwayById: async (id) => {
    const response = await apiClient.get("/api/putaway/getPutAwayById", {
      params: { id },
    });
    return response;
  },

  // Create/Update Putaway
  savePutaway: async (data) => {
    const response = await apiClient.put(
      "/api/putaway/createUpdatePutAway",
      data
    );
    return response;
  },

  // Get GRN data for Putaway
  getGrnForPutaway: async (params) => {
    const response = await apiClient.get("/api/putaway/getGrnForPutaway", {
      params,
    });
    return response;
  },

  // Get Putaway grid details
  getPutawayGridDetails: async (params) => {
    const response = await apiClient.get("/api/putaway/getPutawayGridDetails", {
      params,
    });
    return response;
  },

  // Bulk upload for Putaway
  bulkUploadPutaway: async (formData) => {
    const response = await apiClient.post(
      "/api/putaway/ExcelUploadForPutAway",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
};
