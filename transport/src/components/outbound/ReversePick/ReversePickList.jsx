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
  Package,
  ClipboardList,
} from "lucide-react";
import { reversePickAPI } from "../../../api/reversepickAPI";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";

const ReversePickList = ({ onAddNew, onEdit, refreshTrigger }) => {
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
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  useEffect(() => {
    fetchReversePicks();
  }, [refreshTrigger]);

  const fetchReversePicks = async () => {
    try {
      setLoading(true);
      
      const params = {
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        warehouse: loginWarehouse,
        finYear: loginFinYear
      };

      const response = await reversePickAPI.getAllReversePicks(params);
      
      if (response?.status === true) {
        const reversePicks = response.paramObjectsMap?.reversePickVO || [];
        // Sort by ID descending (newest first)
        const sortedPicks = reversePicks.sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sortedPicks);
      } else {
        setList([]);
        addToast("No reverse picks found", "info");
      }
    } catch (error) {
      console.error("Error fetching reverse picks:", error);
      addToast("Failed to fetch reverse picks", "error");
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReversePicks();
  };

  // Excel Download Function
  const handleExcelDownload = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      addToast("Please select both from and to dates", "error");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0] ? dayjs(selectedDateRange[0]).format('YYYY-MM-DD') : '';
      const toDate = selectedDateRange[1] ? dayjs(selectedDateRange[1]).format('YYYY-MM-DD') : '';

      const response = await reversePickAPI.getAllReversePicks({
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        warehouse: loginWarehouse,
        finYear: loginFinYear
      });

      if (response?.status === true && response.paramObjectsMap?.reversePickVO) {
        const allReversePickData = response.paramObjectsMap.reversePickVO;
        
        // Filter by date range
        const filteredReversePickData = allReversePickData.filter((item) => {
          if (!item.docDate) return false;
          const itemDate = dayjs(item.docDate).format('YYYY-MM-DD');
          return itemDate >= fromDate && itemDate <= toDate;
        });

        if (filteredReversePickData.length > 0) {
          const excelData = formatReversePickDataForExcel(filteredReversePickData);
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);
          XLSX.utils.book_append_sheet(wb, ws, "Reverse Pick Data");
          
          const fileName = `ReversePick_${fromDate}_to_${toDate}.xlsx`;
          XLSX.writeFile(wb, fileName);
          
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

  const formatReversePickDataForExcel = (reversePickData) => {
    const excelData = [];

    reversePickData.forEach((mainRecord) => {
      if (mainRecord.reversePickDetailsVO && mainRecord.reversePickDetailsVO.length > 0) {
        mainRecord.reversePickDetailsVO.forEach((detail) => {
          excelData.push({
            "Document No": mainRecord.docId,
            "Document Date": formatDateForDisplay(mainRecord.docDate),
            "Pick Request ID": mainRecord.pickRequestDocId,
            "Buyer Order No": mainRecord.buyerOrderNo,
            "Buyer Ref No": mainRecord.buyerRefNo,
            "Buyer Ref Date": formatDateForDisplay(mainRecord.buyerRefDate),
            "Client Name": mainRecord.clientName,
            "Customer Name": mainRecord.customerName,
            Status: mainRecord.status,
            "BO Amendment": mainRecord.boAmendment,
            "In Time": mainRecord.inTime,
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            Bin: detail.bin,
            "Batch No": detail.batchNo,
            "Order Qty": detail.orderQty,
            "Pick Qty": detail.pickQty,
            "Revised Qty": detail.revisedQty,
            "GRN No": detail.grnNo,
            "GRN Date": formatDateForDisplay(detail.grnDate),
            "Total Picked Qty": mainRecord.totalPickQty,
            "Total Revised Qty": mainRecord.totalRevisedQty,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
          });
        });
      } else {
        excelData.push({
          "Document No": mainRecord.docId,
          "Document Date": formatDateForDisplay(mainRecord.docDate),
          "Pick Request ID": mainRecord.pickRequestDocId,
          "Buyer Order No": mainRecord.buyerOrderNo,
          "Buyer Ref No": mainRecord.buyerRefNo,
          "Buyer Ref Date": formatDateForDisplay(mainRecord.buyerRefDate),
          "Client Name": mainRecord.clientName,
          "Customer Name": mainRecord.customerName,
          Status: mainRecord.status,
          "BO Amendment": mainRecord.boAmendment,
          "In Time": mainRecord.inTime,
          "Total Picked Qty": mainRecord.totalPickQty,
          "Total Revised Qty": mainRecord.totalRevisedQty,
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
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
      case 'CONFIRM':
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'EDIT':
      case 'PENDING':
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'IN PROGRESS':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get quantity badge class
  const getQuantityClass = (type) => {
    switch (type) {
      case 'picked':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'revised':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get BO Amendment class
  const getBoAmendmentClass = (amendment) => {
    if (amendment?.toUpperCase() === 'YES') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.docId && item.docId.toLowerCase().includes(searchLower)) ||
      (item.pickRequestDocId && item.pickRequestDocId.toLowerCase().includes(searchLower)) ||
      (item.buyerOrderNo && item.buyerOrderNo.toLowerCase().includes(searchLower)) ||
      (item.clientName && item.clientName.toLowerCase().includes(searchLower)) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reverse Pick List
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage reverse pick entries
          </p>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reverse Pick</h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search Document No, Pick Request ID, or Buyer Order..."
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
              onClick={handleExcelDownload}
              disabled={downloadLoading || !selectedDateRange[0] || !selectedDateRange[1]}
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
                  Pick Request Info
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyer Info
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
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">Loading reverse picks...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0 ? 'No reverse picks found' : 'No matching entries found'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={`reverse-pick-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* Document Info Column */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.docId}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {formatDateForDisplay(item.docDate)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        In: {item.inTime || 'N/A'}
                      </div>
                    </td>

                    {/* Pick Request Info Column */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.pickRequestDocId || 'N/A'}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Date: {formatDateForDisplay(item.pickRequestDocDate)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ClipboardList className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          Items: {item.reversePickDetailsVO?.length || 0}
                        </span>
                      </div>
                    </td>

                    {/* Buyer Info Column */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {item.buyerOrderNo || 'N/A'}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Ref: {item.buyerRefNo || 'N/A'}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${getBoAmendmentClass(item.boAmendment)}`}>
                          {item.boAmendment || 'No'}
                        </span>
                      </div>
                    </td>

                    {/* Status & Details Column */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusClass(item.status)}`}>
                          {item.status || 'N/A'}
                        </span>
                        
                        {/* Quantities Section */}
                        <div className="flex flex-col gap-1">
                          {/* Picked Qty Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium min-w-[60px]">Picked:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQuantityClass('picked')}`}>
                              {item.totalPickQty || 0}
                            </span>
                          </div>
                          
                          {/* Revised Qty Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium min-w-[60px]">Revised:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQuantityClass('revised')}`}>
                              {item.totalRevisedQty || 0}
                            </span>
                          </div>
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
                          onClick={() => {
                            if (window.confirm(`Delete Reverse Pick ${item.docId}?`)) {
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

export default ReversePickList;