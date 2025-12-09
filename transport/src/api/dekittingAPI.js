import apiClient from "./apiClient";

export const deKittingService = {
  // Get all DeKitting entries
  getAllDeKittingByOrgId: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getAllDeKittingByOrgId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get DeKitting by ID
  getDeKittingById: async (id) => {
    const response = await apiClient.get("/api/deKitting/getDeKittingById", {
      params: { id },
    });
    return response?.data || response;
  },

  // Create/Update DeKitting
  createUpdateDeKitting: async (data) => {
    const response = await apiClient.put(
      "/api/deKitting/createUpdateDeKitting",
      data
    );
    return response?.data || response;
  },

  // Get Document ID
  getDeKittingDocId: async (params) => {
    const response = await apiClient.get("/api/deKitting/getDeKittingDocId", {
      params,
    });
    return response?.data || response;
  },

  // Parent Table APIs
  getPartNoFromStockForDeKittingParent: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getPartNoFromStockForDeKittingParent",
      {
        params,
      }
    );
    return response?.data || response;
  },

  getGrnDetailsForDekittingParent: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getGrnDetailsForDekittingParent",
      {
        params,
      }
    );
    return response?.data || response;
  },

  getBatchNoForDeKittingParent: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getBatchNoForDeKittingParent",
      {
        params,
      }
    );
    return response?.data || response;
  },

  getBinForDeKittingParent: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getBinForDeKittingParent",
      {
        params,
      }
    );
    return response?.data || response;
  },

  getAvlQtyForDeKittingParent: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getAvlQtyForDeKittingParent",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Child Table APIs
  getPartNoforDeKittingChild: async (params) => {
    const response = await apiClient.get(
      "/api/deKitting/getPartNoforDeKittingChild",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Bin API (shared with warehouse)
  getAllBinDetails: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getAllBinDetails",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
