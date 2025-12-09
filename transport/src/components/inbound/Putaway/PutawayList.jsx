import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  FileText,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { putawayAPI } from "../../../api/putawayAPI";
import { useToast } from "../../Toast/ToastContext";

const PutawayList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [listViewData, setListViewData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  useEffect(() => {
    getAllPutaways();
  }, [refreshTrigger]);

  const getAllPutaways = async () => {
    try {
      setLoading(true);
      
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await putawayAPI.getAllPutaways(params);
      
      if (response?.paramObjectsMap?.PutAwayVO) {
        setListViewData(response.paramObjectsMap.PutAwayVO);
      } else {
        setListViewData([]);
        addToast("No Putaway data found", "info");
      }
    } catch (error) {
      console.error("Error fetching Putaway data:", error);
      addToast("Failed to fetch Putaway data", "error");
      setListViewData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getAllPutaways();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return String(dateString);
    }
  };

  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      addToast("Please select both from and to dates", "error");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0].toISOString().split('T')[0];
      const toDate = selectedDateRange[1].toISOString().split('T')[0];

      const response = await putawayAPI.getAllPutaways({
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
        warehouse: loginWarehouse
      });

      if (response?.paramObjectsMap?.PutAwayVO) {
        const allPutawayData = response.paramObjectsMap.PutAwayVO;
        const filteredPutawayData = allPutawayData.filter((item) => {
          const putawayDate = item.docDate;
          return putawayDate >= fromDate && putawayDate <= toDate;
        });

        if (filteredPutawayData.length > 0) {
          const excelData = formatDataForExcel(filteredPutawayData);
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);
          XLSX.utils.book_append_sheet(wb, ws, "Putaway Data");
          XLSX.writeFile(wb, `Putaway_${fromDate}_to_${toDate}.xlsx`);
          addToast("Excel file downloaded successfully", "success");
        } else {
          addToast("No data found for the selected date range", "warning");
        }
      } else {
        addToast("No data available", "warning");
      }
    } catch (error) {
      console.error("Error downloading Excel:", error);
      addToast("Failed to download Excel file", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatDataForExcel = (putawayData) => {
    const excelData = [];
    putawayData.forEach((mainRecord) => {
      if (mainRecord.putAwayDetailsVO && mainRecord.putAwayDetailsVO.length > 0) {
        mainRecord.putAwayDetailsVO.forEach((detail) => {
          excelData.push({
            "Putaway No": mainRecord.docId,
            "Putaway Date": formatDate(mainRecord.docDate),
            "GRN No": mainRecord.grnNo,
            "GRN Date": formatDate(mainRecord.grnDate),
            "Entry No": mainRecord.entryNo,
            Supplier: mainRecord.supplier,
            "Supplier Short Name": mainRecord.supplierShortName,
            "Mode of Shipment": mainRecord.modeOfShipment,
            Carrier: mainRecord.carrier,
            "Vehicle Type": mainRecord.vehicleType,
            "Vehicle No": mainRecord.vehicleNo,
            "Driver Name": mainRecord.driverName,
            "Security Name": mainRecord.securityName,
            "Bin Type": mainRecord.binType,
            "Bin Class": mainRecord.binClass,
            "Bin Pick": mainRecord.binPick,
            Core: mainRecord.core,
            "Total GRN Qty": mainRecord.totalGrnQty,
            "Total Putaway Qty": mainRecord.totalPutawayQty,
            Status: mainRecord.status,
            Warehouse: mainRecord.warehouse,
            Branch: mainRecord.branch,
            "Created By": mainRecord.createdBy,
            "Created On": formatDate(mainRecord.createdOn),
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            SKU: detail.sku,
            "Batch No": detail.batch,
            "Batch Date": formatDate(detail.batchDt),
            "Expiry Date": formatDate(detail.expdate),
            "GRN Qty": detail.grnQty,
            "Putaway Qty": detail.putAwayQty,
            "Bin Location": detail.bin,
            "Bin Type (Detail)": detail.binType,
            "Cell Type": detail.cellType,
            Remarks: detail.remarks,
          });
        });
      } else {
        excelData.push({
          "Putaway No": mainRecord.docId,
          "Putaway Date": formatDate(mainRecord.docDate),
          "GRN No": mainRecord.grnNo,
          "GRN Date": formatDate(mainRecord.grnDate),
          "Entry No": mainRecord.entryNo,
          Supplier: mainRecord.supplier,
          "Supplier Short Name": mainRecord.supplierShortName,
          "Mode of Shipment": mainRecord.modeOfShipment,
          Carrier: mainRecord.carrier,
          "Vehicle Type": mainRecord.vehicleType,
          "Vehicle No": mainRecord.vehicleNo,
          "Driver Name": mainRecord.driverName,
          "Security Name": mainRecord.securityName,
          "Bin Type": mainRecord.binType,
          "Bin Class": mainRecord.binClass,
          "Bin Pick": mainRecord.binPick,
          Core: mainRecord.core,
          "Total GRN Qty": mainRecord.totalGrnQty,
          "Total Putaway Qty": mainRecord.totalPutawayQty,
          Status: mainRecord.status,
          Warehouse: mainRecord.warehouse,
          Branch: mainRecord.branch,
          "Created By": mainRecord.createdBy,
          "Created On": formatDate(mainRecord.createdOn),
        });
      }
    });
    return excelData;
  };

  // Filter data based on search
  const filteredData = listViewData.filter(
    (item) =>
      !searchTerm ||
      (item.docId && item.docId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.grnNo && item.grnNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirm': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Edit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getQuantityClass = (type) => {
    switch (type) {
      case 'grn': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'putaway': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Putaway List
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage Putaway entries
          </p>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Putaway</h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {filteredData.length}
            </span>
          </div>
          
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search Putaway No, GRN No, or Supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-700">
              <Calendar className="w-3 h-3 text-gray-400" />
              <input
                type="date"
                value={selectedDateRange[0]?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const fromDate = e.target.value ? new Date(e.target.value) : null;
                  setSelectedDateRange([fromDate, selectedDateRange[1]]);
                }}
                className="bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none w-24"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={selectedDateRange[1]?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const toDate = e.target.value ? new Date(e.target.value) : null;
                  setSelectedDateRange([selectedDateRange[0], toDate]);
                }}
                className="bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none w-24"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadExcel}
              disabled={downloadLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              {downloadLoading ? "Downloading..." : "Excel"}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Entry
            </button>
          </div>
        </div>

        {/* BEAUTIFUL TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Putaway No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Document Info
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GRN Info
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status & Quantities
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">Loading Putaway data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {listViewData.length === 0 ? 'No Putaway entries found' : 'No matching entries found'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={`putaway-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                      {item.docId}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {formatDate(item.docDate)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Created: {formatDate(item.createdOn)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {item.grnNo}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(item.grnDate)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-gray-900 dark:text-white font-medium truncate max-w-[120px]">
                        {item.supplierShortName}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[120px]">
                        {item.supplier}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                        
                        {/* Quantities Section */}
                        <div className="flex flex-col gap-1">
                          {/* GRN Qty Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium min-w-[60px]">GRN Qty:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQuantityClass('grn')}`}>
                              {item.totalGrnQty || 0}
                            </span>
                          </div>
                          
                          {/* Putaway Qty Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium min-w-[60px]">Putaway Qty:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQuantityClass('putaway')}`}>
                              {item.totalPutawayQty || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete Putaway ${item.docId}?`)) {
                              // Add your delete logic here
                              console.log('Delete:', item);
                            }
                          }}
                          className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredData.length} of {filteredData.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  // Handle page size change if needed
                }}
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PutawayList;