import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Package,
  Box,
  X,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { stockConsolidationBinWiseAPI } from "../../../api/stockconsolidationbinwiseAPI";
import { useToast } from "../../Toast/ToastContext"; // Import toast context

const StockConsolidationBinWise = () => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Filters
  const [partNo, setPartNo] = useState("");
  const [bin, setBin] = useState("");
  const [partList, setPartList] = useState([]);
  const [binList, setBinList] = useState([]);
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showBinDropdown, setShowBinDropdown] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [binSearch, setBinSearch] = useState("");
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
  const { addToast } = useToast();

  useEffect(() => {
    fetchPartList();
  }, []);

  // Fetch part list
  const fetchPartList = async () => {
    try {
      const response = await stockConsolidationBinWiseAPI.getPartList({
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
        
        // Add "ALL" option at the beginning (exactly like original)
        const allParts = [
          { partno: "ALL", partDesc: "All Parts", id: null },
          ...filteredParts
        ];
        setPartList(allParts);
      }
    } catch (error) {
      console.error("Error fetching part list:", error);
      addToast("Failed to load parts", "error"); // Toast instead of alert
    }
  };

  // Fetch bin list when part is selected (exactly like original)
  const handlePartSelect = (selectedPartNo) => {
    setPartNo(selectedPartNo);
    setShowPartDropdown(false);
    setPartSearch("");
    
    // Clear bin when part changes
    setBin("");
    
    // If "ALL" is selected for parts, clear bin list and set bin to empty
    if (selectedPartNo === "ALL") {
      setBinList([{ bin: "ALL", Bin: "ALL", partNo: "", partDesc: "All Bins" }]);
      // Don't auto-select ALL for bin when ALL is selected for parts
      // Let user choose bin manually
      setBin("");
    } else {
      // For specific part, fetch bins
      getAllBin(selectedPartNo);
    }
  };

  // Filtered parts based on search
  const filteredParts = useMemo(() => {
    if (!partSearch.trim()) return partList;
    
    const searchLower = partSearch.toLowerCase();
    return partList.filter(part => 
      (part.partno && part.partno.toLowerCase().includes(searchLower)) ||
      (part.partDesc && part.partDesc.toLowerCase().includes(searchLower))
    );
  }, [partList, partSearch]);

  // Filtered bins based on search (matching original structure)
  const filteredBins = useMemo(() => {
    if (!binSearch.trim()) return binList;
    
    const searchLower = binSearch.toLowerCase();
    return binList.filter(binItem => 
      (binItem.bin && binItem.bin.toLowerCase().includes(searchLower)) ||
      (binItem.Bin && binItem.Bin.toLowerCase().includes(searchLower)) ||
      (binItem.partNo && binItem.partNo.toLowerCase().includes(searchLower)) ||
      (binItem.partDesc && binItem.partDesc.toLowerCase().includes(searchLower))
    );
  }, [binList, binSearch]);

  // Fetch stock data (using exact API parameters from original)
  const fetchStockReportBinWise = async () => {
    if (!partNo || !bin) {
      addToast("Please select both Part No and Bin", "error"); // Toast instead of alert
      return;
    }

    setLoading(true);
    try {
      const response = await stockConsolidationBinWiseAPI.getStockReportBinWise({
        bin: bin,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        partNo: partNo,
        warehouse: loginWarehouse
      });

      console.log("API Response:", response);

      if (response?.status === true) {
        const stockDetails = response.paramObjectsMap?.stockDetails || [];
        const dataWithKeys = stockDetails.map((item, index) => ({
          ...item,
          key: index,
          sno: index + 1,
        }));
        setList(dataWithKeys);
        addToast(`Loaded ${stockDetails.length} items`, "success"); // Toast instead of alert
      } else {
        setList([]);
        addToast(response.paramObjectsMap?.errorMessage || "No data found", "error"); // Toast instead of alert
      }
    } catch (error) {
      console.error("Error:", error);
      setList([]);
      addToast("Failed to fetch stock data", "error"); // Toast instead of alert
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchStockReportBinWise();
  };

  const handleSearch = () => {
    if (!partNo || !bin) {
      addToast("Please select both Part No and Bin", "error"); // Toast instead of alert
      return;
    }
    setCurrentPage(1);
    fetchStockReportBinWise();
  };

  const handleClearFilters = () => {
    setPartNo("");
    setBin("");
    setPartSearch("");
    setBinSearch("");
    setSearch("");
    setCurrentPage(1);
    setList([]);
    setBinList([]);
    addToast("Filters cleared", "info"); // Toast notification for clear action
  };

  // Fetch bin list when part is selected (with ALL option)
  const getAllBin = async (selectedPartNo) => {
    // If "ALL" is selected for parts, set bin list with only "ALL" option
    if (selectedPartNo === "ALL") {
      setBinList([{ bin: "ALL", Bin: "ALL", partNo: "", partDesc: "All Bins" }]);
      // Set bin to "ALL" automatically
      setBin("ALL");
      return;
    }

    if (!selectedPartNo) {
      setBinList([]);
      setBin("");
      return;
    }

    try {
      const response = await stockConsolidationBinWiseAPI.getBinNoForBinWise({
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        partNo: selectedPartNo,
        warehouse: loginWarehouse
      });

      if (response?.status === true) {
        const bins = response.paramObjectsMap?.stockDetails || [];
        
        // Add "ALL" option at the beginning
        const allBins = [
          { bin: "ALL", Bin: "ALL", partNo: "", partDesc: "All Bins" },
          ...bins
        ];
        
        setBinList(allBins);
        // Automatically select "ALL" when bins are loaded
        setBin("ALL");
      } else {
        // Even if no bins, add "ALL" option
        setBinList([{ bin: "ALL", Bin: "ALL", partNo: "", partDesc: "All Bins" }]);
        setBin("ALL");
      }
    } catch (error) {
      console.error("Error fetching bin list:", error);
      // Add "ALL" option even on error
      setBinList([{ bin: "ALL", Bin: "ALL", partNo: "", partDesc: "All Bins" }]);
      setBin("ALL");
    }
  };

  const handleBinSelect = (selectedBinObj) => {
    // Handle both bin object structure (from API) or direct string
    const selectedBin = selectedBinObj?.bin || selectedBinObj?.Bin || selectedBinObj;
    setBin(selectedBin);
    setShowBinDropdown(false);
    setBinSearch("");
  };

  const handleExcelDownload = () => {
    if (list.length === 0) {
      addToast("No data to export", "warning"); // Toast instead of alert
      return;
    }

    setDownloadLoading(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Header row
      const headerRow = [
        "S.No",
        "Part No",
        "Part Description",
        "Bin",
        "Available Quantity",
      ];

      // Data rows
      const dataRows = list.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.bin || "-",
        parseFloat(item.avlQty || 0),
      ]);

      // Calculate totals
      const totalQty = list.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0);

      // Summary rows (matching original format)
      const summaryRows = [
        [], // Empty row for spacing
        ["", "", "", "TOTAL QUANTITY:", totalQty],
        ["", "", "", "TOTAL ITEMS:", list.length],
        ["", "", "", "REPORT DATE:", dayjs().format("YYYY-MM-DD")],
        ["", "", "", "GENERATED ON:", dayjs().format("YYYY-MM-DD HH:mm:ss")],
      ];

      // Combine all data
      const excelData = [headerRow, ...dataRows, ...summaryRows];

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Apply styling (matching original)
      if (worksheet["!ref"]) {
        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // Style header row
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

        // Style summary rows
        const summaryStartRow = dataRows.length + 1;
        for (let R = summaryStartRow; R <= summaryStartRow + 4; R++) {
          for (let C = 3; C <= 4; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[cellAddress]) {
              if (C === 3) {
                // Label cells
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "E6E6FA" } },
                };
              } else {
                // Value cells
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "F0F8FF" } },
                };
              }
            }
          }
        }
      }

      // Set column widths
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Bin Summary");

      // Generate and download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `Stock_Bin_Summary_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      addToast("Excel report with summary downloaded", "success"); // Toast instead of alert
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
      (item.partDesc && item.partDesc.toLowerCase().includes(searchLower)) ||
      (item.bin && item.bin.toLowerCase().includes(searchLower))
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

  // Get selected part display name
  const getSelectedPartDisplay = () => {
    if (partNo === "ALL") return "All Parts";
    if (!partNo) return "Select Part";
    const selectedPart = partList.find(p => p.partno === partNo);
    return selectedPart ? `${selectedPart.partno} - ${selectedPart.partDesc}` : partNo;
  };

  // Get selected bin display name
  const getSelectedBinDisplay = () => {
    if (!bin) return "Select Bin";
    // Find bin in binList
    const selectedBin = binList.find(b => b.bin === bin || b.Bin === bin);
    return selectedBin ? (selectedBin.bin || selectedBin.Bin) : bin;
  };

  // Get bin label for dropdown (handles both bin and Bin properties)
  const getBinLabel = (binItem) => {
    return binItem.bin || binItem.Bin || "";
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Stock Consolidation - Bin Wise
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To View Your Stock Summary by Bin
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || !partNo || !bin}
            className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={handleExcelDownload}
            disabled={downloadLoading || list.length === 0}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> 
            {downloadLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Filters Panel - Always Visible */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Report Parameters</h3>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Part No Filter with Search */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Package className="h-4 w-4" />
              Part No *
            </label>
            <div className="relative">
              <div
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                cursor-pointer flex justify-between items-center"
                onClick={() => setShowPartDropdown(!showPartDropdown)}
              >
                <span className="truncate">
                  {getSelectedPartDisplay()}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showPartDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {showPartDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search parts..."
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                        rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={partSearch}
                        onChange={(e) => setPartSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {partSearch && (
                        <button
                          onClick={() => setPartSearch("")}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Options List */}
                  <div className="py-1">
                    {filteredParts.length > 0 ? (
                      filteredParts.map((part) => (
                        <div
                          key={part.id || part.partno}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                          ${partNo === part.partno ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handlePartSelect(part.partno)}
                        >
                          <div className="font-medium">{part.partno}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {part.partDesc}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No parts found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showPartDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowPartDropdown(false)}
              />
            )}
          </div>
          
          {/* Bin Filter with Search */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Box className="h-4 w-4" />
              Bin *
            </label>
            <div className="relative">
              <div
                className={`w-full border ${!bin ? 'border-gray-300' : 'border-gray-300'} dark:${!bin ? 'border-gray-600' : 'border-gray-600'} rounded-md px-3 py-2 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                cursor-pointer flex justify-between items-center ${!partNo ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => partNo && setShowBinDropdown(!showBinDropdown)}
              >
                <span className="truncate">
                  {getSelectedBinDisplay()}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showBinDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {showBinDropdown && partNo && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search bins..."
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                        rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={binSearch}
                        onChange={(e) => setBinSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {binSearch && (
                        <button
                          onClick={() => setBinSearch("")}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Options List - Show ALL option at the top */}
                  <div className="py-1">
                    {filteredBins.length > 0 ? (
                      filteredBins.map((binItem, index) => {
                        const binValue = getBinLabel(binItem);
                        const isAllOption = binValue === "ALL";
                        
                        return (
                          <div
                            key={binItem.id || binValue || index}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                            ${bin === binValue ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                            onClick={() => handleBinSelect(binValue)}
                          >
                            <div className="font-medium">
                              {binValue}
                              {isAllOption && " (All Bins)"}
                            </div>
                            {binItem.partDesc && !isAllOption && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {binItem.partDesc}
                              </div>
                            )}
                            {isAllOption && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Select all bins
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {partNo ? 'No bins found' : 'Please select a part first'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showBinDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowBinDropdown(false)}
              />
            )}
          </div>
          
          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!partNo || !bin || loading}
              className="w-full flex items-center justify-center gap-1.5 bg-purple-600 text-white px-4 py-2 
              rounded-md text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Filter Info */}
        {(partNo || bin) && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                <Filter className="h-3 w-3 inline mr-1" />
                Active Filters:
              </span>
              
              {/* Part Filter Chip - Blue */}
              {partNo && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                  Part: {getSelectedPartDisplay()}
                </span>
              )}
              
              {/* Bin Filter Chip - Green */}
              {bin && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                  Bin: {bin}
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

      {/* Search Box for Results */}
    {/* Search Toggle Button - Shows when there are results but search box is hidden */}
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
      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading stock bin-wise data…
          </p>
        </div>
      )}

      {/* No Data Message */}
      {!loading && list.length === 0 && partNo && bin && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Box className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Stock Data Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No stock found for the selected Part No and Bin.
          </p>
          <button
            onClick={handleSearch}
            disabled={!partNo || !bin}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && list.length > 0 && (
        <>
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                    <th className="p-3 text-left w-14">S.No</th>
                    <th className="p-3 text-left font-medium">Part No</th>
                    <th className="p-3 text-left font-medium">Part Description</th>
                    <th className="p-3 text-left font-medium">Bin</th>
                    <th className="p-3 text-left font-medium">Available Quantity</th>
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
                      <td className="p-3">{startIndex + i + 1}</td>
                      <td className="p-3 font-medium">{item.partNo || '-'}</td>
                      <td className="p-3">{item.partDesc || '-'}</td>
                      <td className="p-3 font-medium">{item.bin || '-'}</td>
                      <td className="p-3 text-right font-medium">
                        {parseFloat(item.avlQty || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                
                {/* Footer with Total */}
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td colSpan="3" className="p-3 text-right font-bold text-blue-700 dark:text-blue-300">
                      TOTAL:
                    </td>
                    <td className="p-3 text-right font-bold text-blue-700 dark:text-blue-300">
                      {totalQty.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Results Count and Items Per Page */}
          <div className="flex justify-between items-center mb-4">
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

export default StockConsolidationBinWise;