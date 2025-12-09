import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import dayjs from "dayjs";
import { multipickRequestAPI } from "../../../api/MultiPickRequestAPI";
import { useToast } from "../../Toast/ToastContext";

const MultiPickRequestList = ({ onSaveSuccess, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { addToast } = useToast();
  const [generationStatus, setGenerationStatus] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    processing: false,
    currentItem: null,
    results: [],
  });

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginUserName = globalParam?.userName || localStorage.getItem("userName") || "SYSTEM";

  useEffect(() => {
    getPendingPickDetails();
  }, [refreshTrigger]);

  const getPendingPickDetails = async () => {
    setLoading(true);
    try {
      const response = await multipickRequestAPI.getPendingPickDetails({
        branchCode: loginBranchCode,
        finYear: loginFinYear,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse
      });

      if (response.status === true) {
        const dataWithKeys = response.paramObjectsMap?.pendingPickdetails?.map((item, index) => ({
          ...item,
          key: index,
          sno: index + 1,
        })) || [];
        setList(dataWithKeys);
      } else {
        addToast(response.paramObjectsMap?.errorMessage || "Report Fetch failed", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Report Fetch failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    getPendingPickDetails();
  };

  const handleCheckboxChange = (e, record) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRowKeys([...selectedRowKeys, record.key]);
      setSelectedRows([...selectedRows, record]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
      setSelectedRows(selectedRows.filter((row) => row.key !== record.key));
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const currentPageData = list.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if (isChecked) {
      const newSelectedKeys = [
        ...new Set([
          ...selectedRowKeys,
          ...currentPageData.map((item) => item.key),
        ]),
      ];
      const newSelectedRows = [
        ...selectedRows,
        ...currentPageData.filter(
          (item) => !selectedRowKeys.includes(item.key)
        ),
      ];
      setSelectedRowKeys(newSelectedKeys);
      setSelectedRows(newSelectedRows);
    } else {
      const currentPageKeys = currentPageData.map((item) => item.key);
      const newSelectedKeys = selectedRowKeys.filter(
        (key) => !currentPageKeys.includes(key)
      );
      const newSelectedRows = selectedRows.filter(
        (row) => !currentPageKeys.includes(row.key)
      );
      setSelectedRowKeys(newSelectedKeys);
      setSelectedRows(newSelectedRows);
    }
  };

  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return "";

    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    if (typeof dateValue === "string" && dateValue.includes(" ")) {
      return dateValue.split(" ")[0];
    }

    const parsed = dayjs(dateValue);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  };

  const processSinglePickRequest = async (row, index, total) => {
    const requestData = {
      branch: loginBranch,
      branchCode: loginBranchCode,
      buyerOrderDate: formatDateForAPI(row.buyerOrderDate),
      buyerOrderNo: row.buyerOrderNo,
      buyerRefDate: formatDateForAPI(row.buyerRefDate),
      buyerRefNo: row.buyerRefNo,
      buyersReference: row.buyersReference || "",
      client: loginClient,
      clientName: row.clientName,
      clientShortName: row.clientShortName,
      createdBy: loginUserName,
      customer: loginCustomer,
      customerName: row.clientName,
      customerShortName: row.clientShortName,
      finYear: loginFinYear,
      invoiceNo: row.invoiceNo || "",
      orgId: parseInt(orgId, 10) || 0,
      warehouse: loginWarehouse,
    };

    try {
      setGenerationStatus((prev) => ({
        ...prev,
        currentItem: `Processing: ${row.buyerRefNo || "N/A"} (${index + 1}/${total})`,
      }));

      const result = await multipickRequestAPI.createMultiplePickRequest([requestData]);
      const message = result.paramObjectsMap?.message || "";
      const status = result.status;

      const isSuccess = checkPickRequestSuccess(message, status);

      return {
        success: isSuccess,
        message,
        orderNo: row.buyerOrderNo || row.buyerRefNo,
        rawResponse: result,
      };
    } catch (error) {
      console.error("Error creating pick request:", error);
      return {
        success: false,
        message:
          error.response?.data?.paramObjectsMap?.errorMessage ||
          error.response?.data?.paramObjectsMap?.message ||
          error.message ||
          "Network error occurred",
        orderNo: row.buyerOrderNo || row.buyerRefNo,
      };
    }
  };

  const checkPickRequestSuccess = (message, status) => {
    if (!message) return false;

    const messageLower = message.toLowerCase();

    if (
      messageLower.includes("failed") ||
      messageLower.includes("fail") ||
      messageLower.includes("error") ||
      messageLower.includes("invalid") ||
      messageLower.includes("not found") ||
      messageLower.includes("unauthorized") ||
      (messageLower.includes("all") && messageLower.includes("failed"))
    ) {
      return false;
    }

    if (
      messageLower.includes("success") ||
      messageLower.includes("created") ||
      messageLower.includes("completed") ||
      messageLower.includes("processed")
    ) {
      return true;
    }

    return status === true;
  };

  const handleGeneratePickRequests = async () => {
    if (selectedRows.length === 0) {
      addToast("Please select at least one order", "error");
      return;
    }

    const errors = {};
    if (!loginBranch) errors.loginBranch = "Branch is required";
    if (!loginBranchCode) errors.loginBranchCode = "BranchCode is required";
    if (!loginClient) errors.loginClient = "Client is required";
    if (!loginCustomer) errors.loginCustomer = "Customer is required";
    if (!loginWarehouse) errors.loginWarehouse = "Warehouse is required";
    if (!loginFinYear) errors.loginFinYear = "FinYear is required";

    if (Object.keys(errors).length > 0) {
      addToast("Please fix validation errors", "error");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus({
      total: selectedRows.length,
      completed: 0,
      failed: 0,
      processing: true,
      currentItem: null,
      results: [],
    });

    let successCount = 0;
    let failedCount = 0;
    let shouldReload = false;

    try {
      for (let i = 0; i < selectedRows.length; i++) {
        const row = selectedRows[i];
        const result = await processSinglePickRequest(row, i, selectedRows.length);

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }

        setGenerationStatus((prev) => ({
          ...prev,
          completed: successCount,
          failed: failedCount,
          results: [...prev.results, result],
        }));

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      shouldReload = true;
    } catch (error) {
      console.error("Error in handleGeneratePickRequests:", error);
      addToast("An error occurred during processing", "error");
    } finally {
      setGenerationStatus((prev) => ({
        ...prev,
        processing: false,
        currentItem: null,
      }));

      setTimeout(() => {
        if (successCount > 0) {
          addToast(
            `${successCount} Pick Requests created successfully, ${failedCount} failed.`,
            "success"
          );
        } else {
          addToast("All Pick Requests failed.", "error");
        }

        setTimeout(() => {
          handleClear();
          getPendingPickDetails();
          setIsGenerating(false);
          onSaveSuccess();

          if (shouldReload) {
            window.location.reload();
          }
        }, 3000);
      }, 500);
    }
  };

  const handleClear = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setGenerationStatus({
      total: 0,
      completed: 0,
      failed: 0,
      processing: false,
      currentItem: null,
      results: [],
    });
  };

  const closeGenerationModal = () => {
    setGenerationStatus((prev) => ({ ...prev, processing: false }));
    setIsGenerating(false);
  };

  const isAllSelectedOnCurrentPage = () => {
    const currentPageData = list.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return (
      currentPageData.length > 0 &&
      currentPageData.every((item) => selectedRowKeys.includes(item.key))
    );
  };

  const formatDate = (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "");

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.buyerOrderNo && item.buyerOrderNo.toLowerCase().includes(searchLower)) ||
      (item.buyerRefNo && item.buyerRefNo.toLowerCase().includes(searchLower)) ||
      (item.invoiceNo && item.invoiceNo.toLowerCase().includes(searchLower)) ||
      (item.clientName && item.clientName.toLowerCase().includes(searchLower)) ||
      (item.buyersReference && item.buyersReference.toLowerCase().includes(searchLower))
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
      {/* Loading Overlay */}
      {isGenerating && generationStatus.processing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="mt-4 text-center w-96">
            <h3 className="text-lg font-semibold mb-2">Generating Pick Requests...</h3>
            <p className="text-sm mb-4">{generationStatus.currentItem || "Preparing to process..."}</p>
            <div className="flex justify-between text-sm mb-4">
              <span>✅ Completed: {generationStatus.completed}</span>
              <span>❌ Failed: {generationStatus.failed}</span>
              <span>📊 Total: {generationStatus.total}</span>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={closeGenerationModal}
              disabled={generationStatus.processing}
            >
              {generationStatus.processing ? "Processing..." : "Close Results"}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Pick Requests
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
            onClick={handleGeneratePickRequests}
            disabled={selectedRows.length === 0 || isGenerating}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isGenerating ? `Generating... (${selectedRows.length})` : `Generate (${selectedRows.length})`}
          </button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <strong className="text-blue-800 dark:text-blue-200">
            Selected {selectedRows.length} order(s) for processing
          </strong>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Order No, Ref No, Client, or other fields…"
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

      {/* Results Count and Items Per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} orders
          {search && ` for "${search}"`}
        </div>
        
        {/* Items per page selector */}
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
            Loading pending pick requests…
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">
                  <input
                    type="checkbox"
                    checked={isAllSelectedOnCurrentPage()}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Buyer Order No</th>
                <th className="p-2 text-left font-medium">Buyer Order Date</th>
                <th className="p-2 text-left font-medium">Buyer Ref Date</th>
                <th className="p-2 text-left font-medium">Buyer Ref No</th>
                <th className="p-2 text-left font-medium">Buyers Reference</th>
                <th className="p-2 text-left font-medium">Buyers Reference Date</th>
                <th className="p-2 text-left font-medium">Invoice No</th>
                <th className="p-2 text-left font-medium">Client Name</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, i) => (
                  <tr
                    key={item.key || `item-${i}`}
                    className="border-t border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.includes(item.key)}
                        onChange={(e) => handleCheckboxChange(e, item)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">{item.sno}</td>
                    <td className="p-2 font-medium">{item.buyerOrderNo || '-'}</td>
                    <td className="p-2">{formatDate(item.buyerOrderDate)}</td>
                    <td className="p-2">{formatDate(item.buyerRefDate)}</td>
                    <td className="p-2">{item.buyerRefNo || '-'}</td>
                    <td className="p-2">{item.buyersReference || '-'}</td>
                    <td className="p-2">{formatDate(item.buyersReferenceDate)}</td>
                    <td className="p-2">{item.invoiceNo || '-'}</td>
                    <td className="p-2">{item.clientName || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0 ? 'No pending pick requests found' : 'No requests match your search'}
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

export default MultiPickRequestList;