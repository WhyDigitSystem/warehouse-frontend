import apiClient from "./apiClient";

export const grnAPI = {
  // Get new GRN document ID
  getNewGrnDocId: async (params) => {
    const response = await apiClient.get("/api/grn/getGRNDocid", {
      params,
    });
    return response;
  },

  // Get all GRNs
  getAllGrns: async (params) => {
    const response = await apiClient.get("/api/grn/getAllGrn", {
      params,
    });
    return response;
  },

  // Get GRN by ID
  getGrnById: async (id) => {
    const response = await apiClient.get("/api/grn/getGrnById", {
      params: { id },
    });
    return response;
  },

  // Create/Update GRN
  saveGrn: async (data) => {
    const response = await apiClient.put("/api/grn/createUpdateGRN", data);
    return response;
  },

  // Get gate pass IDs for pending GRN
  getGatePassIds: async (params) => {
    const response = await apiClient.get(
      "/api/grn/getGatePassInNoForPedningGRN",
      { params }
    );
    return response;
  },

  // Get gate pass details for pending GRN
  getGatePassGridDetails: async (params) => {
    const response = await apiClient.get(
      "/api/grn/getGatePassInDetailsForPendingGRN",
      { params }
    );
    return response;
  },

  // Get entry details
  getEntryNoDetails: async (params) => {
    const response = await apiClient.get("/api/gatePassIn/getEntryNoDetails", {
      params,
    });
    return response;
  },

  // Get entry fill details
  getEntryNoFillDetails: async (params) => {
    const response = await apiClient.get(
      "/api/gatePassIn/getEntryNoFillDetails",
      { params }
    );
    return response;
  },
};
