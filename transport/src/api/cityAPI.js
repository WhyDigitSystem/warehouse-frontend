import apiClient from "./apiClient";

// In your masterAPI file
export const masterAPI = {
  // ... your existing functions

  // ⭐⭐⭐ CITY MASTER APIS ⭐⭐⭐
  getCities: async (orgid) => {
    try {
      const res = await apiClient.get("/api/commonmaster/city", {
        params: { orgid: orgid },
      });
      // Handle different response structures
      return res?.data || res?.paramObjectsMap?.cityVO || res || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  getCityById: async (cityId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/city/${cityId}`);
      return res?.data || res?.paramObjectsMap?.cityVO || res || null;
    } catch (error) {
      console.error("Error fetching city:", error);
      throw error;
    }
  },

  getCitiesByState: async (orgid, state) => {
    try {
      const res = await apiClient.get("/api/commonmaster/city/state", {
        params: { orgid, state },
      });
      return res?.data || res?.paramObjectsMap?.cityVO || res || [];
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  },

  // Unified create/update function
  saveCity: async (payload) => {
    try {
      if (payload.id) {
        // Update existing city
        return await apiClient.put(
          `/api/commonmaster/city/${payload.id}`,
          payload
        );
      } else {
        // Create new city
        return await apiClient.post("/api/commonmaster/city", payload);
      }
    } catch (error) {
      console.error("Error saving city:", error);
      throw error;
    }
  },

  // Alternative separate functions
  updateCity: async (cityId, payload) => {
    return await apiClient.put(`/api/commonmaster/city/${cityId}`, payload);
  },

  createCity: async (payload) => {
    return await apiClient.post("/api/commonmaster/city", payload);
  },
};
