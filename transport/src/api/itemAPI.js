import apiClient from "./apiClient";

export const masterAPI = {
  getItemMaster: async (orgid, client, cbranch) => {
    // Changed to 'cbranch' to match original
    const res = await apiClient.get("/api/warehousemastercontroller/material", {
      params: {
        orgid,
        client,
        cbranch, // Use 'cbranch' instead of 'branchcode'
      },
    });

    console.log("📥 Raw API Response:", res);
    console.log("📥 Response data:", res.data);
    console.log("📥 paramObjectsMap:", res.data?.paramObjectsMap);
    console.log("📥 materialVO:", res.data?.paramObjectsMap?.materialVO);
    return (
      res?.data?.paramObjectsMap?.materialVO ||
      res?.paramObjectsMap?.materialVO ||
      []
    );
  },

  saveItem: async (payload) => {
    console.log("📤 [API] Item Save Payload:", payload);

    const response = await apiClient.put(
      "/api/warehousemastercontroller/createUpdateMaterial",
      payload
    );

    console.log("📥 [API] Item Save Response:", response);

    return response.data || response;
  },

  uploadItems: async (formData) => {
    return await apiClient.post(
      "/api/warehousemastercontroller/MaterialUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
