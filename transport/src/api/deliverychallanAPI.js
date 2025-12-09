import apiClient from "./apiClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const deliveryChallanAPI = {
  // Get Delivery Challan document ID
  getDeliveryChallanDocId: async (params) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getDeliveryChallanDocId",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get all Delivery Challans
  getAllDeliveryChallans: async (params) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getAllDeliveryChallan",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Delivery Challan by ID
  getDeliveryChallanById: async (id) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getDeliveryChallanById",
      {
        params: { id },
      }
    );
    return response?.data || response;
  },

  // Create/Update Delivery Challan
  createUpdateDeliveryChallan: async (data) => {
    const response = await apiClient.put(
      "/api/deliverychallan/createUpdatedDeliveryChallan",
      data
    );
    return response?.data || response;
  },

  // Get all Pick Requests for Delivery Challan
  getAllPickRequests: async (params) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getAllPickRequestFromDeliveryChallan",
      {
        params,
      }
    );
    return response?.data || response;
  },

  // Get Buyer/ShipTo/BillTo data
  getBuyerOrderData: async (buyerOrderNo) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getBuyerShipToBillToFromBuyerOrderForDeliveryChallan",
      {
        params: { buyerOrderNo },
      }
    );
    return response?.data || response;
  },

  // Get Delivery Challans by Date Range
  getDeliveryChallansByDateRange: async (params) => {
    const response = await apiClient.get(
      "/api/deliverychallan/getAllDeliveryChallanByDateRange",
      {
        params,
      }
    );
    return response?.data || response;
  },
};
