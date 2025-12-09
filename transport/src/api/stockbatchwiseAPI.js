// src/api/stockBatchWiseAPI.js
import apiClient from "./apiClient";

export const stockBatchWiseAPI = {
  // Get part list for batch wise report
  getPartNoForBatchWiseReport: async (params) => {
    try {
      const response = await apiClient.get(
        `/api/Reports/getPartNoForBatchWiseReport`,
        { params }
      );
      return response;
    } catch (error) {
      console.error("Error fetching part list for batch wise:", error);
      throw error;
    }
  },

  // Get batch list for selected part
  getBatchForBatchWiseReport: async (params) => {
    try {
      const response = await apiClient.get(
        `/api/Reports/getBatchForBatchWiseReport`,
        { params }
      );
      return response;
    } catch (error) {
      console.error("Error fetching batch list:", error);
      throw error;
    }
  },

  // Get stock batch wise report
  getStockReportBatchWise: async (params) => {
    try {
      const response = await apiClient.get(
        `/api/Reports/getStockReportBatchWise`,
        { params }
      );
      return response;
    } catch (error) {
      console.error("Error fetching stock batch wise:", error);
      throw error;
    }
  },
};
