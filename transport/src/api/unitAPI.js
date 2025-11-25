import apiClient from "./apiClient";

export const unitAPI = {
  // Unit CRUD operations
  getUnits: async (orgId) => {
    const res = await apiClient.get(
      "/api/warehousemastercontroller/getAllUnitByOrgId",
      {
        params: { orgid: orgId },
      }
    );

    return (
      res?.data?.paramObjectsMap?.unitVO || res?.paramObjectsMap?.unitVO || []
    );
  },

  saveUnit: async (payload) => {
    console.log("📤 [API] Unit Save Payload:", payload);

    const method = payload.id ? "put" : "post";
    const response = await apiClient[method](
      "/api/warehousemastercontroller/createUpdateUnit",
      payload
    );

    console.log("📥 [API] Unit Save Response:", response);

    return response.data || response;
  },

  uploadUnits: async (formData) => {
    return await apiClient.post(
      "/api/warehousemastercontroller/UnitUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
