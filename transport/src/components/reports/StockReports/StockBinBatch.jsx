// StockBinBatchStatusWise.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { stockBinBatchAPI } from "../../../api/stockbinbatchAPI";
import { useToast } from "../../Toast/ToastContext"; // Import your toast context


const StockBinBatchStatusWise = () => {
  // State for search and data
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Filters state
  const [selectedDate, setSelectedDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [partNo, setPartNo] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [binNo, setBinNo] = useState("");
  const [status, setStatus] = useState("");
  
  // Dropdown lists
  const [partList, setPartList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [binList, setBinList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const { addToast } = useToast(); // Use your toast context
  
  // Dropdown visibility
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [showBinDropdown, setShowBinDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Search filters
  const [partSearch, setPartSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [binSearch, setBinSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("");
  
  // Results search
  const [showResultsSearch, setShowResultsSearch] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global parameters from localStorage
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";

  // Initialize part list
  useEffect(() => {
    fetchPartList();
  }, []);

  // Fetch part list
  const fetchPartList = useCallback(async () => {
    try {
      const response = await stockBinBatchAPI.getPartList({
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        warehouse: loginWarehouse,
      });

      if (response?.status === true) {
        const parts = response.paramObjectsMap?.stockDetails || [];
        const allParts = [
          { partNo: "ALL", partDesc: "All Parts", id: null },
          ...parts
        ];
        setPartList(allParts);
      }
    } catch (error) {
      console.error("Error fetching part list:", error);
      addToast("error", "Failed to load parts list");
    }
  }, [loginBranchCode, loginClient, loginCustomer, orgId, loginWarehouse]);

  // Fetch batch list when partNo changes
  useEffect(() => {
    if (partNo && partNo !== "ALL") {
      fetchBatchList(partNo);
    } else if (partNo === "ALL") {
      setBatchList([{ batch: "ALL" }]);
      setBinList([{ bin: "ALL" }]);
      setStatusList([{ status: "ALL" }]);
      setBatchNo("ALL");
      setBinNo("ALL");
      setStatus("ALL");
    } else {
      setBatchList([]);
      setBatchNo("");
    }
  }, [partNo]);

  // Fetch bin list when batchNo changes
  useEffect(() => {
    if (batchNo && batchNo !== "ALL" && partNo && partNo !== "ALL") {
      fetchBinList(partNo, batchNo);
    } else if (batchNo === "ALL") {
      setBinList([{ bin: "ALL" }]);
      setStatusList([{ status: "ALL" }]);
      setBinNo("ALL");
      setStatus("ALL");
    } else {
      setBinList([]);
      setBinNo("");
    }
  }, [batchNo, partNo]);

  // Fetch status list when binNo changes
  useEffect(() => {
    if (binNo && binNo !== "ALL" && partNo && partNo !== "ALL" && batchNo && batchNo !== "ALL") {
      fetchStatusList(partNo, batchNo, binNo);
    } else if (binNo === "ALL") {
      setStatusList([{ status: "ALL" }]);
      setStatus("ALL");
    } else {
      setStatusList([]);
      setStatus("");
    }
  }, [binNo, partNo, batchNo]);

  // API functions
  const fetchBatchList = async (partNumber) => {
    try {
      const response = await stockBinBatchAPI.getBatchList({
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        warehouse: loginWarehouse,
        partNo: partNumber,
      });

      if (response?.status === true) {
        setBatchList(response.paramObjectsMap?.stockDetails || []);
      } else {
        setBatchList([]);
      }
    } catch (error) {
      console.error("Error fetching batch list:", error);
      setBatchList([]);
    }
  };

  const fetchBinList = async (partNumber, batchNumber) => {
    try {
      const response = await stockBinBatchAPI.getBinList({
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        warehouse: loginWarehouse,
        partNo: partNumber,
        batch: batchNumber,
      });

      if (response?.status === true) {
        setBinList(response.paramObjectsMap?.stockDetails || []);
      } else {
        setBinList([]);
      }
    } catch (error) {
      console.error("Error fetching bin list:", error);
      setBinList([]);
    }
  };

  const fetchStatusList = async (partNumber, batchNumber, binNumber) => {
    try {
      const response = await stockBinBatchAPI.getStatusList({
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        warehouse: loginWarehouse,
        partNo: partNumber,
        batch: batchNumber,
        bin: binNumber,
      });

      if (response?.status === true) {
        setStatusList(response.paramObjectsMap?.stockDetails || []);
      } else {
        setStatusList([]);
      }
    } catch (error) {
      console.error("Error fetching status list:", error);
      setStatusList([]);
    }
  };

  // Main search function
  const fetchStockReport = useCallback(async () => {
    // Validate required fields
    if (!partNo) {
      addToast("error", "Please select Part No");
      return;
    }
    if (!batchNo) {
      addToast("error", "Please select Batch No");
      return;
    }
    if (!binNo) {
      addToast("error", "Please select Bin");
      return;
    }
    if (!status) {
      addToast("error", "Please select Status");
      return;
    }

    setLoading(true);
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        warehouse: loginWarehouse,
        partNo: partNo,
        batch: batchNo,
        bin: binNo,
        status: status,
      };

      const response = await stockBinBatchAPI.getStockReport(params);

      if (response?.status === true) {
        const stockDetails = response.paramObjectsMap?.stockDetails || [];
        const dataWithKeys = stockDetails.map((item, index) => ({
          ...item,
          key: index,
          sno: index + 1,
        }));
        setList(dataWithKeys);
        addToast("success", `Loaded ${stockDetails.length} items`);
      } else {
        setList([]);
        addToast("error", response.paramObjectsMap?.errorMessage || "No data found");
      }
    } catch (error) {
      console.error("Error:", error);
      setList([]);
      addToast("error", "Failed to fetch stock data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partNo, batchNo, binNo, status, loginBranchCode, loginClient, loginCustomer, orgId, loginWarehouse]);

  // Handler functions
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchStockReport();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStockReport();
  };

  const handleClearFilters = () => {
    setSelectedDate(dayjs().format("DD-MM-YYYY"));
    setPartNo("");
    setBatchNo("");
    setBinNo("");
    setStatus("");
    setPartSearch("");
    setBatchSearch("");
    setBinSearch("");
    setStatusSearch("");
    setShowResultsSearch(false);
    setCurrentPage(1);
    setList([]);
    setBatchList([]);
    setBinList([]);
    setStatusList([]);
  };

  const handlePartSelect = (selectedPartNo) => {
    setPartNo(selectedPartNo);
    setShowPartDropdown(false);
    setPartSearch("");
    setBatchNo("");
    setBinNo("");
    setStatus("");
  };

  const handleBatchSelect = (selectedBatchNo) => {
    setBatchNo(selectedBatchNo);
    setShowBatchDropdown(false);
    setBatchSearch("");
    setBinNo("");
    setStatus("");
  };

  const handleBinSelect = (selectedBinNo) => {
    setBinNo(selectedBinNo);
    setShowBinDropdown(false);
    setBinSearch("");
    setStatus("");
  };

  const handleStatusSelect = (selectedStatus) => {
    setStatus(selectedStatus);
    setShowStatusDropdown(false);
    setStatusSearch("");
  };

  // Get display names for selected values
  const getSelectedPartDisplay = () => {
    if (!partNo) return "Select Part";
    if (partNo === "ALL") return "All Parts";
    const selectedPart = partList.find(p => p.partNo === partNo);
    return selectedPart ? `${selectedPart.partNo} - ${selectedPart.partDesc}` : partNo;
  };

  const getSelectedBatchDisplay = () => {
    if (!batchNo) return "Select Batch";
    if (batchNo === "ALL") return "All Batches";
    return batchNo;
  };

  const getSelectedBinDisplay = () => {
    if (!binNo) return "Select Bin";
    if (binNo === "ALL") return "All Bins";
    return binNo;
  };

  const getSelectedStatusDisplay = () => {
    if (!status) return "Select Status";
    if (status === "ALL") return "All Status";
    return status;
  };

  // Filtered lists for dropdowns
  const filteredParts = useMemo(() => {
    if (!partSearch.trim()) return partList;
    const searchLower = partSearch.toLowerCase();
    return partList.filter(part => 
      (part.partNo && part.partNo.toLowerCase().includes(searchLower)) ||
      (part.partDesc && part.partDesc.toLowerCase().includes(searchLower))
    );
  }, [partList, partSearch]);

  const filteredBatches = useMemo(() => {
    if (!batchSearch.trim()) return batchList;
    const searchLower = batchSearch.toLowerCase();
    return batchList.filter(batch => 
      batch.batch && batch.batch.toLowerCase().includes(searchLower)
    );
  }, [batchList, batchSearch]);

  const filteredBins = useMemo(() => {
    if (!binSearch.trim()) return binList;
    const searchLower = binSearch.toLowerCase();
    return binList.filter(bin => 
      bin.bin && bin.bin.toLowerCase().includes(searchLower)
    );
  }, [binList, binSearch]);

  const filteredStatuses = useMemo(() => {
    if (!statusSearch.trim()) return statusList;
    const searchLower = statusSearch.toLowerCase();
    return statusList.filter(statusItem => 
      statusItem.status && statusItem.status.toLowerCase().includes(searchLower)
    );
  }, [statusList, statusSearch]);

  // Excel export
  const handleExcelDownload = () => {
    if (list.length === 0) {
      addToast("warning", "No data to export");
      return;
    }

    setDownloadLoading(true);
    try {
      const workbook = XLSX.utils.book_new();
      const headerRow = [
        "S.No",
        "Part No",
        "Part Description",
        "Batch",
        "Bin",
        "Status",
        "Available Quantity",
      ];

      const dataRows = list.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.batch || "-",
        item.bin || "-",
        item.status || "-",
        parseFloat(item.avlQty || 0),
      ]);

      const totalQty = list.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0);
      
      const summaryRows = [
        [],
        ["", "", "", "", "", "", ""],
        ["", "", "", "Report Parameters:", "", "", ""],
        ["", "", "", "Part No:", partNo, "", ""],
        ["", "", "", "Batch:", batchNo, "", ""],
        ["", "", "", "Bin:", binNo, "", ""],
        ["", "", "", "Status:", status, "", ""],
        ["", "", "", "Branch Code:", loginBranchCode, "", ""],
        ["", "", "", "Warehouse:", loginWarehouse, "", ""],
        [],
        ["", "", "", "SUMMARY:", "", "", ""],
        ["", "", "", "TOTAL QUANTITY:", totalQty, "", ""],
        ["", "", "", "TOTAL ITEMS:", list.length, "", ""],
        ["", "", "", "REPORT DATE:", selectedDate, "", ""],
        ["", "", "", "GENERATED ON:", dayjs().format("DD-MM-YYYY HH:mm:ss"), "", ""],
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
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Bin Batch Status");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `Stock_Bin_Batch_Status_${selectedDate.replace(/\//g, '-')}.xlsx`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      addToast("success", "Excel report downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      addToast("error", "Failed to export Excel report");
    } finally {
      setDownloadLoading(false);
    }
  };



  // Filter items based on search
  const filtered = useMemo(() => {
    if (!search) return list;
    const searchLower = search.toLowerCase();
    return list.filter(item => 
      (item.partNo && item.partNo.toLowerCase().includes(searchLower)) ||
      (item.partDesc && item.partDesc.toLowerCase().includes(searchLower)) ||
      (item.batch && item.batch.toLowerCase().includes(searchLower)) ||
      (item.bin && item.bin.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower))
    );
  }, [list, search]);

  // Calculate total quantity
  const totalQty = useMemo(() => 
    filtered.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0),
    [filtered]
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  // Render dropdown component
  const renderDropdown = ({
    label,
    value,
    displayValue,
    showDropdown,
    setShowDropdown,
    searchValue,
    setSearchValue,
    filteredItems,
    onSelect,
    disabled = false,
    getItemLabel = (item) => item,
    getItemDisplay = (item) => item,
    placeholder = "Select...",
  }) => (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div
        className={`w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
          cursor-pointer flex justify-between items-center min-h-[36px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <span className="truncate text-xs">
          {displayValue || placeholder}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </div>
      
      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          rounded-md shadow-lg max-h-48 overflow-y-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-1 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-6 pr-6 py-1 text-xs border border-gray-300 dark:border-gray-600 
                  rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          
          {/* Options List */}
          <div className="py-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${value === getItemLabel(item) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                  onClick={() => onSelect(getItemLabel(item))}
                >
                  {getItemDisplay(item)}
                </div>
              ))
            ) : (
              <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Bin Batch Status Wise Report
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            View stock summary by Bin, Batch and Status
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || !partNo || !batchNo || !binNo || !status}
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

      {/* Filters Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date Filter */}
           
          {/* Date Filter - Very Compact */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate.includes("-") ? dayjs(selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD") : selectedDate}
                onChange={(e) => {
                  const newDate = dayjs(e.target.value).format("DD-MM-YYYY");
                  setSelectedDate(newDate);
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Calendar className="h-3 w-3 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          {/* Part No Dropdown */}
          {renderDropdown({
            label: "Part No *",
            value: partNo,
            displayValue: getSelectedPartDisplay(),
            showDropdown: showPartDropdown,
            setShowDropdown: setShowPartDropdown,
            searchValue: partSearch,
            setSearchValue: setPartSearch,
            filteredItems: filteredParts,
            onSelect: handlePartSelect,
            getItemLabel: (item) => item.partNo,
            getItemDisplay: (item) => (
              <>
                <div className="font-medium truncate">{item.partNo}</div>
                {item.partDesc && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {item.partDesc}
                  </div>
                )}
              </>
            ),
          })}
          
          {/* Batch No Dropdown */}
          {renderDropdown({
            label: "Batch No *",
            value: batchNo,
            displayValue: getSelectedBatchDisplay(),
            showDropdown: showBatchDropdown,
            setShowDropdown: setShowBatchDropdown,
            searchValue: batchSearch,
            setSearchValue: setBatchSearch,
            filteredItems: filteredBatches,
            onSelect: handleBatchSelect,
            disabled: !partNo || partNo === "ALL",
            getItemLabel: (item) => item.batch,
            getItemDisplay: (item) => item.batch,
          })}
          
          {/* Bin No Dropdown */}
          {renderDropdown({
            label: "Bin *",
            value: binNo,
            displayValue: getSelectedBinDisplay(),
            showDropdown: showBinDropdown,
            setShowDropdown: setShowBinDropdown,
            searchValue: binSearch,
            setSearchValue: setBinSearch,
            filteredItems: filteredBins,
            onSelect: handleBinSelect,
            disabled: !batchNo || batchNo === "ALL",
            getItemLabel: (item) => item.bin,
            getItemDisplay: (item) => item.bin,
          })}
          
          {/* Status Dropdown */}
          {renderDropdown({
            label: "Status *",
            value: status,
            displayValue: getSelectedStatusDisplay(),
            showDropdown: showStatusDropdown,
            setShowDropdown: setShowStatusDropdown,
            searchValue: statusSearch,
            setSearchValue: setStatusSearch,
            filteredItems: filteredStatuses,
            onSelect: handleStatusSelect,
            disabled: !binNo || binNo === "ALL",
            getItemLabel: (item) => item.status,
            getItemDisplay: (item) => item.status,
          })}
          
          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={!partNo || !batchNo || !binNo || !status || loading}
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
        {(partNo || batchNo || binNo || status) && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                <Filter className="h-3 w-3 inline mr-1" />
                Active Filters:
              </span>
              {partNo && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                  Part: {partNo === "ALL" ? "All Parts" : partNo}
                </span>
              )}
              {batchNo && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                  Batch: {batchNo === "ALL" ? "All Batches" : batchNo}
                </span>
              )}
              {binNo && (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">
                  Bin: {binNo === "ALL" ? "All Bins" : binNo}
                </span>
              )}
              {status && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded">
                  Status: {status === "ALL" ? "All Status" : status}
                </span>
              )}
              {list.length > 0 && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">
                  Items: {list.length} | Qty: {totalQty.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showPartDropdown || showBatchDropdown || showBinDropdown || showStatusDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowPartDropdown(false);
            setShowBatchDropdown(false);
            setShowBinDropdown(false);
            setShowStatusDropdown(false);
          }}
        />
      )}

      {/* Search Toggle Button */}
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

      {/* Search Box for Results */}
      {showResultsSearch && list.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Part No, Description, Batch, Bin, or Status..."
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
            Loading stock data…
          </p>
        </div>
      )}

      {/* No Data Message */}
      {!loading && list.length === 0 && partNo && batchNo && binNo && status && (
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
            No stock found for the selected filters.
          </p>
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
                    <th className="p-2 text-left w-12">S.No</th>
                    <th className="p-2 text-left font-medium">Part No</th>
                    <th className="p-2 text-left font-medium">Part Description</th>
                    <th className="p-2 text-left font-medium">Batch</th>
                    <th className="p-2 text-left font-medium">Bin</th>
                    <th className="p-2 text-left font-medium">Status</th>
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
                      <td className="p-2">{item.batch || '-'}</td>
                      <td className="p-2">{item.bin || '-'}</td>
                      <td className="p-2">{item.status || '-'}</td>
                      <td className="p-2 text-right font-medium">
                        {parseFloat(item.avlQty || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                
                {/* Footer with Total */}
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td colSpan="6" className="p-2 text-right font-bold text-blue-700 dark:text-blue-300">
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
              </div>

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

export default StockBinBatchStatusWise;