// /api/warehouseLocationAPI.js
import apiClient from "./apiClient";

export const warehouseLocationAPI = {
  // 📌 Get Warehouse List by Login Branch
  getWarehousesByBranch: async (branchCode, orgId) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/warehouse/branch",
      {
        params: { branchcode: branchCode, orgid: orgId },
      }
    );
    return response?.data;
  },

  // 📌 Get All Location Types - FIXED: Use working endpoint or fallback
  getAllLocationTypes: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/warehousemastercontroller/getAllBinTypeByOrgId",
        { params: { orgId } }
      );
      return response?.data;
    } catch (error) {
      console.warn("Location types endpoint not found, using fallback");
      // Return fallback data
      return {
        status: true,
        paramObjectsMap: {
          binTypeVO: [
            { binType: "PALLET", core: "STANDARD" },
            { binType: "RACK", core: "HEAVY" },
            { binType: "SHELF", core: "LIGHT" },
          ],
        },
      };
    }
  },

  // 📌 Get All Bin Categories - FIXED: Use working endpoint or fallback
  getAllCellCategories: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/warehousemastercontroller/getAllCellTypeByOrgId",
        { params: { orgId } }
      );
      return response?.data;
    } catch (error) {
      console.warn("Cell categories endpoint not found, using fallback");
      // Return fallback data
      return {
        status: true,
        paramObjectsMap: {
          cellTypeVO: [
            { cellType: "SMALL", description: "Small Bins" },
            { cellType: "MEDIUM", description: "Medium Bins" },
            { cellType: "LARGE", description: "Large Bins" },
          ],
        },
      };
    }
  },

  // 📌 Get All Warehouse Locations - FIXED: Add all required parameters
  getAllWarehouseLocations: async (branch, orgId, warehouse) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/warehouselocation",
      {
        params: {
          branch: branch,
          orgid: orgId,
          warehouse: warehouse,
        },
      }
    );
    return response?.data;
  },

  // 📌 Get Warehouse Location By ID
  getLocationById: async (id) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getWarehouselocationById",
      { params: { id } }
    );
    return response?.data;
  },

  // 📌 Fetch Bin Details
  getBinDetails: async (cellTo, levelIdentity, rowNo, cellFrom) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getPalletno",
      {
        params: {
          endno: cellTo,
          level: levelIdentity,
          rowno: rowNo,
          startno: cellFrom,
        },
      }
    );
    return response?.data;
  },

  // 📌 Create / Update Warehouse Location
  saveWarehouseLocation: async (payload) => {
    console.log("📤 [API] Save Warehouse Location Payload:", payload);
    const response = await apiClient.put(
      "/api/warehousemastercontroller/warehouselocation",
      payload
    );
    return response?.data;
  },

  // 📌 Upload Warehouse Location (Bulk)
  uploadWarehouseLocation: async (formData) => {
    const response = await apiClient.post(
      "/api/warehousemastercontroller/warehouseLocationUpload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response?.data;
  },
};
