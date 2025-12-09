// services/warehouseAPI.js
import apiClient from "./apiClient";

export const warehouseAPI = {
  // Get suppliers
  getSuppliers: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/supplier",
      {
        params,
      }
    );

    return (
      response?.data?.paramObjectsMap?.supplierVO ||
      response?.paramObjectsMap?.supplierVO ||
      []
    );
  },

  // Get carriers by shipment mode
  getCarriersByMode: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getCarrierNameByCustomer",
      { params }
    );

    return (
      response?.data?.paramObjectsMap?.carrierVO ||
      response?.paramObjectsMap?.carrierVO ||
      []
    );
  },

  // Get materials/part numbers
  getMaterials: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/material",
      {
        params,
      }
    );

    return (
      response?.data?.paramObjectsMap?.materialVO ||
      response?.paramObjectsMap?.materialVO ||
      []
    );
  },

  getLocationTypes: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/getAllBinTypeByOrgId",
      {
        params,
      }
    );
    return response?.data;
  },

  getBinLocations: async (params) => {
    const response = await apiClient.get(
      "/api/warehousemastercontroller/warehouselocation",
      {
        params,
      }
    );
    return response?.data;
  },

  // Get all warehouses
  getWarehouses: async (orgId) => {
    console.log("🔍 [warehouseAPI] Fetching warehouses with orgId:", orgId);

    const response = await apiClient.get(
      "/api/warehousemastercontroller/warehouse",
      {
        params: { orgId },
      }
    );

    console.log("📦 [warehouseAPI] Warehouses response:", response?.data);

    return (
      response?.data?.paramObjectsMap?.warehouseVO ||
      response?.paramObjectsMap?.warehouseVO ||
      []
    );
  },

  // Get warehouse by ID
  getWarehouseById: async (warehouseId) => {
    console.log("🔍 [warehouseAPI] Fetching warehouse by ID:", warehouseId);

    const response = await apiClient.get(
      `/api/warehousemastercontroller/warehouse/${warehouseId}`
    );

    console.log("📦 [warehouseAPI] Warehouse by ID response:", response?.data);

    return (
      response?.data?.paramObjectsMap?.warehouseVO ||
      response?.paramObjectsMap?.warehouseVO ||
      null
    );
  },

  // Create/Update warehouse
  saveWarehouse: async (payload) => {
    console.log("📤 [warehouseAPI] Warehouse Save Payload:", payload);

    const response = await apiClient.put(
      "/api/warehousemastercontroller/createUpdateWarehouse",
      payload
    );

    console.log("📥 [warehouseAPI] Warehouse Save Response:", response?.data);

    return response?.data || response;
  },

  // Get clients for dropdown
  getClients: async (orgId) => {
    console.log("🔍 [warehouseAPI] Fetching clients with orgId:", orgId);

    const response = await apiClient.get(
      "/api/warehousemastercontroller/getClientAndClientCodeByOrgId",
      { params: { orgId } }
    );

    console.log("📦 [warehouseAPI] Clients response:", response?.data);

    return (
      response?.data?.paramObjectsMap?.CustomerVO ||
      response?.paramObjectsMap?.CustomerVO ||
      []
    );
  },

  // Bulk upload
  bulkUpload: async (formData) => {
    console.log("📤 [warehouseAPI] Bulk upload started");

    const response = await apiClient.post(
      "/api/warehousemastercontroller/WarehouseUpload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("📥 [warehouseAPI] Bulk upload response:", response?.data);

    return response?.data || response;
  },
};
