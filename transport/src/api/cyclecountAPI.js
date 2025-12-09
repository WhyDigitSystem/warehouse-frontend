import apiClient from "./apiClient";

export const cyclecountAPI = {
  // Get Cycle Count document ID
  getCycleCountDocId: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getCycleCountInDocId",
      { params }
    );
    return response?.data || response;
  },

  // Get all Cycle Count
  getAllCycleCount: async (params) => {
    const response = await apiClient.get("/api/cycleCount/getAllCycleCount", {
      params,
    });
    return response?.data || response;
  },

  // Get Part No by Cycle Count
  getPartNoByCycleCount: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getPartNoByCycleCount",
      { params }
    );
    return response?.data || response;
  },

  // Get GRN No by Cycle Count
  getGrnNoByCycleCount: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getGrnNoByCycleCount",
      { params }
    );
    return response?.data || response;
  },

  // Get Batch by Cycle Count
  getBatchByCycleCount: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getBatchByCycleCount",
      { params }
    );
    return response?.data || response;
  },

  // Get Bin Details by Cycle Count
  getBinDetailsByCycleCount: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getBinDetailsByCycleCount",
      { params }
    );
    return response?.data || response;
  },

  // Get Available Quantity by Cycle Count
  getAvlQtyByCycleCount: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getAvlQtyByCycleCount",
      { params }
    );
    return response?.data || response;
  },

  // Get Cycle Count Grid Details
  getCycleCountGridDetails: async (params) => {
    const response = await apiClient.get(
      "/api/cycleCount/getCycleCountGridDetails",
      { params }
    );
    return response?.data || response;
  },

  // Create/Update Cycle Count
  saveCycleCount: async (data) => {
    const response = await apiClient.put(
      "/api/cycleCount/createUpdateCycleCount",
      data
    );
    return response?.data || response;
  },
};
