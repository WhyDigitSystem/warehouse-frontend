import apiClient from "./apiClient";

export const supplierAPI = {
  // Get countries, states, cities
  getCountries: async (orgId) => {
    const res = await apiClient.get("/api/commonmaster/country", {
      params: { orgid: orgId },
    });
    return res?.data?.paramObjectsMap?.countryVO || [];
  },

  getStates: async (orgId, country) => {
    const res = await apiClient.get("/api/commonmaster/state", {
      params: { orgid: orgId, country },
    });
    return res?.data?.paramObjectsMap?.stateVO || [];
  },

  getCities: async (orgId, state) => {
    const res = await apiClient.get("/api/commonmaster/city/state", {
      params: { orgid: orgId, state },
    });
    return res?.data?.paramObjectsMap?.cityVO || [];
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
