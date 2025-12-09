import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Plus,
  Edit,
  Delete,
  Filter,
} from "lucide-react";
import dayjs from "dayjs";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import sampleFile from "../../../assets/sample-files/Sample_Opening_Stock_Upload.xlsx";

import { openingStockAPI } from "../../../api/openingstockAPI";
import { useToast } from "../../Toast/ToastContext";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const OpeningStockList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filters, setFilters] = useState({
    partCode: "",
    binLocation: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();

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

  

  const getOpeningStockList = async () => {
    setLoading(true);
    try {
      const response = await openingStockAPI.getOpeningStockList({
        branchCode: loginBranchCode,
        finYear: loginFinYear,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse,
        customer: loginCustomer
      });

      if (response.status === true) {
        const dataWithKeys = response.paramObjectsMap?.openingStockList?.map((item, index) => ({
          ...item,
          key: index,
          sno: index + 1,
        })) || [];
        setList(dataWithKeys);
      } else {
        addToast(response.paramObjectsMap?.errorMessage || "Failed to fetch opening stock", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to fetch opening stock", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    
  };

  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleSubmit = () => {
    handleBulkUploadClose();
    
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
    const currentPageData = filteredItems.slice(
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

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await openingStockAPI.deleteOpeningStock({
        id: itemToDelete.id,
        branchCode: loginBranchCode,
        finYear: loginFinYear,
        client: loginClient,
        orgId: orgId,
        modifiedBy: loginUserName
      });

      if (response.status === true) {
        addToast("Opening stock deleted successfully", "success");
      } else {
        addToast(response.paramObjectsMap?.errorMessage || "Failed to delete", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to delete opening stock", "error");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      addToast("Please select items to delete", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} item(s)?`)) {
      return;
    }

    try {
      const deletePromises = selectedRows.map(item => 
        openingStockAPI.deleteOpeningStock({
          id: item.id,
          branchCode: loginBranchCode,
          finYear: loginFinYear,
          client: loginClient,
          orgId: orgId,
          modifiedBy: loginUserName
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.status === true).length;
      
      if (successCount > 0) {
        addToast(`Successfully deleted ${successCount} item(s)`, "success");
        setSelectedRows([]);
        setSelectedRowKeys([]);
      } else {
        addToast("Failed to delete items", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to delete items", "error");
    }
  };

  const handleClearFilters = () => {
    setFilters({
      partCode: "",
      binLocation: "",
      status: "",
    });
  };

  const formatDate = (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "");

  // Filter items based on search and filters
  const filteredItems = list.filter((item) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (!(
        (item.partCode && item.partCode.toLowerCase().includes(searchLower)) ||
        (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
        (item.binLocation && item.binLocation.toLowerCase().includes(searchLower)) ||
        (item.batchNo && item.batchNo.toLowerCase().includes(searchLower))
      )) {
        return false;
      }
    }

    if (filters.partCode && item.partCode !== filters.partCode) return false;
    if (filters.binLocation && item.binLocation !== filters.binLocation) return false;
    if (filters.status && item.status !== filters.status) return false;

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

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

  const isAllSelectedOnCurrentPage = () => {
    const currentPageData = currentItems;
    return (
      currentPageData.length > 0 &&
      currentPageData.every((item) => selectedRowKeys.includes(item.key))
    );
  };

  const uniquePartCodes = [...new Set(list.map(item => item.partCode).filter(Boolean))];
  const uniqueBinLocations = [...new Set(list.map(item => item.binLocation).filter(Boolean))];
  const uniqueStatuses = [...new Set(list.map(item => item.status).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this opening stock entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Opening Stock List
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your opening stock entries
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-blue-700 transition"
          >
            <Filter className="h-4 w-4" /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {selectedRows.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 
              rounded-md text-sm hover:bg-red-700 transition"
            >
              <Delete className="h-4 w-4" /> 
              Delete ({selectedRows.length})
            </button>
          )}
          
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-green-700 transition"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
          
          <button
            onClick={handleBulkUploadOpen}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
            rounded-md text-sm hover:bg-purple-700 transition"
          >
            <CloudUpload className="h-4 w-4" /> Upload
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Part Code
              </label>
              <select
                value={filters.partCode}
                onChange={(e) => setFilters({...filters, partCode: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Part Codes</option>
                {uniquePartCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bin Location
              </label>
              <select
                value={filters.binLocation}
                onChange={(e) => setFilters({...filters, binLocation: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Bin Locations</option>
                {uniqueBinLocations.map(bin => (
                  <option key={bin} value={bin}>{bin}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <strong className="text-blue-800 dark:text-blue-200">
            Selected {selectedRows.length} item(s)
          </strong>
          <button
            onClick={() => {
              setSelectedRows([]);
              setSelectedRowKeys([]);
            }}
            className="ml-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Part Code, Part Name, Bin Location, Batch No..."
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        {search && (
          <span className="text-xs text-gray-500">
            {filteredItems.length} results
          </span>
        )}
      </div>

      {/* Results Count and Items Per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} entries
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
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading opening stock entries…
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <th className="p-3 text-left w-14">
                    <input
                      type="checkbox"
                      checked={isAllSelectedOnCurrentPage()}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-3 text-left w-14">S.No</th>
                  <th className="p-3 text-left font-medium">Part Code</th>
                  <th className="p-3 text-left font-medium">Part Name</th>
                  <th className="p-3 text-left font-medium">Bin Location</th>
                  <th className="p-3 text-left font-medium">Batch No</th>
                  <th className="p-3 text-left font-medium">Quantity</th>
                  <th className="p-3 text-left font-medium">UOM</th>
                  <th className="p-3 text-left font-medium">Rate</th>
                  <th className="p-3 text-left font-medium">Value</th>
                  <th className="p-3 text-left font-medium">Created Date</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, i) => (
                    <tr
                      key={item.key || `item-${i}`}
                      className="border-t border-gray-200 dark:border-gray-700 
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedRowKeys.includes(item.key)}
                          onChange={(e) => handleCheckboxChange(e, item)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">{item.sno}</td>
                      <td className="p-3 font-medium">{item.partCode || '-'}</td>
                      <td className="p-3">{item.partName || '-'}</td>
                      <td className="p-3">{item.binLocation || '-'}</td>
                      <td className="p-3">{item.batchNo || '-'}</td>
                      <td className="p-3">{item.quantity || '0'}</td>
                      <td className="p-3">{item.uom || '-'}</td>
                      <td className="p-3">{item.rate || '0.00'}</td>
                      <td className="p-3">{item.value || '0.00'}</td>
                      <td className="p-3">{formatDate(item.createdDate)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Delete className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      {list.length === 0 ? 'No opening stock entries found' : 'No entries match your search or filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} entries
          </div>

          <div className="flex items-center gap-2">
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
        title="Upload Opening Stock Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSubmit}
        sampleFileDownload={sampleFile}
        apiUrl={`${API_URL}/api/Reports/OpeningStockUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Opening Stock"
        
      />
    </div>
  );
};

export default OpeningStockList;