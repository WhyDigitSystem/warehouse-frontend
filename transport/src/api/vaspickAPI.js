import apiClient from "./apiClient";

export const vasPickAPI = {
  // Get VAS Pick Document ID
  getVasPickDocId: async (params) => {
    const response = await apiClient.get("/api/vasPick/getVasPickDocId", {
      params,
    });
    return response?.data || response;
  },

  // Get all VAS Picks
  getAllVasPick: async (params) => {
    const response = await apiClient.get("/api/vasPick/getAllVaspick", {
      params,
    });
    return response?.data || response;
  },

  // Get VAS Pick by ID
  getVasPickById: async (id) => {
    const response = await apiClient.get("/api/vasPick/getVaspickById", {
      params: { id },
    });
    return response?.data || response;
  },

  // Create/Update VAS Pick
  createUpdateVasPick: async (data) => {
    const response = await apiClient.put(
      "/api/vasPick/createUpdateVasPic",
      data
    );
    return response?.data || response;
  },

  // Get Grid Details for modal
  getVasPicGridDetails: async (params) => {
    const response = await apiClient.get("/api/vasPick/getVasPicGridDetails", {
      params,
    });
    return response?.data || response;
  },

  // Get all active location types (bin types)
  getAllActiveLocationTypes: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/warehousemastercontroller/locationType",
        {
          params: { orgid: orgId },
        }
      );

      // Check if response exists and has data
      if (!response || !response.data) {
        console.error("No response or data received");
        return [];
      }

      const apiResponse = response.data;

      // Check if API call was successful
      if (apiResponse.status === true) {
        // Check if locationTypeVO exists and is an array
        const locationTypeVO = apiResponse.paramObjectsMap?.locationTypeVO;

        if (Array.isArray(locationTypeVO)) {
          // Filter active items and map to needed structure
          const locationTypeData = locationTypeVO
            .filter((row) => row.active === "Active")
            .map(({ id, binType, core }) => ({
              id,
              binType: binType || "",
              core: core || "",
            }));

          console.log("Fetched location types:", locationTypeData);
          return locationTypeData;
        } else {
          console.warn("locationTypeVO is not an array:", locationTypeVO);
          return [];
        }
      } else {
        console.error("API returned false status:", apiResponse);
        return [];
      }
    } catch (error) {
      console.error("Error fetching location types:", error);
      // Return empty array instead of throwing to prevent component crash
      return [];
    }
  },
};

// Alternative: If you want to keep it as a separate export (not part of vasPickAPI object)
export const getAllActiveLocationTypes = async (orgId) => {
  try {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/locationType",
      {
        params: { orgid: orgId },
      }
    );

    if (response?.data?.status === true) {
      const locationTypeData = response.data.paramObjectsMap.locationTypeVO
        .filter((row) => row.active === "Active")
        .map(({ id, binType, core }) => ({ id, binType, core }));
      return locationTypeData;
    } else {
      console.error("API Error:", response?.data);
      return response?.data || { status: false };
    }
  } catch (error) {
    console.error("Error fetching location types:", error);
    throw error;
  }
};
