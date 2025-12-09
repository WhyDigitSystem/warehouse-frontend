// src/api/dashboardAPI.js
import apiClient from "./apiClient";

export const dashboardAPI = {
  // Get GRN data
  getGRNData: async (orgId, branchCode, client, finYear, warehouse, month) => {
    try {
      const response = await apiClient.get(
        "/api/grn/getGrnStatusForDashBoard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            warehouse,
            month,
          },
        }
      );

      if (response?.data?.status === true) {
        const grnData = response.data.paramObjectsMap?.grnDashboard || [];
        const pending = grnData.filter((item) => item.status === "Pending");
        const completed = grnData.filter((item) => item.status === "Complete");
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching GRN data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Putaway data
  getPutawayData: async (orgId, branchCode, client, finYear, month) => {
    try {
      const response = await apiClient.get(
        "/api/putaway/getPutawayForDashBoard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            month,
          },
        }
      );

      if (response?.data?.status === true) {
        const putawayData =
          response.data.paramObjectsMap?.putawayDashboard || [];
        const pending = putawayData.filter((item) => item.status === "Pending");
        const completed = putawayData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching putaway data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Buyer Order data
  getBuyerOrderData: async (orgId, branchCode, client, finYear, warehouse) => {
    try {
      const response = await apiClient.get(
        "/api/buyerOrder/getBuyerorderDashboard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            warehouse,
          },
        }
      );

      if (response?.data?.status === true) {
        const buyerOrderData =
          response.data.paramObjectsMap?.buyerorderDashboard || [];
        const pending = buyerOrderData.filter(
          (item) => item.status === "Pending"
        );
        const completed = buyerOrderData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching buyer order data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Pick Request data
  getPickRequestData: async (orgId, branchCode, client, finYear) => {
    try {
      const response = await apiClient.get(
        "/api/pickrequest/getPicrequestDashboard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finyear: finYear,
          },
        }
      );

      if (response?.data?.status === true) {
        const pickRequestData =
          response.data.paramObjectsMap?.picrequestDashboard || [];
        const pending = pickRequestData.filter(
          (item) => item.status === "Pending"
        );
        const completed = pickRequestData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching pick request data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Warehouse Occupancy
  getWarehouseOccupancy: async (orgId, branchCode, warehouse, client) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getBinDetailsForClientWise",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
          },
        }
      );

      if (response?.data?.statusFlag === "Ok") {
        const binDetails = response.data.paramObjectsMap?.binDetails || [];

        // Calculate counts from bin details
        const occupied = binDetails.filter(
          (bin) => bin.binStatus === "Occupied"
        ).length;
        const available = binDetails.filter(
          (bin) => bin.binStatus === "Empty"
        ).length;

        return {
          status: true,
          binDetails: binDetails,
          occupied,
          available,
          total: binDetails.length,
        };
      }

      return {
        status: false,
        binDetails: [],
        occupied: 0,
        available: 0,
        total: 0,
      };
    } catch (error) {
      console.error("Error fetching warehouse occupancy:", error);
      return {
        status: false,
        binDetails: [],
        occupied: 0,
        available: 0,
        total: 0,
      };
    }
  },

  // Get Storage Details
  getStorageDetails: async (orgId, branchCode, warehouse) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getStorageDetails",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
          },
        }
      );

      if (response?.data?.paramObjectsMap?.storageDetails) {
        return response.data.paramObjectsMap.storageDetails || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching storage details:", error);
      return [];
    }
  },

  // Get Stock Summary
  getStockSummary: async (orgId, branchCode, client, warehouse) => {
    try {
      const response = await apiClient.get("/api/inventory/getStockSummary", {
        params: {
          orgId,
          branchCode,
          client,
          warehouse,
        },
      });

      if (response?.data?.status) {
        const stockData = response.data.paramObjectsMap?.stockSummary || {};
        return {
          fastMoving: stockData.fastMoving || 0,
          slowMoving: stockData.slowMoving || 0,
          nearExpiry: stockData.nearExpiry || 0,
          damaged: stockData.damaged || 0,
          totalStock: stockData.totalStock || 0,
        };
      }
      return {
        fastMoving: 0,
        slowMoving: 0,
        nearExpiry: 0,
        damaged: 0,
        totalStock: 0,
      };
    } catch (error) {
      console.error("Error fetching stock summary:", error);
      return {
        fastMoving: 0,
        slowMoving: 0,
        nearExpiry: 0,
        damaged: 0,
        totalStock: 0,
      };
    }
  },

  // Get Today's Inbound/Outbound counts
  getTodayCounts: async (orgId, branchCode, client, warehouse) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // You might need to adjust these API endpoints based on your backend
      const inboundResponse = await apiClient.get(
        "/api/inbound/getTodayCount",
        { params: { orgId, branchCode, client, warehouse, date: today } }
      );

      const outboundResponse = await apiClient.get(
        "/api/outbound/getTodayCount",
        { params: { orgId, branchCode, client, warehouse, date: today } }
      );

      return {
        inboundToday: inboundResponse?.data?.count || 0,
        outboundToday: outboundResponse?.data?.count || 0,
      };
    } catch (error) {
      console.error("Error fetching today's counts:", error);
      return { inboundToday: 0, outboundToday: 0 };
    }
  },
};

export default dashboardAPI;
