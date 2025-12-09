import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Box,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { stockBatchWiseAPI } from "../../../api/stockbatchwiseAPI";
import { stockLedgerAPI } from "../../../api/stockledgerAPI";
import { useToast } from "../../Toast/ToastContext"; // Import your toast context

const StockBatchWise = () => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Filters
  const [partNo, setPartNo] = useState("");
  const [batch, setBatch] = useState("");
  const [partList, setPartList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  
  // Dropdown states
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  
  // Toggle search box
  const [showResultsSearch, setShowResultsSearch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { addToast } = useToast(); // Use your toast context
  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";

  // Debug useEffect
  useEffect(() => {
    console.log("Current state:", {
      partNo,
      batch,
      listLength: list.length,
      loading,
      partListLength: partList.length,
      batchListLength: batchList.length,
      loginBranchCode,
      loginClient,
      loginCustomer,
      loginWarehouse,
      orgId
    });
  }, [partNo, batch, list, loading, partList, batchList]);

  useEffect(() => {
    fetchPartList();
  }, []);

  // Fetch part list - FIXED
  const fetchPartList = async () => {
    try {
      console.log("Fetching part list with:", { loginBranchCode, loginClient, orgId });
      const parts = await stockLedgerAPI.getAllActivePartDetails(loginBranchCode, loginClient, orgId);
      console.log("Parts received:", parts);
      
      const allParts = [
        { partno: "ALL", partDesc: "All Parts", id: null },
        ...parts.map(p => ({ 
          ...p, 
          partNo: p.partno,
          partDesc: p.partDesc || p.partno 
        }))
      ];
      setPartList(allParts);
      console.log("Part list set:", allParts);
      
    } catch (error) {
      
      addToast("error", "Failed to load parts"); // Toast instead of alert
      
    }
  };

  // Handle part selection
  const handlePartSelect = async (selectedPartNo) => {
    console.log("Part selected:", selectedPartNo);
    setPartNo(selectedPartNo);
    setShowPartDropdown(false);
    setPartSearch("");
    setBatch("");
    setBatchList([]);

    if (selectedPartNo === "ALL") {
      setBatchList([{ batch: "ALL", partNo: "", partDesc: "All Batches" }]);
      setBatch("ALL");
    } else if (selectedPartNo) {
      await fetchBatchList(selectedPartNo);
    }
  };

  // Fetch batch list for selected part - FIXED
  const fetchBatchList = async (selectedPartNo) => {
    try {
      console.log("Fetching batch list for part:", selectedPartNo);
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        partNo: selectedPartNo,
        warehouse: loginWarehouse
      };
      console.log("Batch list params:", params);
      
      const response = await stockBatchWiseAPI.getBatchForBatchWiseReport(params);
      console.log("Batch list response:", response);

      if (response?.status === true) {
        const batches = response.paramObjectsMap?.stockDetails || [];
        console.log("Batches received:", batches);
        
        const allBatches = [
          { batch: "ALL", partNo: "", partDesc: "All Batches" },
          ...batches.map(b => ({
            ...b,
            batch: b.batch || b.batchNo || ""
          }))
        ];
        setBatchList(allBatches);
        setBatch("ALL");
        console.log("Batch list set:", allBatches);
      } else {
        console.warn("No batches found or API error");
        setBatchList([{ batch: "ALL", partNo: "", partDesc: "All Batches" }]);
        setBatch("ALL");
      }
    } catch (error) {
      console.error("Error fetching batch list:", error);
      setBatchList([{ batch: "ALL", partNo: "", partDesc: "All Batches" }]);
      setBatch("ALL");
    }
  };

  // Fetch stock batch wise data - FIXED
  const fetchStockBatchWise = async () => {
    if (!partNo || !batch) {
      addToast("error", "Please select both Part No and Batch"); // Toast instead of alert
      return;
    }

    setLoading(true);
    try {
      const params = {
        batch: batch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        orgId: orgId,
        partNo: partNo,
        warehouse: loginWarehouse
      };
      
      console.log("Fetching stock data with params:", params);
      const response = await stockBatchWiseAPI.getStockReportBatchWise(params);
      console.log("Stock data response:", response);

      if (response?.status === true) {
        const stockDetails = response.paramObjectsMap?.stockDetails || [];
        console.log("Stock details received:", stockDetails);
        
        const dataWithKeys = stockDetails.map((item, index) => ({
          ...item,
          key: index,
          sno: index + 1,
          partNo: item.partNo || item.partno || "",
          partDesc: item.partDesc || "",
          batch: item.batch || item.batchNo || "",
          avlQty: parseFloat(item.avlQty || 0)
        }));
        
        setList(dataWithKeys);
        console.log("List set with data:", dataWithKeys);
        addToast("success", "Loaded ${stockDetails.length} items"); // Toast instead of alert
      } else {
        console.warn("No data found in response");
        setList([]);
        addToast("error", response.paramObjectsMap?.errorMessage || "No data found"); // Toast instead of alert
        
      }
    } catch (error) {
      console.error("Error fetching stock batch wise data:", error);
      setList([]);
      
      addToast("error", "Failed to fetch stock batch wise data" || "No data found"); // Toast instead of alert
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchStockBatchWise();
  };

  const handleSearch = () => {
    if (!partNo || !batch) {
      
      addToast("error", "Please select both Part No and Batch" || "No data found"); // Toast instead of alert
      return;
    }
    setCurrentPage(1);
    fetchStockBatchWise();
  };

  const handleClearFilters = () => {
    setPartNo("");
    setBatch("");
    setPartSearch("");
    setBatchSearch("");
    setSearch("");
    setShowResultsSearch(false);
    setCurrentPage(1);
    setList([]);
    setBatchList([]);
  };

  const handleBatchSelect = (selectedBatch) => {
    console.log("Batch selected:", selectedBatch);
    const batchValue = selectedBatch?.batch || selectedBatch;
    setBatch(batchValue);
    setShowBatchDropdown(false);
    setBatchSearch("");
  };

  const handleExcelDownload = () => {
    if (list.length === 0) {
      
      addToast("warning", "No data to export" || "No data found"); // Toast instead of alert
      return;
    }

    setDownloadLoading(true);
    try {
      const workbook = XLSX.utils.book_new();

      const headerRow = [
        "S.No",
        "Part No",
        "Part Description",
        "Batch No",
        "Available Quantity",
      ];

      const dataRows = list.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.batch || "-",
        parseFloat(item.avlQty || 0),
      ]);

      const totalQty = list.reduce((sum, item) => sum + parseFloat(item.avlQty || 0), 0);
      const summaryRows = [
        [],
        ["", "", "", "TOTAL QUANTITY:", totalQty],
        ["", "", "", "TOTAL ITEMS:", list.length],
        ["", "", "", "REPORT DATE:", dayjs().format("YYYY-MM-DD")],
        ["", "", "", "GENERATED ON:", dayjs().format("YYYY-MM-DD HH:mm:ss")],
      ];

      const excelData = [headerRow, ...dataRows, ...summaryRows];
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

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

        const summaryStartRow = dataRows.length + 1;
        for (let R = summaryStartRow; R <= summaryStartRow + 4; R++) {
          for (let C = 3; C <= 4; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[cellAddress]) {
              if (C === 3) {
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "E6E6FA" } },
                };
              } else {
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "F0F8FF" } },
                };
              }
            }
          }
        }
      }

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Batch Summary");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `Stock_Batch_Summary_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      addToast("success", "Excel report with summary downloaded" || "No data found"); // Toast instead of alert
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      
      addToast("error", "Failed to export Excel report" || "No data found"); // Toast instead of alert
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
      (item.batch && item.batch.toLowerCase().includes(searchLower))
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
    const selectedPart = partList.find(p => p.partno === partNo || p.partNo === partNo);
    return selectedPart ? `${selectedPart.partno || selectedPart.partNo} - ${selectedPart.partDesc}` : partNo;
  };

  // Get selected batch display name
  const getSelectedBatchDisplay = () => {
    if (!batch) return "Select Batch";
    if (batch === "ALL") return "All Batches";
    const selectedBatch = batchList.find(b => b.batch === batch);
    return selectedBatch ? selectedBatch.batch : batch;
  };

  // Filtered parts based on search
  const filteredParts = useMemo(() => {
    if (!partSearch.trim()) return partList;
    
    const searchLower = partSearch.toLowerCase();
    return partList.filter(part => 
      (part.partno && part.partno.toLowerCase().includes(searchLower)) ||
      (part.partDesc && part.partDesc.toLowerCase().includes(searchLower)) ||
      (part.partNo && part.partNo.toLowerCase().includes(searchLower))
    );
  }, [partList, partSearch]);

  // Filtered batches based on search
  const filteredBatches = useMemo(() => {
    if (!batchSearch.trim()) return batchList;
    
    const searchLower = batchSearch.toLowerCase();
    return batchList.filter(batchItem => 
      (batchItem.batch && batchItem.batch.toLowerCase().includes(searchLower)) ||
      (batchItem.partNo && batchItem.partNo.toLowerCase().includes(searchLower)) ||
      (batchItem.partDesc && batchItem.partDesc.toLowerCase().includes(searchLower))
    );
  }, [batchList, batchSearch]);

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
      {/* Header - Compact */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Batch Wise Report
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            To View Your Stock Summary by Batch
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || !partNo || !batch}
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
          {/* Part No Filter - Searchable Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Part No *
            </label>
            <div className="relative">
              <div
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                cursor-pointer flex justify-between items-center min-h-[36px]"
                onClick={() => setShowPartDropdown(!showPartDropdown)}
              >
                <span className="truncate text-xs">
                  {getSelectedPartDisplay()}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showPartDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {showPartDropdown && (
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
                          key={part.id || part.partno}
                          className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                          ${partNo === (part.partno || part.partNo) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handlePartSelect(part.partno || part.partNo)}
                        >
                          <div className="font-medium truncate">{part.partno || part.partNo}</div>
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
            {showPartDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowPartDropdown(false)}
              />
            )}
          </div>
          
          {/* Batch Filter - Searchable Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Batch *
            </label>
            <div className="relative">
              <div
                className={`w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                cursor-pointer flex justify-between items-center min-h-[36px] ${!partNo ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => partNo && setShowBatchDropdown(!showBatchDropdown)}
              >
                <span className="truncate text-xs">
                  {getSelectedBatchDisplay()}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showBatchDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {showBatchDropdown && partNo && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-1 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search batches..."
                        className="w-full pl-6 pr-6 py-1 text-xs border border-gray-300 dark:border-gray-600 
                        rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={batchSearch}
                        onChange={(e) => setBatchSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {batchSearch && (
                        <button
                          onClick={() => setBatchSearch("")}
                          className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Options List */}
                  <div className="py-1">
                    {filteredBatches.length > 0 ? (
                      filteredBatches.map((batchItem, index) => {
                        const isAllOption = batchItem.batch === "ALL";
                        return (
                          <div
                            key={batchItem.batch || index}
                            className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                            ${batch === batchItem.batch ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                            onClick={() => handleBatchSelect(batchItem.batch)}
                          >
                            <div className="font-medium truncate">
                              {batchItem.batch}
                              {isAllOption && " (All Batches)"}
                            </div>
                            {batchItem.partDesc && !isAllOption && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                {batchItem.partDesc}
                              </div>
                            )}
                            {isAllOption && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                Select all batches
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                        {partNo ? 'No batches found' : 'Please select a part first'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showBatchDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowBatchDropdown(false)}
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={!partNo || !batch || loading}
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
        {partNo && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                <Filter className="h-3 w-3 inline mr-1" />
                Active Filters:
              </span>
              
              {/* Part Filter Chip - Blue */}
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                Part: {getSelectedPartDisplay()}
              </span>
              
              {/* Batch Filter Chip - Green */}
              {batch && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                  Batch: {getSelectedBatchDisplay()}
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



     {/* This button shows when list has items AND showResultsSearch is false */}
{list.length > 0 && !showResultsSearch && (
  <button onClick={() => setShowResultsSearch(true)}>
    Search within results
  </button>
)}

{/* This search box shows when list has items AND showResultsSearch is true */}
{showResultsSearch && list.length > 0 && (
  <div className="search-box">
    <input type="text" />
    <button onClick={() => setShowResultsSearch(false)}>X</button>
  </div>
)}

      {/* Search Box for Results (Collapsible) */}
      {showResultsSearch && list.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Part No, Description, or Batch..."
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
            Loading stock batch wise data…
          </p>
        </div>
      )}

      {/* No Data Message - Updated with more info */}
      {!loading && list.length === 0 && partNo && batch && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 mb-3">
            <Box className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Stock Data Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Selected: Part="{partNo}", Batch="{batch}"
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please check your selections and try again.
          </p>
          <button
            onClick={handleSearch}
            disabled={!partNo || !batch}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm"
          >
            Try Again
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
                    <th className="p-2 text-left font-medium">Batch No</th>
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
                      <td className="p-2 font-medium">{item.batch || '-'}</td>
                      <td className="p-2 text-right font-medium">
                        {parseFloat(item.avlQty || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                
                {/* Footer with Total */}
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td colSpan="4" className="p-2 text-right font-bold text-blue-700 dark:text-blue-300">
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

export default StockBatchWise;