import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
} from "lucide-react";
import dayjs from "dayjs";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import sampleFile from "../../../assets/sample-files/sample_data_buyerorder.xls";
import { multipleBOAPI } from "../../../api/multipleBOAPI";
import { useToast } from "../../Toast/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const MultiBuyerOrderList = ({ onSaveSuccess, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [uploadOpen, setUploadOpen] = useState(false);
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
    getPendingBuyerOrderDetails();
  }, [refreshTrigger]);

  const handleSubmit = () => {
    handleBulkUploadClose();
    getPendingBuyerOrderDetails();
  };

  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const getPendingBuyerOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await multipleBOAPI.getPendingBuyerOrderDetails({
        branchCode: loginBranchCode,
        finYear: loginFinYear,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse
      });

      if (response.status === true) {
        const dataWithKeys = response.paramObjectsMap?.pendingOrderDetails?.map((item, index) => ({
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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    getPendingBuyerOrderDetails();
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

  const processSingleBuyerOrder = async (row, index, total) => {
    const formattedOrderDate = row.orderDate ? dayjs(row.orderDate).format("YYYY-MM-DD") : "";
    const formattedRefDate = row.refDate ? dayjs(row.refDate).format("YYYY-MM-DD") : "";
    const formattedInvoiceDate = row.invoiceDate ? dayjs(row.invoiceDate).format("YYYY-MM-DD") : "";

    const requestData = {
      billToName: row.billToName || "",
      branch: loginBranch || "",
      branchCode: loginBranchCode || "",
      buyerName: row.buyerName || "",
      client: loginClient || "",
      createdBy: loginUserName || "",
      customer: loginCustomer || "",
      finYear: loginFinYear || "",
      invoiceDate: formattedInvoiceDate,
      invoiceNo: row.invoiceNo || "",
      orderDate: formattedOrderDate,
      orderNo: row.orderNo || "",
      orgId: orgId || "",
      refDate: formattedRefDate,
      refNo: row.refNo || "",
      shipToName: row.shipToName || "",
      warehouse: loginWarehouse || "",
    };

    try {
      setGenerationStatus((prev) => ({
        ...prev,
        currentItem: `Processing: ${row.orderNo || row.refNo} (${index + 1}/${total})`,
      }));

      const result = await multipleBOAPI.createMultipleBuyerOrder([requestData]);
      const message = result.paramObjectsMap?.message || "";

      if (
        message.toLowerCase().includes("created successfully") ||
        message.toLowerCase().includes("success") ||
        result.status === true
      ) {
        return { success: true, message };
      } else {
        return { success: false, message };
      }
    } catch (err) {
      console.error("Error creating buyer order:", err);
      return {
        success: false,
        message: err.response?.data?.paramObjectsMap?.errorMessage || "Failed",
      };
    }
  };

  const handleGenerateBuyerOrders = async () => {
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

    setIsSubmitting(true);
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

    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      const result = await processSingleBuyerOrder(row, i, selectedRows.length);

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

    setGenerationStatus((prev) => ({
      ...prev,
      processing: false,
      currentItem: null,
    }));

    if (successCount > 0) {
      addToast(`${successCount} Buyer Orders created successfully, ${failedCount} failed.`, "success");
    } else {
      addToast("All Buyer Orders failed.", "error");
    }

    setTimeout(() => {
      handleClear();
      getPendingBuyerOrderDetails();
      setIsSubmitting(false);
      
      // FIX: Check if onSaveSuccess exists before calling it
      if (typeof onSaveSuccess === 'function') {
        onSaveSuccess();
      }
    }, 2000);
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

  const closeGenerationModal = () => {
    setGenerationStatus((prev) => ({ ...prev, processing: false }));
    setIsSubmitting(false);
  };

  const formatDate = (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "");

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.refNo && item.refNo.toLowerCase().includes(searchLower)) ||
      (item.orderNo && item.orderNo.toLowerCase().includes(searchLower)) ||
      (item.invoiceNo && item.invoiceNo.toLowerCase().includes(searchLower)) ||
      (item.shipToName && item.shipToName.toLowerCase().includes(searchLower)) ||
      (item.billToName && item.billToName.toLowerCase().includes(searchLower)) ||
      (item.buyerName && item.buyerName.toLowerCase().includes(searchLower))
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
      {isSubmitting && generationStatus.processing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="mt-4 text-center w-96">
            <h3 className="text-lg font-semibold mb-2">Generating Buyer Orders...</h3>
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
          Pending Buyer Orders
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
            onClick={handleGenerateBuyerOrders}
            disabled={selectedRows.length === 0 || isSubmitting}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isSubmitting ? `Generating... (${selectedRows.length})` : `Generate (${selectedRows.length})`}
          </button>
          
          <button
            onClick={handleBulkUploadOpen}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-green-700 transition"
          >
            <CloudUpload className="h-4 w-4" /> Upload
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
          placeholder="Search by Ref No, Order No, Buyer, or other fields…"
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
            Loading pending orders…
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
                <th className="p-2 text-left font-medium">Ref No</th>
                <th className="p-2 text-left font-medium">Ref Date</th>
                <th className="p-2 text-left font-medium">Order No</th>
                <th className="p-2 text-left font-medium">Order Date</th>
                <th className="p-2 text-left font-medium">Invoice No</th>
                <th className="p-2 text-left font-medium">Invoice Date</th>
                <th className="p-2 text-left font-medium">Ship To Name</th>
                <th className="p-2 text-left font-medium">Bill To Name</th>
                <th className="p-2 text-left font-medium">Buyer Name</th>
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
                    <td className="p-2 font-medium">{item.refNo || '-'}</td>
                    <td className="p-2">{formatDate(item.refDate)}</td>
                    <td className="p-2">{item.orderNo || '-'}</td>
                    <td className="p-2">{formatDate(item.orderDate)}</td>
                    <td className="p-2">{item.invoiceNo || '-'}</td>
                    <td className="p-2">{formatDate(item.invoiceDate)}</td>
                    <td className="p-2">{item.shipToName || '-'}</td>
                    <td className="p-2">{item.billToName || '-'}</td>
                    <td className="p-2">{item.buyerName || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0 ? 'No pending orders found' : 'No orders match your search'}
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

      <CommonBulkUpload
        open={uploadOpen}
        handleClose={handleBulkUploadClose}
        title="Upload Buyer Order Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSubmit}
        sampleFileDownload={sampleFile}
        apiUrl={`${API_URL}/api/buyerOrder/ExcelUploadForBuyerOrder?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&type=DOC&warehouse=${loginWarehouse}`}
        screen="Buyer Order"
        onSuccess={() => {
          getPendingBuyerOrderDetails();
        }}
      />
    </div>
  );
};

export default MultiBuyerOrderList;