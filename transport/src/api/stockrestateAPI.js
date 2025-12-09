import apiClient from "./apiClient";

export const stockrestateAPI = {
  // Get Stock Restate document ID
  getStockRestateDocId: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getStockRestateDocId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get all Stock Restate
  getAllStockRestate: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getAllStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get From Bin Details
  getFromBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getFromBinDetailsForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get To Bin Details
  getToBinDetails: async (params) => {
    const response = await apiClient.get("/api/stockRestate/getToBinDetails", {
      params,
    });
    return response?.data || response;
  },

  // Get Part No Details
  getPartNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getPartNoDetailsForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get GRN No Details
  getGrnNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getGrnNoDetailsForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Batch No Details
  getBatchNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getbatchNoDetailsForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get From Qty
  getFromQty: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getFromQtyForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Fill Grid Details
  getFillGridDetails: async (params) => {
    const response = await apiClient.get(
      "/api/stockRestate/getFillGridDetailsForStockRestate",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Create/Update Stock Restate
  saveStockRestate: async (data) => {
    const response = await apiClient.put(
      "/api/stockRestate/createStockRestate",
      data
    );
    return response?.data || response;
  },

  // Bulk upload
  bulkUploadStockRestate: async (formData) => {
    const response = await apiClient.post(
      "/api/stockRestate/uploadStockRestate",
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
