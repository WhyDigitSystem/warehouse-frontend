import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  Search,
  Upload,
  Download,
  List,
  Barcode,
  Printer,
  CheckCircle,
  Scan,
} from "lucide-react";

import { PickRequestAPI } from "../../../api/pickrequestAPI";
import { useToast } from "../../Toast/ToastContext";
import BulkBarcodePrint from "./BulkBarCodePrint";
import LabelPrintModal from "./LabelPrintModal";

const PickRequestForm = ({ editData, onBack, onSaveSuccess }) => {
  // Helper functions - MOVE THESE UP
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  };

  // Now state declarations can use the functions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditMode, setIsEditMode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedItems, setScannedItems] = useState([]);
  const [bulkPrintVisible, setBulkPrintVisible] = useState(false);
  const [labelPrintVisible, setLabelPrintVisible] = useState(false);
  
  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  const [editId, setEditId] = useState("");
  const [buyerOrderNoList, setBuyerOrderNoList] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [unmatchedScans, setUnmatchedScans] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: formatDateForInput(new Date()), // Now this works
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: formatDateForInput(new Date()), // Now this works
    clientName: "",
    customerName: "",
    customerShortName: "",
    outTime: getCurrentTime(), // Now this works
    clientAddress: "",
    customerAddress: "",
    status: "Edit",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
    pickOrder: "FIFO",
    buyerOrderDate: formatDateForInput(new Date()), // Now this works
    freeze: false,
    totalPickedQty: 0,
    totalOrderQty: 0,
  });

  const [fieldErrors, setFieldErrors] = useState({});



  // Initialize data
  useEffect(() => {
    getNewDocId();
    getBuyerRefNo();
    
    if (editData) {
      getPickRequestById(editData);
    }
  }, [editData]);

  // API Functions
  const getNewDocId = async () => {
    try {
      const params = {
        orgId: orgId,
        branchCode: loginBranchCode,
        client: loginClient,
        branch: loginBranch,
        finYear: loginFinYear
      };

      const response = await PickRequestAPI.getNewDocId(params);
      
      if (response?.status === true) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap?.pickRequestDocId || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };
const getBuyerRefNo = async () => {
    try {
      const params = {
        orgId: orgId,
        branchCode: loginBranchCode,
        client: loginClient,
        warehouse: loginWarehouse,
        finYear: loginFinYear
      };

      // Use the API client instead of direct axios call
      const response = await PickRequestAPI.getBuyerRefNoForPickRequest(params);
      
      if (response?.status === true) {
        setBuyerOrderNoList(response.paramObjectsMap?.buyerOrderVO || []);
      } else {
        console.warn("API returned false status:", response);
        setBuyerOrderNoList([]);
      }
    } catch (error) {
      console.error("Error fetching buyer ref data:", error);
      addToast("Failed to fetch buyer reference data", "error");
      setBuyerOrderNoList([]);
    }
  };
  const getPickRequestById = async (order) => {
    setEditId(order.id);
    try {
      const response = await PickRequestAPI.getPickRequestById(order.id);
      
      if (response?.status === true && response.paramObjectsMap?.pickRequestVO) {
        const data = response.paramObjectsMap.pickRequestVO;
        
        const totalPickedQty = data.pickRequestDetailsVO?.reduce(
          (sum, detail) => sum + (detail.pickQty || 0),
          0
        ) || 0;

        setFormData(prev => ({
          ...prev,
          docId: data.docId || "",
          docDate: data.docDate ? formatDateForInput(data.docDate) : formatDateForInput(new Date()),
          buyerOrderNo: data.buyerOrderNo || "",
          buyerRefNo: data.buyerRefNo || "",
          buyerRefDate: data.buyerRefDate ? formatDateForInput(data.buyerRefDate) : formatDateForInput(new Date()),
          clientName: data.clientName || "",
          customerName: data.customerName || "",
          customerShortName: data.customerShortName || "",
          outTime: data.outTime || getCurrentTime(),
          clientAddress: data.clientAddress || "",
          customerAddress: data.customerAddress || "",
          status: data.status || "Edit",
          buyersReference: data.buyersReference || "",
          invoiceNo: data.invoiceNo || "",
          clientShortName: data.clientShortName || "",
          pickOrder: data.pickOrder || "FIFO",
          buyerOrderDate: data.buyerOrderDate ? formatDateForInput(data.buyerOrderDate) : formatDateForInput(new Date()),
          freeze: data.freeze || false,
          totalPickedQty: totalPickedQty,
          totalOrderQty: data.totalOrderQty || 0,
        }));

        // Set fill grid data
        const fillGridDetails = data.pickRequestDetailsVO?.map((detail, index) => ({
          id: detail.id || index + 1,
          partNo: detail.partNo || "",
          partDesc: detail.partDesc || "",
          bin: detail.bin || "",
          sku: detail.sku || "",
          batchNo: detail.batchNo || "",
          orderQty: detail.orderQty || 0,
          availQty: detail.availQty || 0,
          pickQty: detail.pickQty || 0,
          remainQty: detail.remainingQty || 0,
          qcFlag: detail.qcFlag || "F",
          scanned: detail.qcFlag === "T",
          scanStatus: "pending",
        })) || [];

        setFillGridData(fillGridDetails);
      } else {
        addToast("Failed to fetch pick request details", "error");
      }
    } catch (error) {
      console.error("Error fetching pick request details:", error);
      addToast("Error fetching pick request details", "error");
    }
  };

  // Add this useEffect to debug:
useEffect(() => {
  if (labelPrintVisible) {
    console.log("🔍 LabelPrintModal Debug Info:");
    console.log("formData:", formData);
    console.log("fillGridData:", fillGridData);
    console.log("fillGridData length:", fillGridData.length);
    console.log("Items with partNo:", fillGridData.filter(item => item.partNo && item.partNo.trim() !== ''));
  }
}, [labelPrintVisible

, formData, fillGridData]);


  // Barcode scanning functionality
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter") {
      try {
        const scannedData = barcodeInput;

        if (!scannedData) {
          addToast("Invalid barcode: Empty input", "error");
          setBarcodeInput("");
          return;
        }

        // Parse the scanned data - concatenated without hyphens
        let matchedPartNo = null;
        let remainingData = scannedData;

        // Find all unique part numbers
        const allPartNos = [...new Set(fillGridData.map((item) => item.partNo))];

        // Try to find the part number at the beginning of the scanned data
        for (const partNo of allPartNos) {
          const cleanPartNo = partNo.replace(/-/g, "");
          if (scannedData.startsWith(cleanPartNo)) {
            matchedPartNo = partNo;
            remainingData = scannedData.substring(cleanPartNo.length);
            break;
          }
        }

        if (!matchedPartNo) {
          addToast(`NOT FOUND: No matching part number found`, "error");
          setUnmatchedScans((prev) => [
            ...prev,
            {
              scannedData: scannedData,
              timestamp: new Date().toLocaleTimeString(),
              status: "partno_not_found",
            },
          ]);
          setBarcodeInput("");
          return;
        }

        // Find all items with this part number
        const partNoMatches = fillGridData.filter(
          (item) => item.partNo === matchedPartNo
        );

        // Try to match the remaining data with bin + buyerRefNo combinations
        const possibleMatches = [];

        for (const item of partNoMatches) {
          const cleanBin = (item.bin || "").replace(/-/g, "");
          const cleanBuyerRefNo = (
            item.buyerRefNo ||
            formData.buyerRefNo ||
            ""
          ).replace(/-/g, "");
          const expectedCombination = cleanBin + cleanBuyerRefNo;

          if (remainingData === expectedCombination) {
            possibleMatches.push(item);
          }
        }

        if (possibleMatches.length === 0) {
          addToast(`FIELD MISMATCH: Part ${matchedPartNo} found, but bin/buyerRef combination doesn't match`, "error");
          setUnmatchedScans((prev) => [
            ...prev,
            {
              partNo: matchedPartNo,
              scannedData: scannedData,
              remainingData: remainingData,
              timestamp: new Date().toLocaleTimeString(),
              status: "combination_mismatch",
            },
          ]);
          setBarcodeInput("");
          return;
        }

        // Find the first exact match that hasn't been scanned yet
        const unscannedItem = possibleMatches.find((item) => !item.scanned);

        if (!unscannedItem) {
          addToast(`ALL COPIES SCANNED: Part No ${matchedPartNo} (all ${possibleMatches.length} exact matches already scanned)`, "warning");
          setBarcodeInput("");
          return;
        }

        // Mark the first unscanned exact match as scanned
        const updatedData = fillGridData.map((item) =>
          item.id === unscannedItem.id
            ? {
                ...item,
                qcFlag: "T",
                scanned: true,
                scanStatus: "matched",
                scanTimestamp: new Date().toLocaleTimeString(),
              }
            : item
        );

        setFillGridData(updatedData);
        setScannedItems((prev) => [...prev, unscannedItem.id]);

        // Check scan progress
        const allScanned = updatedData.every((item) => item.scanned);
        const scannedCount = updatedData.filter((item) => item.scanned).length;
        const totalCount = updatedData.length;

        // Count how many of this exact item are left
        const remainingSameItems = possibleMatches.filter(
          (item) => !item.scanned
        ).length;
        const remainingText =
          remainingSameItems > 0
            ? `, ${remainingSameItems} more of same exact item remaining`
            : "";

        if (allScanned) {
          addToast(`COMPLETED! All ${totalCount} items scanned successfully!`, "success");
        } else {
          addToast(`EXACT MATCH: ${matchedPartNo} (${scannedCount}/${totalCount} completed${remainingText})`, "success");

          // Auto-focus for next scan
          setTimeout(() => {
            const barcodeInputField = document.getElementById("barcode-input");
            if (barcodeInputField) barcodeInputField.focus();
          }, 100);
        }

        setBarcodeInput("");
      } catch (error) {
        console.error("Error processing barcode", error);
        addToast("Error processing barcode", "error");
        setBarcodeInput("");
      }
    }
  };

  // Update picked items
  const handleUpdatePickedItems = async () => {
    if (scannedItems.length === 0) {
      addToast("No items scanned", "warning");
      return;
    }

    try {
      const updateData = {
        pickRequestHdrId: editId,
        pickRequestDtlId: scannedItems,
        status: "COMPLETED",
      };

      const response = await PickRequestAPI.updatePick(updateData);

      if (response.data.status === true) {
        addToast("Pick updated successfully", "success");
        setScannedItems([]);
        setIsEditMode(false);
        onSaveSuccess && onSaveSuccess();
      } else {
        addToast("Update failed", "error");
      }
    } catch (error) {
      console.error("Error updating pick:", error);
      addToast("Update failed", "error");
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setScannedItems([]);
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));

    // Handle buyer ref no selection
    if (name === "buyerRefNo") {
      const selectedOrder = buyerOrderNoList.find(
        (order) =>
          order.docId &&
          value &&
          order.docId.toLowerCase() === value.toLowerCase()
      );

      if (selectedOrder) {
        const refDate = selectedOrder.refDate
          ? formatDateForInput(selectedOrder.refDate)
          : formatDateForInput(new Date());

        setFormData(prev => ({
          ...prev,
          buyerRefNo: selectedOrder.docId || "",
          buyerRefDate: refDate,
          clientName: selectedOrder.billToName || "",
          clientShortName: selectedOrder.billToShortName || "",
          customerName: selectedOrder.buyer || "",
          customerAddress: selectedOrder.buyerAddress || "",
          clientAddress: selectedOrder.billToAddress || "",
          buyerOrderNo: selectedOrder.docId || "",
          buyersReference: selectedOrder.refNo || "",
          invoiceNo: selectedOrder.invoiceNo || "",
          buyerOrderDate: selectedOrder.docDate ? formatDateForInput(selectedOrder.docDate) : formatDateForInput(new Date()),
          totalOrderQty: selectedOrder.totalOrderQty || "",
        }));
      }
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? formatDateForInput(date) : "";
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  const handleItemChange = (id, field, value) => {
    setFillGridData(prev =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      bin: "",
      sku: "",
      batchNo: "",
      orderQty: 0,
      availQty: 0,
      pickQty: 0,
      remainQty: 0,
      qcFlag: "F",
      scanned: false,
      scanStatus: "pending",
    };
    setFillGridData([...fillGridData, newItem]);
  };

  const handleDeleteItem = (id) => {
    setFillGridData(fillGridData.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      buyerOrderNo: "",
      buyerRefNo: "",
      buyerRefDate: formatDateForInput(new Date()),
      clientName: "",
      customerName: "",
      customerShortName: "",
      outTime: getCurrentTime(),
      clientAddress: "",
      customerAddress: "",
      status: "Edit",
      buyersReference: "",
      invoiceNo: "",
      clientShortName: "",
      pickOrder: "FIFO",
      buyerOrderDate: formatDateForInput(new Date()),
      freeze: false,
      totalPickedQty: 0,
      totalOrderQty: 0,
    });
    setFillGridData([]);
    setEditId("");
    setFieldErrors({});
    setScannedItems([]);
    setIsEditMode(false);
    setUnmatchedScans([]);
    getNewDocId();
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts[0].length === 4) {
          return dateString;
        } else if (parts[0].length === 2) {
          const date = new Date(dateString.split('-').reverse().join('-'));
          return date.toISOString().split('T')[0];
        }
      }
      return null;
    } catch (error) {
      console.warn("Date API conversion error:", error, dateString);
      return null;
    }
  };

  const handleSaveOrder = async () => {
    if (isSubmitting) return;
    
    const errors = {};

    // Validate main form fields
    if (!formData.buyerRefNo) errors.buyerRefNo = "Buyer Order Ref No is required";
    if (!formData.status) errors.status = "Status is required";

    // Validate table data
    let tableDataValid = true;
    fillGridData.forEach((row) => {
      if (!row.partNo || !row.bin) {
        tableDataValid = false;
      }
    });

    if (!tableDataValid) {
      addToast("Please fill all required fields in the table", "error");
      return;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const pickRequestDetailsDTO = fillGridData.map((row) => ({
        ...(editId && { id: row.id }),
        partNo: row.partNo,
        partDesc: row.partDesc,
        bin: row.bin,
        sku: row.sku,
        batchNo: row.batchNo,
        orderQty: row.orderQty,
        availQty: row.availQty,
        pickQty: row.pickQty,
        remainQty: row.remainQty,
        qcFlag: row.qcFlag,
      }));

      const saveFormData = {
        ...(editId && { id: parseInt(editId) }),
        docId: formData.docId,
        docDate: formatDateForAPI(formData.docDate),
        buyerOrderNo: formData.buyerOrderNo,
        buyerRefNo: formData.buyerRefNo,
        buyerRefDate: formatDateForAPI(formData.buyerRefDate),
        clientName: formData.clientName,
        client: loginClient,
        customerName: formData.customerName,
        customerShortName: formData.customerShortName,
        outTime: formData.outTime,
        clientAddress: formData.clientAddress,
        customerAddress: formData.customerAddress,
        status: formData.status,
        buyersReference: formData.buyersReference,
        invoiceNo: formData.invoiceNo,
        clientShortName: formData.clientShortName,
        pickOrder: formData.pickOrder,
        pickRequestDetailsDTO,
        branch: loginBranch,
        branchCode: loginBranchCode,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        orgId: parseInt(orgId),
        customer: loginCustomer,
        createdBy: loginUserName,
        buyerOrderDate: formatDateForAPI(formData.buyerOrderDate),
      };

      const response = await PickRequestAPI.savePickRequest(saveFormData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(editId ? "Pick Request Updated Successfully" : "Pick Request created successfully", "success");
        onBack();
      } else {
        const errorMessage = response.paramObjectsMap?.errorMessage || "Pick Request creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Pick Request creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals when fillGridData changes
  useEffect(() => {
    const totalPickedQty = fillGridData.reduce(
      (sum, item) => sum + (parseInt(item.pickQty, 10) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalPickedQty: totalPickedQty,
    }));
  }, [fillGridData]);

  // Get scan summary
  const getScanSummary = () => {
    const scanned = fillGridData.filter((item) => item.scanned).length;
    const total = fillGridData.length;
    const unmatched = unmatchedScans.length;

    return {
      scanned,
      total,
      unmatched,
      progress: Math.round((scanned / total) * 100),
    };
  };

  const scanSummary = getScanSummary();

  // Custom Input Components
  const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", ...props }) => (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        }`}
        placeholder=" "
        {...props}
      />
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, ...props }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        }`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options?.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Pick Request" : "Create Pick Request"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage pick requests
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <List className="h-4 w-4" />
          List View
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button 
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
        
        <button
          onClick={handleSaveOrder}
          disabled={isSubmitting || formData.status === "Confirm"}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
        </button>

        {/* Edit Mode Toggle */}
        {editData && (
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
              isEditMode 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            <CheckCircle className="h-3 w-3" />
            {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
          </button>
        )}

        {/* Update Picked Items */}
        {isEditMode && (
          <button
            onClick={handleUpdatePickedItems}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors"
          >
            <Save className="h-3 w-3" />
            Update Picked Items
          </button>
        )}

        <button
          onClick={() => setBulkPrintVisible(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Barcode className="h-3 w-3" />
          Print Barcodes
        </button>

        <button
          onClick={() => setLabelPrintVisible(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
        >
          <Printer className="h-3 w-3" />
          Print Labels
        </button>
      </div>

      {/* Barcode Scanner Input */}
      {isEditMode && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Scan className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              Barcode Scanner Mode
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="barcode-input"
              type="text"
              placeholder="Scan barcode and press Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={handleBarcodeScan}
              className="flex-1 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              autoFocus
            />
            <div className="text-right min-w-20">
              <div className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
                {scanSummary.scanned} / {scanSummary.total}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {scanSummary.progress}% Complete
              </div>
            </div>
          </div>
          {scanSummary.unmatched > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              {scanSummary.unmatched} unmatched scans
            </div>
          )}
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "basic"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Order Information
          </button>
          <button
            onClick={() => setActiveTab("additional")}
            className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "additional"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Additional Information
          </button>
        </div>

        {/* BASIC INFORMATION TAB */}
        {activeTab === "basic" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Document No"
                name="docId"
                value={formData.docId}
                onChange={handleInputChange}
                disabled
              />
              
              <FloatingInput
                label="Doc Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled={!!editId}
              />

              <FloatingSelect
                label="Buyer Order No *"
                name="buyerRefNo"
                value={formData.buyerRefNo}
                onChange={handleSelectChange}
                options={buyerOrderNoList.map(order => ({ 
                  value: order.orderNo, 
                  label: order.orderNo 
                }))}
                error={fieldErrors.buyerRefNo}
                required
                disabled={!!editId}
              />

              <FloatingInput
                label="Buyer Order Date"
                name="buyerOrderDate"
                value={formData.buyerOrderDate}
                onChange={handleInputChange}
                type="date"
                disabled={!!editId}
              />

              <FloatingInput
                label="Buyer Ref No"
                name="buyerOrderNo"
                value={formData.buyerOrderNo}
                onChange={handleInputChange}
                disabled={!!editId}
              />

              <FloatingInput
                label="Buyer Ref Date"
                name="buyerRefDate"
                value={formData.buyerRefDate}
                onChange={handleInputChange}
                type="date"
              />

              <FloatingInput
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                disabled={!!editId}
              />

              <FloatingInput
                label="Customer Short Name"
                name="customerShortName"
                value={formData.customerShortName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                options={[
                  { value: "Edit", label: "Edit" },
                  { value: "Confirm", label: "Confirm" },
                  { value: "Freeze", label: "Freeze" },
                ]}
                error={fieldErrors.status}
                required
                disabled={formData.status === "Confirm"}
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION TAB */}
        {activeTab === "additional" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Buyer's Reference"
                name="buyersReference"
                value={formData.buyersReference}
                onChange={handleInputChange}
              />

              <FloatingInput
                label="Invoice No"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
              />

              <FloatingInput
                label="Client Short Name"
                name="clientShortName"
                value={formData.clientShortName}
                onChange={handleInputChange}
              />

              <FloatingSelect
                label="Pick Order"
                name="pickOrder"
                value={formData.pickOrder}
                onChange={handleSelectChange}
                options={[
                  { value: "FIFO", label: "FIFO" },
                  { value: "LIFO", label: "LIFO" },
                  { value: "FEFO", label: "FEFO" },
                ]}
              />

              <FloatingInput
                label="Out Time"
                name="outTime"
                value={formData.outTime}
                onChange={handleInputChange}
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Address
                </label>
                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Address
                </label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* PICK REQUEST ITEMS TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pick Request Items</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {fillGridData.length}
              </span>
              {formData.totalPickedQty > 0 && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                  Total Picked: {formData.totalPickedQty}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
              <button
                onClick={() => setFillGridData([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

          {/* Pick Request Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                    Action
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                    S.No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    Part No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    Part Desc
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Bin
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Batch No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Order Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Avail Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Pick Qty
                  </th>
                  {isEditMode && (
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Status
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fillGridData.length === 0 ? (
                  <tr>
                    <td colSpan={isEditMode ? "11" : "10"} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  fillGridData.map((item, index) => {
                    const isScanned = item.scanned;
                    const scanStatus = item.scanStatus;

                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isScanned 
                          ? scanStatus === "matched" 
                            ? 'bg-green-50 dark:bg-green-900/20' 
                            : 'bg-red-50 dark:bg-red-900/20'
                          : ''
                      }`}>
                        {/* Action */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>

                        {/* S.No */}
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center relative">
                          {index + 1}
                          {isScanned && (
                            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                              scanStatus === "matched" ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                          )}
                        </td>

                        {/* Part No */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.partNo}
                            onChange={(e) => handleItemChange(item.id, "partNo", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Part Desc */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.partDesc}
                            onChange={(e) => handleItemChange(item.id, "partDesc", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Bin */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.bin}
                            onChange={(e) => handleItemChange(item.id, "bin", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* SKU */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => handleItemChange(item.id, "sku", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Batch No */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.batchNo}
                            onChange={(e) => handleItemChange(item.id, "batchNo", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Order Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.orderQty}
                            onChange={(e) => handleItemChange(item.id, "orderQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </td>

                        {/* Avail Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.availQty}
                            onChange={(e) => handleItemChange(item.id, "availQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </td>

                        {/* Pick Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.pickQty}
                            onChange={(e) => handleItemChange(item.id, "pickQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </td>

                        {/* Scan Status */}
                        {isEditMode && (
                          <td className="px-3 py-2 text-center">
                            {isScanned ? (
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                scanStatus === "matched"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                                {scanStatus === "matched" ? "✅" : "❌"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                ⏳
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkBarcodePrint
        visible={bulkPrintVisible}
        onClose={() => setBulkPrintVisible(false)}
        items={fillGridData}
        formData={formData}
      />

    <LabelPrintModal
  visible={labelPrintVisible}
  onClose={() => setLabelPrintVisible(false)}
  formData={formData}
  items={fillGridData}
/>
    </div>
  );
};

export default PickRequestForm;