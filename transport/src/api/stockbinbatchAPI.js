// stockBinBatchAPI.js
import apiClient from "./apiClient";

export const stockBinBatchAPI = {
  // Get part list
  getPartList: async (params) => {
    const response = await apiClient.get(
      "/api/Reports/getPartNoForStockReportBinAndBatchWise",
      { params }
    );
    return response?.data || response;
  },

  // Get batch list
  getBatchList: async (params) => {
    const response = await apiClient.get(
      "/api/Reports/getBatchForStockReportBinAndBatchWise",
      { params }
    );
    return response?.data || response;
  },

  // Get bin list
  getBinList: async (params) => {
    const response = await apiClient.get(
      "/api/Reports/getBinForStockReportBinAndBatchWise",
      { params }
    );
    return response?.data || response;
  },

  // Get status list
  getStatusList: async (params) => {
    const response = await apiClient.get(
      "/api/Reports/getStatusForStockReportBinAndBatchWise",
      { params }
    );
    return response?.data || response;
  },

  // Get stock report
  getStockReport: async (params) => {
    const response = await apiClient.get(
      "/api/Reports/getStockReportBinAndBatchWise",
      { params }
    );
    return response?.data || response;
  },
};
