import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  ChevronDown,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { stockConsolidationAPI } from "../../../api/stockconsolidationAPI";
import { useToast } from "../../Toast/ToastContext"; // Import your toast context

const StockConsolidation = () => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [partNo, setPartNo] = useState("ALL");
  const [partList, setPartList] = useState([]);
  
  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  
  // Toggle search box
  const [showResultsSearch, setShowResultsSearch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";

  // Toast notifications
  const { addToast } = useToast(); // Use your toast context

  useEffect(() => {
    fetchPartList();
  }, []);

  const fetchPartList = async () => {
    try {
      const response = await stockConsolidationAPI.getPartList({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId,
      });

      if (response?.status === true) {
        const parts = response.paramObjectsMap?.materialVO || [];
        const filteredParts = parts
          .filter(part => part.active === "Active")
          .map(part => ({
            id: part.id,
            partno: part.partno,
            partDesc: part.partDesc,
            sku: part.sku,
          }));
        
        const allParts = [
          { id: 0, partno: "ALL", partDesc: "All Parts", sku: "ALL" },
          ...filteredParts
        ];
        setPartList(allParts);
      }
    } catch (error) {
      console.error("Error fetching part list:", error);
      addToast("Failed to fetch part list", "error"); // Toast instead of alert
    }
  };

  // Filtered parts for dropdown search
  const filteredParts = useMemo(() => {
    if (!partSearch.trim()) return partList;
    
    const searchLower = partSearch.toLowerCase();
    return partList.filter(part => 
      part.partno.toLowerCase().includes(searchLower) ||
      part.partDesc.toLowerCase().includes(searchLower)
    );
  }, [partList, partSearch]);
const fetchStockConsolidation = async () => {
  if (!selectedDate) {
    addToast("Please select As On Date", "error");
    return;
  }

  setLoading(true);
  try {
    // Convert DD-MM-YYYY to MM/DD/YYYY
    const formattedDate = selectedDate.split('-').reverse().join('/');
    console.log("Formatted date for API:", formattedDate); // Debug log
    
    const apiPartNo = partNo;
    
    const response = await stockConsolidationAPI.getStockConsolidation({
      branchCode: loginBranchCode,
      client: loginClient,
      customer: loginCustomer,
      orgId: orgId,
      partNo: apiPartNo,
      warehouse: loginWarehouse,
      asondt: formattedDate
    });

    console.log("API Response:", response); // Debug log

    if (response?.status === true) {
      const stockDetails = response.paramObjectsMap?.stockDetails || [];
      console.log("Stock Details:", stockDetails); // Debug log
      
      const dataWithKeys = stockDetails.map((item, index) => ({
        ...item,
        key: index,
        sno: index + 1,
      }));
      
      console.log("Data with keys:", dataWithKeys); // Debug log
      setList(dataWithKeys);
      
      if (stockDetails.length > 0) {
        addToast(`Loaded ${stockDetails.length} items`, "success");
      } else {
        addToast("No data found for selected parameters", "info");
      }
    } else {
      setList([]);
      addToast(response.paramObjectsMap?.errorMessage || "No data found", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    setList([]);
    addToast("Failed to fetch stock data", "error");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchStockConsolidation();
  };

  const handleSearch = () => {
    if (!selectedDate) {
      addToast("Please select As On Date", "error"); // Toast instead of alert
      return;
    }
    setCurrentPage(1);
    fetchStockConsolidation();
  };

  const handleClearFilters = () => {
    setSelectedDate(dayjs().format("DD-MM-YYYY"));
    setPartNo("ALL");
    setPartSearch("");
    setSearch("");
    setShowResultsSearch(false);
    setCurrentPage(1);
    setList([]);
    addToast("Filters cleared", "info"); // Toast notification for clear action
  };

  const handlePartSelect = (selectedPartNo) => {
    setPartNo(selectedPartNo);
    setShowSearchDropdown(false);
    setPartSearch("");
  };

  // Get selected part display name
  const getSelectedPartDisplay = () => {
    if (partNo === "ALL") return "All Parts";
    const selectedPart = partList.find(p => p.partno === partNo);
    return selectedPart ? `${selectedPart.partno} - ${selectedPart.partDesc}` : partNo;
  };

  const handleExcelDownload = () => {
    if (list.length === 0) {
      addToast("No data to export", "warning"); // Toast instead of alert
      return;
    }

    setDownloadLoading(true);
    try {
      const workbook = XLSX.utils.book_new();

      const headerRow = ["S.No", "Part No", "Part Description", "Available Quantity"];
      const dataRows = list.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        parseFloat(item.avlQty || 0),
      ]);

      const totalQty = list.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0);
      const summaryRows = [
        [],
        ["", "", "Report Parameters:", ""],
        ["", "", "As On Date:", selectedDate],
        ["", "", "Part No:", partNo === "ALL" ? "All Parts" : partNo],
        ["", "", "Branch Code:", loginBranchCode],
        ["", "", "Warehouse:", loginWarehouse],
        [],
        ["", "", "SUMMARY:", ""],
        ["", "", "TOTAL QUANTITY:", totalQty],
        ["", "", "TOTAL ITEMS:", list.length],
        ["", "", "GENERATED ON:", dayjs().format("DD-MM-YYYY HH:mm:ss")],
      ];

      const excelData = [headerRow, ...dataRows, ...summaryRows];
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Apply styling
      if (worksheet["!ref"]) {
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4472C4" } },
              alignment: { horizontal: "center" },
            };
          }
        }
      }

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 40 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Summary");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `Stock_Consolidation_${selectedDate.replace(/\//g, '-')}_${partNo === "ALL" ? "AllParts" : partNo}.xlsx`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      addToast("Excel report downloaded successfully", "success"); // Toast instead of alert
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      addToast("Failed to export Excel report", "error"); // Toast instead of alert
    } finally {
      setDownloadLoading(false);
    }
  };

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (item.partNo && item.partNo.toLowerCase().includes(searchLower)) ||
      (item.partDesc && item.partDesc.toLowerCase().includes(searchLower))
    );
  });

  // Calculate total quantity
  const totalQty = filtered.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0);

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
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
      {/* Header - Compact */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Consolidation Report
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            View stock summary with consolidated quantities
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || !selectedDate}
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
            {downloadLoading ? 'Exporting...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* Compact Filters Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date Filter */}
        {/* Date Filter */}
<div className="flex-1 min-w-[180px]">
  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
    As On Date *
  </label>
  <div className="flex items-center">
    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
    <input
      type="date"
      value={selectedDate.includes("-") ? dayjs(selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD") : selectedDate}
      onChange={(e) => {
        const newDate = dayjs(e.target.value).format("DD-MM-YYYY");
        setSelectedDate(newDate);
      }}
      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 
      bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      required
    />
  </div>
</div>
          
          {/* Part No Filter - Searchable Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Part No
            </label>
            <div className="relative">
              <div
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                cursor-pointer flex justify-between items-center min-h-[36px]"
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
              >
                <span className="truncate text-xs">
                  {getSelectedPartDisplay()}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showSearchDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {showSearchDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-1 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search parts..."
                        className="w-full pl-6 pr-6 py-1 text-xs border border-gray-300 dark:border-gray-600 
                        rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={partSearch}
                        onChange={(e) => setPartSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {partSearch && (
                        <button
                          onClick={() => setPartSearch("")}
                          className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Options List */}
                  <div className="py-1">
                    {filteredParts.length > 0 ? (
                      filteredParts.map((part) => (
                        <div
                          key={part.id}
                          className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                          ${partNo === part.partno ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handlePartSelect(part.partno)}
                        >
                          <div className="font-medium truncate">{part.partno}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {part.partDesc}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                        No parts found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showSearchDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowSearchDropdown(false)}
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={!selectedDate || loading}
              className="flex items-center justify-center gap-1 bg-purple-600 text-white px-3 py-1.5 
              rounded text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </>
              ) : (
                <>
                  <Search className="h-3 w-3" />
                  <span className="text-xs">Search</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1.5"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>
        
        {/* Quick Filter Info */}
        {(selectedDate || partNo) && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                <Filter className="h-3 w-3 inline mr-1" />
                Active Filters:
              </span>
              
              {/* Date Filter Chip - Blue */}
              {selectedDate && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                  Date: {selectedDate}
                </span>
              )}
              
              {/* Part No Filter Chip - Green */}
              {partNo && partNo !== "ALL" && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                  Part: {partNo}
                </span>
              )}
              
              {/* Part No Filter Chip - Blue for "ALL" */}
              {partNo && partNo === "ALL" && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                  Part: All Parts
                </span>
              )}
              
              {/* Branch Code Chip - Yellow */}
              {loginBranchCode && (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">
                  Branch: {loginBranchCode}
                </span>
              )}
              
              {/* Warehouse Chip - Red */}
              {loginWarehouse && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded">
                  Warehouse: {loginWarehouse}
                </span>
              )}
              
              {/* Results Summary */}
              {list.length > 0 && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">
                  Items: {list.length} | Qty: {totalQty.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Toggle Button (Only show when there are results) */}
      {list.length > 0 && !showResultsSearch && (
        <div className="mb-4">
          <button
            onClick={() => setShowResultsSearch(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Search className="h-3 w-3" />
            Search within results
          </button>
        </div>
      )}

      {/* Search Box for Results (Collapsible) */}
      {showResultsSearch && list.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Part No or Description..."
            className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={() => setShowResultsSearch(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          {search && (
            <span className="text-xs text-gray-500">
              {filtered.length} of {list.length} items
            </span>
          )}
        </div>
      )}

      {/* Results Count and Items Per Page */}
      {list.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} entries
            {search && ` (filtered from ${list.length} total)`}
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
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading stock consolidation data…
          </p>
        </div>
      )}

      {/* No Data Message */}
      {!loading && list.length === 0 && selectedDate && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Stock Data Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please select parameters and click "Search" to view stock consolidation.
          </p>
          <button
            onClick={handleSearch}
            disabled={!selectedDate}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm"
          >
            Search
          </button>
        </div>
      )}

      {/* Table - Compact Design */}
      {!loading && list.length > 0 && (
        <>
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                    <th className="p-2 text-left w-12">S.No</th>
                    <th className="p-2 text-left font-medium">Part No</th>
                    <th className="p-2 text-left font-medium">Part Description</th>
                    <th className="p-2 text-left font-medium">Available Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map((item, i) => (
                    <tr
                      key={item.key || `item-${i}`}
                      className="border-t border-gray-200 dark:border-gray-700 
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-2">{startIndex + i + 1}</td>
                      <td className="p-2 font-medium">{item.partNo || '-'}</td>
                      <td className="p-2">{item.partDesc || '-'}</td>
                      <td className="p-2 text-right font-medium">
                        {parseFloat(item.avlQty || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                
                {/* Footer with Total */}
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td colSpan="3" className="p-2 text-right font-bold text-blue-700 dark:text-blue-300">
                      TOTAL:
                    </td>
                    <td className="p-2 text-right font-bold text-blue-700 dark:text-blue-300">
                      {totalQty.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
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
        </>
      )}
    </div>
  );
};

export default StockConsolidation;