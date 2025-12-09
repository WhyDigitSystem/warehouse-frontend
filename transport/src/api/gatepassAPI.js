import apiClient from "./apiClient";

export const gatePassInAPI = {
  // Get new document ID
  getNewDocId: async (params) => {
    const response = await apiClient.get("/api/gatePassIn/getGatePassInDocId", {
      params,
    });
    return response;
  },

  // Get all gate passes
  getAllGatePasses: async (params) => {
    const response = await apiClient.get("/api/gatePassIn/gatePassIn", {
      params,
    });
    return response;
  },

  // Get gate pass by ID
  getGatePassById: async (id) => {
    const response = await apiClient.get("/api/gatePassIn/gatePassIn", {
      params: { id },
    });
    return response;
  },

  // Create/Update gate pass
  saveGatePass: async (data) => {
    const response = await apiClient.put(
      "/api/gatePassIn/createUpdateGatePassIn",
      data
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

  // Get modes of shipment
  getModesOfShipment: async (orgId) => {
    const response = await apiClient.get(
      "/api/gatePassIn/getAllModeOfShipment",
      {
        params: { orgId },
      }
    );
    return response;
  },
};
