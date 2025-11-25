import apiClient from "./apiClient";

export const masterAPI = {
  getCarriers: async (orgid, client, cbranch) => {
    const res = await apiClient.get("/api/warehousemastercontroller/carrier", {
      params: { orgid, client, cbranch },
    });

    return (
      res?.data?.paramObjectsMap?.carrierVO ||
      res?.paramObjectsMap?.carrierVO ||
      []
    );
  },

  saveCarrier: async (payload) => {
    console.log("📤 [API] Carrier Save Payload:", payload);

    const response = await apiClient.put(
      "/api/warehousemastercontroller/createUpdateCarrier",
      payload
    );

    console.log("📥 [API] Carrier Save Response:", response);

    return response.data || response;
  },

  uploadCarriers: async (formData) => {
    return await apiClient.post(
      "/api/warehousemastercontroller/CarrierUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
