import apiClient from "./apiClient";

export const masterAPI = {
  // Your existing functions

  // ... other existing functions

  // ⭐⭐⭐ STATE MASTER APIS - Updated to match your pattern ⭐⭐⭐
  getStates: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/state", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  getStateById: async (stateId) => {
    const res = await apiClient.get(`/api/commonmaster/state/${stateId}`);
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  getStatesByCountry: async (orgid, country) => {
    const res = await apiClient.get("/api/commonmaster/state/country", {
      params: { orgid, country },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  // ⭐⭐⭐ ADD THIS SAVE STATE FUNCTION ⭐⭐⭐
  saveState: async (payload) => {
    return await apiClient.post("/api/commonmaster/state", payload);
  },

  updateState: async (stateId, payload) => {
    return await apiClient.put(
      `/api/commonmaster/createUpdateState/${stateId}`,
      payload
    );
  },
};
