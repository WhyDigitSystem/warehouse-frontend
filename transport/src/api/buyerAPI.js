import apiClient from "./apiClient";

export const buyerAPI = {
  // Get all buyers
  getBuyers: async (orgid, client, cbranch) => {
    try {
      console.log("🔍 [API] Fetching buyers:", { orgid, client, cbranch });

      const response = await apiClient.get(
        "/api/warehousemastercontroller/buyer",
        {
          params: { orgid, client, cbranch },
        }
      );

      console.log("📥 [API] Buyers Response:", response);

      return (
        response?.data?.paramObjectsMap?.buyerVO ||
        response?.paramObjectsMap?.buyerVO ||
        []
      );
    } catch (error) {
      console.error("❌ [API] Error fetching buyers:", error);
      throw error;
    }
  },

  // Save buyer
  saveBuyer: async (payload) => {
    console.log("📤 [API] Buyer Save Payload:", payload);

    const response = await apiClient.put(
      "/api/warehousemastercontroller/buyer",
      payload
    );

    console.log("📥 [API] Buyer Save Response:", response);

    return response.data || response;
  },

  // Upload buyers
  uploadBuyers: async (formData) => {
    return await apiClient.post(
      "/api/warehousemastercontroller/BuyerUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  // Get countries
  getCountries: async (orgid) => {
    const response = await apiClient.get("/api/commonmaster/country", {
      params: { orgid },
    });

    return (
      response?.data?.paramObjectsMap?.countryVO ||
      response?.paramObjectsMap?.countryVO ||
      []
    );
  },

  // Get states
  getStates: async (orgid, country) => {
    const response = await apiClient.get("/api/commonmaster/state", {
      params: { orgid, country },
    });

    return (
      response?.data?.paramObjectsMap?.stateVO ||
      response?.paramObjectsMap?.stateVO ||
      []
    );
  },

  getAllUnits: async (orgId) => {
    try {
      const response = await apiClient.get(`/units?orgId=${orgId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Get cities
  getCities: async (orgid, state) => {
    const response = await apiClient.get("/api/commonmaster/city/state", {
      params: { orgid, state },
    });

    return (
      response?.data?.paramObjectsMap?.cityVO ||
      response?.paramObjectsMap?.cityVO ||
      []
    );
  },
};
