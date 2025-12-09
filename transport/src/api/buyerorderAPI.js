import apiClient from "./apiClient";

export const buyerOrderAPI = {
  // Get Buyer Order document ID
  getBuyerOrderDocId: async (params) => {
    const response = await apiClient.get("/api/buyerOrder/getBuyerOrderDocId", {
      params,
    });
    return response?.data || response;
  },

  // Get all Buyer Orders
  getAllBuyerOrders: async (params) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getAllBuyerOrderByOrgId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Buyer Order by ID
  getBuyerOrderById: async (id) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getAllBuyerOrderById",
      {
        params: { id },
      }
    );
    return response?.data || response;
  },

  // Create/Update Buyer Order
  saveBuyerOrder: async (data) => {
    const response = await apiClient.put(
      "/api/buyerOrder/createUpdateBuyerOrder",
      data
    );
    return response?.data || response;
  },

  // Get Part Numbers for Buyer Order
  getPartNoByBuyerOrder: async (params) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getPartNoByBuyerOrder",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Batch Numbers
  getBatchByBuyerOrder: async (params) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getBatchByBuyerOrder",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Available Quantity
  getAvlQtyForBuyerOrder: async (params) => {
    const response = await apiClient.get(
      "/api/buyerOrder/getAvlQtyForBuyerOrder",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get SKU Details by Order
  getBoSkuDetails: async (params) => {
    const response = await apiClient.get("/api/buyerOrder/getBoSkuDetails", {
      params,
    });
    return response?.data || response;
  },

  // Bulk upload for Buyer Order
  bulkUploadBuyerOrder: async (formData) => {
    const response = await apiClient.post(
      "/api/buyerOrder/ExcelUploadForBuyerOrder",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response?.data || response;
  },
};

// Additional API for buyer data
export const buyerAPI = {
  getAllActiveBuyer: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/buyer",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
