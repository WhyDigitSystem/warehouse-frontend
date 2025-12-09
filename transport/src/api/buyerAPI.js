// buyerAPI.js - Add alias functions
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

  // Add alias for getAllCountries
  getAllCountries: async (orgid) => {
    return buyerAPI.getCountries(orgid);
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

  // Get states - UPDATED to return full response
  // Get states - RETURN FULL RESPONSE
  getState: async (orgid, country) => {
    const res = await apiClient.get("/api/commonmaster/state/country", {
      params: { orgid, country },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  getCity: async (orgid, state) => {
    const res = await apiClient.get("/api/commonmaster/city/state", {
      params: { orgid, state },
    });
    return res?.paramObjectsMap?.cityVO ?? [];
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

  // Add alias for getAllCities
  getAllCities: async (state, orgid) => {
    return buyerAPI.getCities(orgid, state);
  },
};
