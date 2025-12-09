import apiClient from "./apiClient";

export const multipleBOAPI = {
  // Get pending buyer orders
  getPendingBuyerOrderDetails: async (params) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getPendingBuyerOrderDetails",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Create multiple buyer orders
  createMultipleBuyerOrder: async (data) => {
    const response = await apiClient.put(
      "/api/buyerOrder/createMultipleBuyerOrder",
      data
    );
    return response?.data || response;
  },

  // Excel upload for buyer order
  excelUploadForBuyerOrder: async (params, formData) => {
    const response = await apiClient.post(
      "/api/buyerOrder/ExcelUploadForBuyerOrder",
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
