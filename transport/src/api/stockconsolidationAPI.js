import apiClient from "./apiClient";

export const stockConsolidationAPI = {
  // Get stock consolidation report
  getStockConsolidation: async (params) => {
    const response = await apiClient.get("/api/Reports/getStockConsolidation", {
      params,
    });
    return response?.data || response;
  },

  // Get part list for autocomplete
  getPartList: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/material",
      { params }
    );
    return response?.data || response;
  },
};
