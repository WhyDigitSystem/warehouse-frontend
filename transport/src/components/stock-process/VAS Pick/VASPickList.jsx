import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  FileText,
} from "lucide-react";
import { vasPickAPI ,getAllActiveLocationTypes } from "../../../api/vaspickAPI";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const VasPickList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";

  useEffect(() => {
    fetchVasPick();
  }, [refreshTrigger]);

  const fetchVasPick = async () => {
    try {
      setLoading(true);
      
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
        warehouse: loginWarehouse,
      };

      const response = await vasPickAPI.getAllVasPick(params);
      
      if (response?.status === true) {
        const vasPickList = response.paramObjectsMap?.vasPickVO || [];
        
        if (vasPickList.length > 0) {
          const sortedList = vasPickList.sort((a, b) => (b.id || 0) - (a.id || 0));
          setList(sortedList);
        } else {
          setList([]);
        }
      } else {
        setList([]);
      }
    } catch (error) {
      console.error("Error fetching VAS Picks:", error);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchVasPick();
  };

  // Excel Download Function
  const handleExcelDownload = () => {
    if (list.length === 0) return;

    try {
      const excelData = list.map((item) => ({
        "VAS Pick ID": item.docId,
        "Document Date": formatDateForDisplay(item.docDate),
        "Picked Bin": item.picBin,
        "Status": getStatusDisplay(item),
        "Picked QTY": item.pickedQty || 0,
        "Stock State": item.stockState || "",
        "Created By": item.createdBy || "",
        "Created Date": formatDateForDisplay(item.createdDate),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "VAS Pick List");

      const fileName = `VAS_Pick_List_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts[0].length === 4) {
          return dayjs(dateString, "YYYY-MM-DD").format("DD/MM/YYYY");
        } else if (parts[0].length === 2) {
          return dateString;
        }
      }
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      console.warn("Date formatting error:", error, dateString);
      return dateString;
    }
  };

  // Determine status based on available fields
  const getStatusDisplay = (item) => {
    if (item.cancel === true) return "CANCELLED";
    if (item.freeze === true) return "CONFIRMED";
    if (item.active === false) return "INACTIVE";
    if (item.status) return item.status.toUpperCase();
    return "ACTIVE";
  };

  // Get status color
  const getStatusColor = (item) => {
    const status = getStatusDisplay(item);
    switch (status) {
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "EDIT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.docId && item.docId.toLowerCase().includes(searchLower)) ||
      (item.picBin && item.picBin.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower)) ||
      (item.stockState && item.stockState.toLowerCase().includes(searchLower))
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

  // Generate PDF function (placeholder)
  const GeneratePdf = (row) => {
    console.log("Generate PDF for:", row);
    // Implement PDF generation logic here
    alert(`PDF generation for ${row.docId} would be implemented here`);
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            VAS Pick List
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            View and manage Value Added Service Picks
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          
          <button
            onClick={handleExcelDownload}
            disabled={list.length === 0}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export
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

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by VAS Pick ID, Picked Bin, or Status..."
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        {search && (
          <span className="text-xs text-gray-500">{filtered.length} results</span>
        )}
      </div>

      {/* Results Count and Items Per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of{" "}
          {filtered.length} entries
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
            Loading VAS Pick data…
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
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">VAS Pick ID</th>
                <th className="p-2 text-left font-medium">Document Date</th>
                <th className="p-2 text-left font-medium">Picked Bin</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Picked QTY</th>
                <th className="p-2 text-center font-medium">Actions</th>
              </tr>
            </thead>

            {/* Rows */}
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
                    <td className="p-2 font-medium">{item.docId || "-"}</td>
                    <td className="p-2">{formatDateForDisplay(item.docDate)}</td>
                    <td className="p-2">{item.picBin || "-"}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(item)}`}
                      >
                        {getStatusDisplay(item)}
                      </span>
                    </td>
                    <td className="p-2">{item.pickedQty || 0}</td>
                    <td className="p-2 flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-green-500 hover:text-green-600 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => GeneratePdf(item)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        title="Generate PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {list.length === 0
                      ? "No VAS Pick entries found"
                      : "No entries match your search"}
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
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of{" "}
            {filtered.length} entries
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
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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

export default VasPickList;