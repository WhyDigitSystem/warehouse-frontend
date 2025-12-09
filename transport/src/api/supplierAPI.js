import apiClient from "./apiClient";

export const supplierAPI = {
  // Get countries, states, cities
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
  getCity: async (orgid, state) => {
    const res = await apiClient.get("/api/commonmaster/city/state", {
      params: { orgid, state },
    });
    return res?.paramObjectsMap?.cityVO ?? [];
  },

  // Get cities

  // Add alias for getAllCities
  getAllCities: async (state, orgid) => {
    return supplierAPI.getCities(orgid, state);
  },
  // Supplier CRUD operations
  getSuppliers: async (orgid, client, cbranch) => {
    const res = await apiClient.get("/api/warehousemastercontroller/supplier", {
      params: { orgid, client, cbranch },
    });

    return (
      res?.data?.paramObjectsMap?.supplierVO ||
      res?.paramObjectsMap?.supplierVO ||
      []
    );
  },

  saveSupplier: async (payload) => {
    console.log("📤 [API] Supplier Save Payload:", payload);

    const response = await apiClient.put(
      "/api/warehousemastercontroller/createUpdateSupplier",
      payload
    );

    console.log("📥 [API] Supplier Save Response:", response);

    return response.data || response;
  },

  uploadSuppliers: async (formData) => {
    return await apiClient.post(
      "/api/warehousemastercontroller/SupplierUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
