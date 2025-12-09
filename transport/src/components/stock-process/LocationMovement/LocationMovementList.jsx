import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  FileText,
  Edit,
  ChevronRight,
  Package,
  Move,
  Warehouse,
  MapPin,
  Box,
  Hash,
  User,
  FileDigit,
} from "lucide-react";
import { locationmovementAPI } from "../../../api/locationmovementAPI";

import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";

const LocationMovementList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  useEffect(() => {
    fetchLocationMovements();
  }, [refreshTrigger]);

  const fetchLocationMovements = async () => {
    try {
      setLoading(true);
      
      const params = {
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear
      };

      const response = await locationmovementAPI.getAllLocationMovements(params);
      
      if (response?.status === true) {
        const locationMovements = response.paramObjectsMap?.locationMovementVO || [];
        // Sort by ID descending (newest first)
        const sortedMovements = locationMovements.sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sortedMovements);
      } else {
        setList([]);
        addToast("No location movements found", "info");
      }
    } catch (error) {
      console.error("Error fetching location movements:", error);
      addToast("Failed to fetch location movements", "error");
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLocationMovements();
  };

  const fetchLocationMovementsWithDateRange = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      addToast("Please select both from and to dates", "error");
      return;
    }

    setLoading(true);
    try {
      const fromDate = dayjs(selectedDateRange[0]).format('YYYY-MM-DD');
      const toDate = dayjs(selectedDateRange[1]).format('YYYY-MM-DD');

      const params = {
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        fromDate,
        toDate
      };

      const response = await locationmovementAPI.getLocationMovementsByDateRange(params);
      
      if (response?.status === true) {
        const locationMovements = response.paramObjectsMap?.locationMovementVO || [];
        setList(locationMovements);
        addToast(`Found ${locationMovements.length} location movements for selected date range`, "success");
      } else {
        setList([]);
        addToast("No location movements found for selected date range", "info");
      }
    } catch (error) {
      console.error("Error fetching location movements by date range:", error);
      addToast("Failed to fetch location movements", "error");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // Excel Download Function
  const handleExcelDownload = async () => {
    setDownloadLoading(true);
    try {
      const dataToExport = list;

      if (dataToExport.length === 0) {
        addToast("No data available to export", "warning");
        setDownloadLoading(false);
        return;
      }

      // Format the data for Excel
      const excelData = formatLocationMovementDataForExcel(dataToExport);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Location Movements");

      // Generate file name with current date
      const fileName = `Location_Movements_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;

      // Generate Excel file and download
      XLSX.writeFile(wb, fileName);

      addToast("Excel file downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      addToast("Failed to download Excel file", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatLocationMovementDataForExcel = (locationMovementData) => {
    const excelData = [];

    locationMovementData.forEach((mainRecord) => {
      if (
        mainRecord.locationMovementDetailsVO &&
        mainRecord.locationMovementDetailsVO.length > 0
      ) {
        mainRecord.locationMovementDetailsVO.forEach((detail) => {
          excelData.push({
            "Document No": mainRecord.docId,
            "Document Date": formatDateForDisplay(mainRecord.docDate),
            "Entry No": mainRecord.entryNo,
            "Moved Qty": mainRecord.movedQty,
            "From Bin": detail.fromBin || detail.bin,
            "To Bin": detail.toBin,
            "To Bin Type": detail.toBinType,
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            SKU: detail.sku,
            "GRN No": detail.grnNo,
            "GRN Date": formatDateForDisplay(detail.grnDate),
            "Batch No": detail.batchNo,
            "Available Qty": detail.avlQty,
            "To Qty": detail.toQty,
            "Remaining Qty": detail.remainQty,
            Status: mainRecord.status,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
            "Created Date": formatDateForDisplay(mainRecord.createdDate),
          });
        });
      } else {
        excelData.push({
          "Document No": mainRecord.docId,
          "Document Date": formatDateForDisplay(mainRecord.docDate),
          "Entry No": mainRecord.entryNo,
          "Moved Qty": mainRecord.movedQty,
          "From Bin": "",
          "To Bin": "",
          "To Bin Type": "",
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "GRN No": "",
          "GRN Date": "",
          "Batch No": "",
          "Available Qty": "",
          "To Qty": "",
          "Remaining Qty": "",
          Status: mainRecord.status,
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
          "Created Date": formatDateForDisplay(mainRecord.createdDate),
        });
      }
    });

    return excelData;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      return dayjs(dateString).format("DD-MM-YYYY");
    } catch (error) {
      return String(dateString);
    }
  };

  // Get status color class
  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDING':
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'IN PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.docId && item.docId.toLowerCase().includes(searchLower)) ||
      (item.entryNo && item.entryNo.toLowerCase().includes(searchLower)) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Location Movement List
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage inventory location movements
          </p>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Location Movement</h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search Document No, Entry No, Created By..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-700">
              <Calendar className="w-3 h-3 text-gray-400" />
              <input
                type="date"
                value={selectedDateRange[0] || ''}
                onChange={(e) => {
                  const fromDate = e.target.value;
                  setSelectedDateRange([fromDate, selectedDateRange[1]]);
                }}
                className="bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none w-24"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={selectedDateRange[1] || ''}
                onChange={(e) => {
                  const toDate = e.target.value;
                  setSelectedDateRange([selectedDateRange[0], toDate]);
                }}
                className="bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none w-24"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchLocationMovementsWithDateRange}
              disabled={!selectedDateRange[0] || !selectedDateRange[1]}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
              <Search className="h-3 w-3" />
              Filter by Date
            </button>

            <button
              onClick={handleExcelDownload}
              disabled={downloadLoading || filtered.length === 0}
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
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add New
            </button>
          </div>
        </div>

        {/* BEAUTIFUL TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Document Info
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry Details
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Movement Summary
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status & Details
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">Loading location movements...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0 ? 'No location movements found' : 'No matching entries found'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={`location-movement-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* Document Info Column */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.docId}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {formatDateForDisplay(item.docDate)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          Items: {item.locationMovementDetailsVO?.length || 0}
                        </span>
                      </div>
                    </td>

                    {/* Entry Details Column */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.entryNo || 'N/A'}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Created: {formatDateForDisplay(item.createdDate)}
                      </div>
                    </td>

                    {/* Movement Summary Column */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Box className="w-3 h-3 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Moved: {item.movedQty || 0}
                          </span>
                        </div>
                        {item.locationMovementDetailsVO?.[0]?.fromBin && (
                          <div className="flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              From: {item.locationMovementDetailsVO[0].fromBin}
                            </span>
                          </div>
                        )}
                        {item.locationMovementDetailsVO?.[0]?.toBin && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              To: {item.locationMovementDetailsVO[0].toBin}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status & Details Column */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        {item.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {item.createdBy || 'System'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
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
                          onClick={() => onEdit(item)}
                          className="p-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        By: {item.createdBy || 'System'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filtered.length} of {filtered.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500"
                defaultValue="all"
                onChange={(e) => {
                  // Handle page size change if needed
                }}
              >
                <option value="all">All entries</option>
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

export default LocationMovementList;