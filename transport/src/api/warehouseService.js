import apiClient from "../api/apiClient";

export const warehouseService = {
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
