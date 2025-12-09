import apiClient from "./apiClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const locationmovementAPI = {
  // Get Location Movement document ID
  getLocationMovementDocId: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getLocationMovementDocId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get all Location Movements
  getAllLocationMovements: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getAllLocationMovementByOrgId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Location Movement by Date Range
  getLocationMovementsByDateRange: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getAllLocationMovementByOrgId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Create/Update Location Movement
  createUpdateLocationMovement: async (data) => {
    const response = await apiClient.put(
      "/api/locationMovement/createUpdateLocationMovement",
      data
    );
    return response?.data || response;
  },

  // Get From Bins
  getAllFromBin: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getBinFromStockForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get To Bins
  getToBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getToBinFromLocationStatusForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Fill Grid Data
  getAllFillGrid: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getAllForLocationMovementDetailsFillGrid",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Part No List
  getPartNoList: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getPartNoAndPartDescFromStockForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get GRN No List
  getGrnNoList: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getGrnNoDetailsForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Batch No List
  getBatchNoList: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getBatchNoDetailsForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Available Quantity
  getAvlQty: async (params) => {
    const response = await apiClient.get(
      "/api/locationMovement/getFromQtyForLocationMovement",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
