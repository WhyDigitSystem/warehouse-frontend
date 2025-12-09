import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Trash2,
  X,
  Grid,
  Package,
  Layers,
  Calendar,
  Plus,
} from "lucide-react";
import { vasPutawayAPI } from "../../../api/vasputawayAPI";
import { useToast } from "../../Toast/ToastContext";
import dayjs from "dayjs";

// Helper functions
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    return dateString;
  }
};

// Reusable Components
const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", disabled = false, ...props }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
        error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
      } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
      placeholder=" "
      {...props}
    />
    <label
      className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, disabled = false, ...props }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e)}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
        error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
      } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
      name={name}
      {...props}
    >
      <option value="">Select {label}</option>
      {Array.isArray(options) && options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
    <label
      className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const VasPutawayForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Global parameters from localStorage
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();
  const [editId, setEditId] = useState("");
  
  // State for form data
  const [formData, setFormData] = useState({
    docId: "",
    docDate: formatDateForInput(new Date()),
    vasPickNo: "",
    status: "Edit",
    freeze: false,
    totalGrnQty: "",
    totalPutawayQty: "",
  });

  // State for tables
  const [lrNoDetailsTable, setLrNoDetailsTable] = useState([]);
  const [tableErrors, setTableErrors] = useState([]);
  
  // Dropdown lists
  const [vasNoList, setVasNoList] = useState([]);
  const [tableBinList, setTableBinList] = useState([]);
  
  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize data
  useEffect(() => {
    getVasPutawayDocId();
    getAllVasPickNo();
    getToBinDetailsVasPutaway();

    if (editData) {
      getVasPutawayById(editData);
    } else {
      setLrNoDetailsTable([]);
    }
  }, [editData]);

  // API Functions
  const getVasPutawayDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const response = await vasPutawayAPI.getVasPutawayDocId(params);
      
      if (response?.paramObjectsMap?.VasPutAwayDocId) {
        setFormData((prev) => ({
          ...prev,
          docId: response.paramObjectsMap.VasPutAwayDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getAllVasPickNo = async () => {
    try {
      const params = {
        branch: loginBranch,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const response = await vasPutawayAPI.getDocIdFromVasPick(params);
      
      if (response?.status === true && response.paramObjectsMap?.vasPutawayVO) {
        const vasList = response.paramObjectsMap.vasPutawayVO.map(item => ({
          value: item.vasPickNo,
          label: item.vasPickNo,
        }));
        setVasNoList(vasList);
      }
    } catch (error) {
      console.error("Error fetching VAS Pick numbers:", error);
      addToast("Failed to fetch VAS Pick numbers", "error");
    }
  };

  const getToBinDetailsVasPutaway = async () => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse,
      };

      const response = await vasPutawayAPI.getToBinDetailsVasPutaway(params);
      
      if (response?.status === true && response.paramObjectsMap?.ToBin) {
        setTableBinList(response.paramObjectsMap.ToBin);
      }
    } catch (error) {
      console.error("Error fetching bin details:", error);
      addToast("Failed to fetch bin details", "error");
    }
  };

  const getFillGridVasPutaway = async (vasPickNo) => {
    if (!vasPickNo) return;
    
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        docId: vasPickNo,
        orgId: orgId,
      };

      const response = await vasPutawayAPI.getFillGridFromVasPutaway(params);
      
      if (response?.status === true && response.paramObjectsMap?.vasPutawayVO) {
        const data = response.paramObjectsMap.vasPutawayVO.map((item, index) => {
          const invQty = parseFloat(item.pickQty) || 0;
          const putAwayQty = parseFloat(item.putawayQty) || 0;

          return {
            id: index + 1,
            partNo: item.partNo,
            partDescription: item.partDesc,
            grnNo: item.grnNo,
            grnDate: item.grnDate,
            invQty: invQty,
            putAwayQty: putAwayQty,
            fromBin: item.bin,
            binClass: item.binClass,
            binType: item.binType,
            cellType: item.cellType,
            core: item.core,
            expDate: item.expDate,
            batchNo: item.batchNo,
            batchDate: item.batchDate,
            qcFlag: item.qcFlag,
            sku: item.sku,
            toBin: "",
            toBinType: "",
            toBinClass: "",
            toCellType: "",
            toCore: "",
            remarks: "",
          };
        });

        setLrNoDetailsTable(data);

        // Calculate totals
        const totalGrnQty = data.reduce((sum, item) => sum + (item.invQty || 0), 0);
        const totalPutawayQty = data.reduce((sum, item) => sum + (item.putAwayQty || 0), 0);

        setFormData((prev) => ({
          ...prev,
          totalGrnQty,
          totalPutawayQty,
        }));
        
        addToast("Grid data loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching grid data:", error);
      addToast("Failed to fetch grid data", "error");
    }
  };

  const getVasPutawayById = async (row) => {
    setEditId(row.id);
    try {
      const response = await vasPutawayAPI.getVasPutawayById(row.id);
      
      if (response?.status === true && response.paramObjectsMap?.vasPutawayVO) {
        const particularVasPutaway = response.paramObjectsMap.vasPutawayVO;
        
        // Update form data
        setFormData({
          docId: particularVasPutaway.docId || "",
          docDate: particularVasPutaway.docDate ? formatDateForInput(particularVasPutaway.docDate) : formatDateForInput(new Date()),
          vasPickNo: particularVasPutaway.vasPickNo || "",
          status: particularVasPutaway.status || "Edit",
          freeze: particularVasPutaway.freeze || false,
          totalGrnQty: particularVasPutaway.totalGrnQty || "",
          totalPutawayQty: particularVasPutaway.totalPutawayQty || "",
        });

        // Update table data
        if (particularVasPutaway.vasPutawayDetailsVO) {
          const tableData = particularVasPutaway.vasPutawayDetailsVO.map((row) => ({
            id: row.id || Date.now(),
            partNo: row.partNo || "",
            partDescription: row.partDescription || row.partDesc || "",
            grnNo: row.grnNo || "",
            grnDate: row.grnDate || "",
            invQty: row.invQty || "",
            putAwayQty: row.putAwayQty || "",
            fromBin: row.fromBin || "",
            sku: row.sku || "",
            remarks: row.remarks || "",
            batchNo: row.batchNo || "",
            batchDate: row.batchDate || "",
            binClass: row.fromBinClass || "",
            binType: row.fromBinType || "",
            cellType: row.fromCellType || "",
            core: row.fromCore || "",
            expDate: row.expDate || "",
            qcFlag: row.qcFlag || "",
            stockDate: row.stockDate || "",
            toBinType: row.toBinType || "",
            toBinClass: row.toBinClass || "",
            toCellType: row.toCellType || "",
            toCore: row.toCore || "",
            toBin: row.toBin || "",
          }));
          setLrNoDetailsTable(tableData);
        }

        addToast("VAS Putaway data loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching VAS Putaway details:", error);
      addToast("Error fetching VAS Putaway details", "error");
    }
  };

  // Form Handlers
  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "vasPickNo") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      if (!editId && value) {
        await getFillGridVasPutaway(value);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleToBinChange = (rowId, index, event) => {
    const value = event.target.value;
    const selectedToBin = tableBinList.find((bin) => bin.bin === value);
    
    setLrNoDetailsTable((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              toBin: selectedToBin?.bin || "",
              toBinType: selectedToBin?.binType || "",
              toBinClass: selectedToBin?.binClass || "",
              toCellType: selectedToBin?.cellType || "",
              toCore: selectedToBin?.core || "",
            }
          : row
      )
    );

    // Clear error for this row
    if (tableErrors[index]?.toBin) {
      setTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], toBin: "" };
        return newErrors;
      });
    }
  };

  const handleRemarksChange = (rowId, value) => {
    setLrNoDetailsTable((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, remarks: value } : row))
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      partNo: "",
      partDescription: "",
      grnNo: "",
      invQty: "",
      putAwayQty: "",
      fromBin: "",
      toBin: "",
      sku: "",
      remarks: "",
      batchNo: "",
      batchDate: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      expDate: "",
      qcFlag: "",
      stockDate: "",
      toBinType: "",
      toBinClass: "",
      toCellType: "",
      toCore: "",
    };
    setLrNoDetailsTable([...lrNoDetailsTable, newRow]);
  };

  const handleDeleteRow = (id) => {
    setLrNoDetailsTable(lrNoDetailsTable.filter((row) => row.id !== id));
    addToast("Row removed", "info");
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      vasPickNo: "",
      status: "Edit",
      freeze: false,
      totalGrnQty: "",
      totalPutawayQty: "",
    });
    setLrNoDetailsTable([]);
    setEditId("");
    setFieldErrors({});
    setTableErrors([]);
    getVasPutawayDocId();
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const errors = {};

    // Validate main form fields
    if (!formData.vasPickNo) errors.vasPickNo = "VAS Pick No is required";
    if (!formData.status) errors.status = "Status is required";

    // Validate table data
    let tableValid = true;
    const newTableErrors = lrNoDetailsTable.map((row, index) => {
      const rowErrors = {};
      if (!row.toBin) {
        rowErrors.toBin = "To Bin is required";
        tableValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setTableErrors(newTableErrors);

    if (Object.keys(errors).length > 0 || !tableValid || lrNoDetailsTable.length === 0) {
      addToast("Please fill all required fields correctly", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const lrNoDetailsVO = lrNoDetailsTable.map((row) => ({
        ...(editId && { id: row.id }),
        partNo: row.partNo,
        partDesc: row.partDescription,
        grnNo: row.grnNo,
        grnDate: row.grnDate,
        invQty: parseInt(row.invQty || 0),
        putAwayQty: parseInt(row.putAwayQty || 0),
        fromBin: row.fromBin,
        sku: row.sku,
        remarks: row.remarks,
        batchNo: row.batchNo,
        batchDate: row.batchDate,
        fromBinClass: row.binClass,
        fromBinType: row.binType,
        fromCellType: row.cellType,
        fromCore: row.core,
        expDate: row.expDate,
        qcFlag: row.qcFlag,
        stockDate: row.stockDate,
        toBin: row.toBin,
        toBinType: row.toBinType,
        toBinClass: row.toBinClass,
        toCellType: row.toCellType,
        toCore: row.toCore,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        createdBy: loginUserName,
        customer: loginCustomer,
        finYear: loginFinYear,
        orgId: orgId,
        vasPickNo: formData.vasPickNo,
        status: formData.status,
        totalGrnQty: parseInt(formData.totalGrnQty || 0),
        totalPutawayQty: parseInt(formData.totalPutawayQty || 0),
        warehouse: loginWarehouse,
        vasPutawayDetailsDTO: lrNoDetailsVO,
      };

      const response = await vasPutawayAPI.createUpdateVasPutaway(saveFormData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(
          editId ? "VAS Putaway Updated Successfully" : "VAS Putaway created successfully",
          "success"
        );
      } else {
        const errorMessage =
          response.paramObjectsMap?.errorMessage || "VAS Putaway creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("VAS Putaway creation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
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
              {editData ? "Edit VAS Putaway" : "Create VAS Putaway"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage Value Added Service putaway process
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          Back to List
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
        
        {!formData.freeze && (
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* Header Section with Form Fields */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <FloatingInput
              label="Document No"
              name="docId"
              value={formData.docId}
              disabled
            />
            
            <div className="relative">
              <FloatingInput
                label="Doc Date"
                name="docDate"
                value={formData.docDate}
                type="date"
                disabled
              />
              <Calendar className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {editId ? (
              <FloatingInput
                label="VAS Pick No"
                name="vasPickNo"
                value={formData.vasPickNo}
                disabled
              />
            ) : (
              <FloatingSelect
                label="VAS Pick No *"
                name="vasPickNo"
                value={formData.vasPickNo}
                onChange={handleInputChange}
                options={vasNoList}
                error={fieldErrors.vasPickNo}
                required
                disabled={formData.freeze}
              />
            )}

            <FloatingSelect
              label="Status *"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={["Edit", ...(editId ? ["Confirm"] : [])]}
              error={fieldErrors.status}
              required
              disabled={formData.freeze}
            />

            <FloatingInput
              label="Total GRN Qty"
              name="totalGrnQty"
              value={formData.totalGrnQty}
              disabled
            />

            <FloatingInput
              label="Total Putaway Qty"
              name="totalPutawayQty"
              value={formData.totalPutawayQty}
              disabled
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Package className="h-4 w-4" />
            LR No Details
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {lrNoDetailsTable.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Layers className="h-4 w-4" />
            Summary
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "details" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  LR No Details
                </h3>
                {!formData.freeze && (
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Row
                  </button>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {!formData.freeze && (
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                          Action
                        </th>
                      )}
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                        S.No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Part No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                        Part Description
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        GRN No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Inv Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Putaway Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        From Bin
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        To Bin *
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lrNoDetailsTable.length === 0 ? (
                      <tr>
                        <td
                          colSpan={formData.freeze ? 10 : 11}
                          className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No items added. Select a VAS Pick No to load data.
                        </td>
                      </tr>
                    ) : (
                      lrNoDetailsTable.map((row, index) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {!formData.freeze && (
                            <td className="px-3 py-2">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          )}

                          <td className="px-3 py-2 text-center">{index + 1}</td>
                          <td className="px-3 py-2">{row.partNo}</td>
                          <td className="px-3 py-2">{row.partDescription}</td>
                          <td className="px-3 py-2">{row.grnNo}</td>
                          <td className="px-3 py-2 text-right">{row.invQty}</td>
                          <td className="px-3 py-2 text-right">{row.putAwayQty}</td>
                          <td className="px-3 py-2">{row.fromBin}</td>

                          <td className="px-3 py-2">
                            {!formData.freeze ? (
                              <div>
                                <select
                                  value={row.toBin}
                                  onChange={(e) => handleToBinChange(row.id, index, e)}
                                  className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    tableErrors[index]?.toBin
                                      ? "border-red-500"
                                      : "border-gray-200 dark:border-gray-600"
                                  }`}
                                >
                                  <option value="">--Select--</option>
                                  {tableBinList.map((bin) => (
                                    <option key={bin.bin} value={bin.bin}>
                                      {bin.bin}
                                    </option>
                                  ))}
                                </select>
                                {tableErrors[index]?.toBin && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {tableErrors[index].toBin}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>{row.toBin}</div>
                            )}
                          </td>

                          <td className="px-3 py-2">{row.sku}</td>
                          <td className="px-3 py-2">
                            {!formData.freeze ? (
                              <input
                                type="text"
                                value={row.remarks}
                                onChange={(e) => handleRemarksChange(row.id, e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <div>{row.remarks}</div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Items
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lrNoDetailsTable.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total GRN Quantity
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.totalGrnQty}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Putaway Quantity
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.totalPutawayQty}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VasPutawayForm;