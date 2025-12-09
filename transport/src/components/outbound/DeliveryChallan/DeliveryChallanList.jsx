import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  FileText,
  Edit,
  ChevronRight,
  Package,
  Truck,
  Container,
  Car,
  Receipt,
  User,
  MapPin,
  Building,
  Printer,
} from "lucide-react";
import { deliveryChallanAPI } from "../../../api/deliverychallanAPI";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import GeneratePdfDeliveryChallan from "./DeliveryChallanpdf";

const DeliveryChallanList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedRowForPdf, setSelectedRowForPdf] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  
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
    fetchDeliveryChallans();
  }, [refreshTrigger]);

  const fetchDeliveryChallans = async () => {
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

      const response = await deliveryChallanAPI.getAllDeliveryChallans(params);
      
      if (response?.status === true) {
        const deliveryChallans = response.paramObjectsMap?.DeliveryChallanVO || [];
        // Sort by ID descending (newest first)
        const sortedChallans = deliveryChallans.sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sortedChallans);
      } else {
        setList([]);
        addToast("No delivery challans found", "info");
      }
    } catch (error) {
      console.error("Error fetching delivery challans:", error);
      addToast("Failed to fetch delivery challans", "error");
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveryChallans();
  };

  const fetchDeliveryChallansWithDateRange = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      addToast("Please select both from and to dates", "error");
      return;
    }

    setLoading(true);
    try {
      const fromDate = dayjs(selectedDateRange[0]).format('YYYY-MM-DD');
      const toDate = dayjs(selectedDateRange[1]).format('YYYY-MM-DD');

      const params = {
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        fromDate,
        toDate
      };

      const response = await deliveryChallanAPI.getDeliveryChallansByDateRange(params);
      
      if (response?.status === true) {
        const deliveryChallans = response.paramObjectsMap?.DeliveryChallanVO || [];
        setList(deliveryChallans);
        addToast(`Found ${deliveryChallans.length} delivery challans for selected date range`, "success");
      } else {
        setList([]);
        addToast("No delivery challans found for selected date range", "info");
      }
    } catch (error) {
      console.error("Error fetching delivery challans by date range:", error);
      addToast("Failed to fetch delivery challans", "error");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // Excel Download Function
  const handleExcelDownload = async () => {
    setDownloadLoading(true);
    try {
      const dataToExport = list;

      if (dataToExport.length === 0) {
        addToast("No data available to export", "warning");
        setDownloadLoading(false);
        return;
      }

      // Format the data for Excel
      const excelData = dataToExport.map((item) => ({
        "Doc ID": item.docId || "",
        "Doc Date": item.docDate ? dayjs(item.docDate).format("DD-MM-YYYY") : "",
        "Buyer Order No": item.buyerOrderNo || "",
        "Buyer": item.buyer || "",
        "Gate Pass No": item.gatePassNo || "",
        "Transport Name": item.transportName || "",
        "Vehicle No": item.vechileNo || "",
        "Container No": item.containerNO || "",
        "Invoice No": item.invoiceNo || "",
        "Commercial Invoice No": item.commercialInvoiceNo || "",
        "Excise Invoice No": item.exciseInvoiceNo || "",
        "Delivery Terms": item.deliveryTerms || "",
        "Pay Terms": item.payTerms || "",
        "GR Waiver No": item.grWaiverNo || "",
        "Bank Name": item.bankName || "",
        "Insurance No": item.insuranceNo || "",
        "No of Boxes": item.noOfBoxes || "",
        "Gross Weight": item.grossWeight || "",
        "Remarks": item.remarks || "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 10 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 30 },
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Delivery Challans");

      // Generate file name with current date
      const fileName = `Delivery_Challans_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;

      // Generate Excel file and download
      XLSX.writeFile(wb, fileName);

      addToast("Excel file downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      addToast("Failed to download Excel file", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePdfDownload = (item) => {
    setSelectedRowForPdf(item);
    setShowPdf(true);
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

  // Filter items based on search
  const filtered = list.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (item.docId && item.docId.toLowerCase().includes(searchLower)) ||
      (item.buyerOrderNo && item.buyerOrderNo.toLowerCase().includes(searchLower)) ||
      (item.buyer && item.buyer.toLowerCase().includes(searchLower)) ||
      (item.gatePassNo && item.gatePassNo.toLowerCase().includes(searchLower)) ||
      (item.transportName && item.transportName.toLowerCase().includes(searchLower)) ||
      (item.vechileNo && item.vechileNo.toLowerCase().includes(searchLower)) ||
      (item.containerNO && item.containerNO.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <div className="p-4 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delivery Challan List
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage delivery challans
            </p>
          </div>
        </div>

        {/* SEARCH AND CONTROLS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Challan</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {filtered.length}
              </span>
            </div>
            
            <div className="flex flex-1 max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Document No, Buyer Order, Vehicle No..."
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
                onClick={fetchDeliveryChallansWithDateRange}
                disabled={!selectedDateRange[0] || !selectedDateRange[1]}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50"
              >
                <Search className="h-3 w-3" />
                Filter by Date
              </button>

              <button
                onClick={handleExcelDownload}
                disabled={downloadLoading || filtered.length === 0}
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
                    Transport & Vehicle
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyer & Order Info
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Additional Info
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
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">Loading delivery challans...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      {list.length === 0 ? 'No delivery challans found' : 'No matching entries found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={`delivery-challan-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Document Info Column */}
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.docId}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {formatDateForDisplay(item.docDate)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            Items: {item.deliveryChallanDetailsVO?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Transport & Vehicle Column */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.transportName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              Vehicle: {item.vechileNo || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Container className="w-3 h-3 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              Container: {item.containerNO || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Buyer & Order Info Column */}
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                          {item.buyerOrderNo || 'N/A'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-[150px]">
                          {item.buyer || 'N/A'}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {item.gatePassNo && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Gate: {item.gatePassNo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Additional Info Column */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-2">
                          {item.insuranceNo && (
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-yellow-500" />
                              <span className="text-gray-600 dark:text-gray-400 text-xs">
                                Ins: {item.insuranceNo}
                              </span>
                            </div>
                          )}
                          {item.bankName && (
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-indigo-500" />
                              <span className="text-gray-600 dark:text-gray-400 text-xs">
                                Bank: {item.bankName}
                              </span>
                            </div>
                          )}
                          {item.deliveryTerms && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {item.deliveryTerms}
                            </span>
                          )}
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
                            onClick={() => handlePdfDownload(item)}
                            className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                            title="Download PDF"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
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

      {/* PDF Modal */}
      {showPdf && selectedRowForPdf && (
        <GeneratePdfDeliveryChallan
          row={selectedRowForPdf}
          onClose={() => {
            setShowPdf(false);
            setSelectedRowForPdf(null);
          }}
          onDownload={() => {
            addToast("PDF downloaded successfully", "success");
          }}
        />
      )}
    </>
  );
};

export default DeliveryChallanList;