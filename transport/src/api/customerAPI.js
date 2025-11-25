// masterAPI.js
import apiClient from "./apiClient";

export const masterAPI = {
  getCustomer: async (orgid) => {
    const res = await apiClient.get("/api/warehousemastercontroller/customer", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.CustomerVO ?? [];
  },

  saveCustomer: async (payload) => {
    return await apiClient.put(
      "/api/warehousemastercontroller/createUpdateCustomer",
      payload
    );
  },

  // Use this method for countries - consistent with your existing pattern
  getCountries: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/country", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.countryVO ?? [];
  },

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

  saveCountry: async (payload) => {
    return await apiClient.post(
      "/api/commonmaster/createUpdateCountry",
      payload
    );
  },

  // ⭐⭐⭐ ITEM MASTER APIS ⭐⭐⭐
  getItemMaster: async (cbranch, client, orgid) => {
    const res = await apiClient.get("/api/warehousemastercontroller/material", {
      params: { cbranch, client, orgid },
    });
    return res ?? [];
  },

  saveItemMaster: async (payload) => {
    return await apiClient.put(
      "/api/warehousemastercontroller/createUpdateMaterial",
      payload
    );
  },
};
