import apiClient from "./apiClient";

export const stockConsolidationBinWiseAPI = {
  // Get stock report bin wise
  getStockReportBinWise: async (params) => {
    const response = await apiClient.get("/api/Reports/getStockReportBinWise", {
      params,
    });
    return response?.data || response;
  },

  // Get bin list for selected part
  getBinNoForBinWise: async (params) => {
    const response = await apiClient.get("/api/Reports/getBinNoForBinWise", {
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
