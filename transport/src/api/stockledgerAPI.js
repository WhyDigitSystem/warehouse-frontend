// src/api/stockLedgerAPI.js
import apiClient from "./apiClient";

export const stockLedgerAPI = {
  // Get stock ledger report
  getStockLedger: async (params) => {
    try {
      console.log("API Call params:", params);
      const response = await apiClient.get(`/api/Reports/getStockLedger`, {
        params,
      });
      console.log("API Response:", response);

      // If apiClient returns the response object directly (not response.data)
      if (response.statusFlag || response.status) {
        return response; // Return the response object directly
      }

      // Fallback: try to get data if it exists
      return response.data || response;
    } catch (error) {
      console.error("Error fetching stock ledger:", error);
      throw error;
    }
  },

  getAllActivePartDetails: async (cBranch, client, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/material`,
        {
          params: {
            cbranch: cBranch,
            client: client,
            orgid: orgId,
          },
        }
      );
      console.log("Parts API Response:", response);

      // If apiClient returns the response object directly
      if (response?.status === true) {
        const materialVO = response?.paramObjectsMap?.materialVO || [];

        if (materialVO.length > 0) {
          const partData = materialVO
            .filter((row) => row.active === "Active")
            .map(({ id, itemType, partno, partDesc, sku }) => ({
              id,
              itemType,
              partno,
              partDesc,
              sku,
            }));

          console.log("Processed part data:", partData);
          return partData;
        } else {
          console.warn("No materialVO found in response");
          return [];
        }
      } else {
        console.error("API Error - status false:", response);
        return [];
      }
    } catch (error) {
      console.error("Error fetching part details:", error);
      return [];
    }
  },
};
