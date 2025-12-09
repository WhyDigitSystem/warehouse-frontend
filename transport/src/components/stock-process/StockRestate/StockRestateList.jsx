import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar,
} from "lucide-react";
import { stockrestateAPI } from "../../../api/stockrestateAPI";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const StockRestateList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  useEffect(() => {
    fetchStockRestate();
  }, [refreshTrigger]);

  const fetchStockRestate = async () => {
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

      const response = await stockrestateAPI.getAllStockRestate(params);
      
      if (response?.status === true) {
        const stockRestateList = response.paramObjectsMap?.stockRestateVO || [];
        // Sort by ID descending (newest first)
        const sortedList = stockRestateList.sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sortedList);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error("Error fetching stock restate:", error);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchStockRestate();
  };

  // Excel Download Function
  const handleExcelDownload = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      alert("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0];
      const toDate = selectedDateRange[1];

      // Fetch all data
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await stockrestateAPI.getAllStockRestate(params);

      if (response?.status === true && response.paramObjectsMap?.stockRestateVO) {
        const allData = response.paramObjectsMap.stockRestateVO;

        // Filter data based on the selected date range
        const filteredData = allData.filter((item) => {
          if (!item.docDate) return false;

          let itemDate;
          if (item.docDate.includes("-")) {
            const parts = item.docDate.split("-");
            if (parts[0].length === 4) {
              itemDate = item.docDate;
            } else if (parts[0].length === 2) {
              itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          } else {
            itemDate = dayjs(item.docDate).format("YYYY-MM-DD");
          }

          const fromDateFormatted = dayjs(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD");
          const toDateFormatted = dayjs(toDate, "DD-MM-YYYY").format("YYYY-MM-DD");

          return (
            itemDate &&
            itemDate >= fromDateFormatted &&
            itemDate <= toDateFormatted
          );
        });

        if (filteredData.length > 0) {
          const excelData = formatDataForExcel(filteredData);

          const ws = XLSX.utils.json_to_sheet(excelData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Stock Restate Data");

          const fileName = `Stock_Restate_${fromDate}_to_${toDate}.xlsx`;
          XLSX.writeFile(wb, fileName);
        } else {
          alert("No data found for the selected date range");
        }
      } else {
        alert("No data available");
      }
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to download Excel file");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Format data for Excel
  const formatDataForExcel = (data) => {
    const excelData = [];

    data.forEach((mainRecord) => {
      if (
        mainRecord.stockRestateDetailsVO &&
        mainRecord.stockRestateDetailsVO.length > 0
      ) {
        mainRecord.stockRestateDetailsVO.forEach((detail) => {
          excelData.push({
            "Doc ID": mainRecord.docId || "",
            "Doc Date": formatDateForDisplay(mainRecord.docDate),
            "Transfer From": mainRecord.transferFrom || "",
            "Transfer To": mainRecord.transferTo || "",
            "Entry No": mainRecord.entryNo || "",
            "From Bin": detail.fromBin || "",
            "From Bin Type": detail.fromBinType || "",
            "Part No": detail.partNo || "",
            "Part Description": detail.partDesc || "",
            SKU: detail.sku || "",
            "GRN No": detail.grnNo || "",
            "Batch No": detail.batch || "",
            "To Bin": detail.toBin || "",
            "To Bin Type": detail.toBinType || "",
            "From Qty": detail.fromQty || "",
            "To Qty": detail.toQty || "",
            Remarks: detail.remarks || "",
            "Created By": mainRecord.createdBy || "",
          });
        });
      } else {
        excelData.push({
          "Doc ID": mainRecord.docId || "",
          "Doc Date": formatDateForDisplay(mainRecord.docDate),
          "Transfer From": mainRecord.transferFrom || "",
          "Transfer To": mainRecord.transferTo || "",
          "Entry No": mainRecord.entryNo || "",
          "From Bin": "",
          "From Bin Type": "",
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "GRN No": "",
          "Batch No": "",
          "To Bin": "",
          "To Bin Type": "",
          "From Qty": "",
          "To Qty": "",
          Remarks: "",
          "Created By": mainRecord.createdBy || "",
        });
      }
    });

    return excelData;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts[0].length === 4) {
          return dayjs(dateString, "YYYY-MM-DD").format("DD-MM-YYYY");
        } else if (parts[0].length === 2) {
          return dateString;
        }
      }
      return dayjs(dateString).format("DD-MM-YYYY");
    } catch (error) {
      console.warn("Date formatting error:", error, dateString);
      return dateString;
    }
  };

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.docId && item.docId.toLowerCase().includes(searchLower)) ||
      (item.transferFrom && item.transferFrom.toLowerCase().includes(searchLower)) ||
      (item.transferTo && item.transferTo.toLowerCase().includes(searchLower)) ||
      (item.entryNo && item.entryNo.toLowerCase().includes(searchLower)) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(searchLower))
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stock Restate List
        </h1>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={handleExcelDownload}
            disabled={downloadLoading || list.length === 0}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> 
            {downloadLoading ? 'Exporting...' : 'Export Excel'}
          </button>
          
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-4">
        {/* Search Box */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Doc ID, Transfer From, Transfer To..."
            className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {search && (
            <span className="text-xs text-gray-500">
              {filtered.length} results
            </span>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Date Range:</span>
          </div>
          <input
            type="date"
            value={selectedDateRange[0] || ''}
            onChange={(e) => setSelectedDateRange([e.target.value, selectedDateRange[1] || ''])}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={selectedDateRange[1] || ''}
            onChange={(e) => setSelectedDateRange([selectedDateRange[0] || '', e.target.value])}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Results Count and Items Per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} entries
          {search && ` for "${search}"`}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading stock restate entries…
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Document No</th>
                <th className="p-2 text-left font-medium">Document Date</th>
                <th className="p-2 text-left font-medium">Transfer From</th>
                <th className="p-2 text-left font-medium">Transfer To</th>
                <th className="p-2 text-left font-medium">Entry No</th>
                <th className="p-2 text-left font-medium">Created By</th>
                <th className="p-2 text-left font-medium">Created Date</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, i) => (
                  <tr
                    key={item.id || `item-${i}`}
                    className="border-t border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2">{startIndex + i + 1}</td>
                    <td className="p-2 font-medium">{item.docId || '-'}</td>
                    <td className="p-2">{formatDateForDisplay(item.docDate)}</td>
                    <td className="p-2">{item.transferFrom || '-'}</td>
                    <td className="p-2">{item.transferTo || '-'}</td>
                    <td className="p-2">{item.entryNo || '-'}</td>
                    <td className="p-2">{item.createdBy || '-'}</td>
                    <td className="p-2">
                      {item.createdDate ? dayjs(item.createdDate).format("DD-MM-YYYY HH:mm") : '-'}
                    </td>
                    <td className="p-2 flex justify-center">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0 ? 'No stock restate entries found' : 'No entries match your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {/* Results info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 
                       dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 
                       dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRestateList;