import apiClient from "./apiClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const reversePickAPI = {
  // Get Reverse Pick document ID
  getReversePickDocId: async (params) => {
    const response = await apiClient.get(
      "/api/reversePick/getReversePickDocId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get all Reverse Picks
  getAllReversePicks: async (params) => {
    const response = await apiClient.get("/api/reversePick/getAllReversePick", {
      params,
    });
    return response?.data || response;
  },

  // Get Reverse Pick by ID
  getReversePickById: async (id) => {
    const response = await apiClient.get(
      "/api/reversePick/getReversePickById",
      {
        params: { id },
      }
    );
    return response?.data || response;
  },

  // Create/Update Reverse Pick
  createUpdateReversePick: async (data) => {
    const response = await apiClient.put(
      "/api/reversePick/createUpdateReversePick",
      data
    );
    return response?.data || response;
  },

  // Get Pick Request Details for Reverse Pick
  getPickRequestDetails: async (params) => {
    const response = await apiClient.get(
      "/api/reversePick/getPickRequestDetailsForReversePick",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Fill Grid Details
  getFillGridDetails: async (params) => {
    const response = await apiClient.get(
      "/api/reversePick/getFillGridDetailsForReversePick",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Export Reverse Pick to Excel
  exportReversePickToExcel: async (params) => {
    const response = await apiClient.get("/api/reversePick/exportToExcel", {
      params,
      responseType: "blob",
    });
    return response;
  },

  // Bulk upload Reverse Pick
  bulkUploadReversePick: async (formData) => {
    const response = await apiClient.post(
      "/api/reversePick/ExcelUploadForReversePick",
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
