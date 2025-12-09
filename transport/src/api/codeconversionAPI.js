import apiClient from "./apiClient";

export const codeconversionAPI = {
  // Get Code Conversion document ID
  getCodeConversionDocId: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getCodeConversionDocId",
      { params }
    );
    return response?.data || response;
  },

  // Get all Code Conversion
  getAllCodeConversion: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getAllCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Part No Details
  getPartNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getPartNoAndPartDescFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get GRN No Details
  getGrnNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getGrnNoAndGrnDateFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Bin Type Details
  getBinTypeDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getBinTypeFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Batch No Details
  getBatchNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getBatchNoFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Bin Details
  getBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getBinFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Available Quantity
  getAvailableQty: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getAvlQtyCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get Fill Grid Details
  getFillGridDetails: async (params) => {
    const response = await apiClient.get(
      "/api/codeconversion/getAllFillGridFromStockForCodeConversion",
      { params }
    );
    return response?.data || response;
  },

  // Get C Part No Details - FIXED
  getCPartNoDetails: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/material",
      {
        params: {
          cbranch: params.cbranch || params.branchCode,
          client: params.client,
          orgid: params.orgid || params.orgId,
        },
      }
    );
    return response?.data || response;
  },

  // Get C Bin Details
  getCBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/vasputaway/getToBinDetailsVasPutaway",
      { params }
    );
    return response?.data || response;
  },

  // Create/Update Code Conversion
  saveCodeConversion: async (data) => {
    const response = await apiClient.put(
      "/api/codeconversion/createUpdateCodeConversion",
      data
    );
    return response?.data || response;
  },
};
