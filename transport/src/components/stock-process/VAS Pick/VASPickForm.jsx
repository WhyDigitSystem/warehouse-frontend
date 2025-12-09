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

import { vasPickAPI ,getAllActiveLocationTypes } from "../../../api/vaspickAPI";
import { useToast } from "../../Toast/ToastContext";
import dayjs from "dayjs";

// Helper function to format dates
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

const VasPickForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Global parameters from localStorage
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const loginUserId = localStorage.getItem("userId") || "";
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
    pickBinType: "",
    stockState: "",
    stockStateFlag: "",
    status: "Edit",
    freeze: false,
    totalOrderQty: "",
    totalPickedQty: "",
  });

  // State for tables
  const [vasPickGridTableData, setVasPickGridTableData] = useState([]);
  const [modalTableData, setModalTableData] = useState([]);
  
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Dropdown lists
  const [pickBinTypeList, setPickBinTypeList] = useState([]);
  
  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableErrors, setTableErrors] = useState([]);

  // Initialize data
  useEffect(() => {
    getNewVasPickDocId();
    getAllPickBinType();

    if (editData) {
      getVasPickById(editData);
    } else {
      // Initialize with empty table
      setVasPickGridTableData([]);
    }
  }, [editData]);

  // Calculate total picked quantity whenever table data changes
  useEffect(() => {
    const totalQty = vasPickGridTableData.reduce(
      (sum, row) => sum + (parseInt(row.pickQty, 10) || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      totalPickedQty: totalQty,
    }));
  }, [vasPickGridTableData]);

  // API Functions
  const getNewVasPickDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const response = await vasPickAPI.getVasPickDocId(params);
      
      if (response?.paramObjectsMap?.VasPickDocId) {
        setFormData((prev) => ({
          ...prev,
          docId: response.paramObjectsMap.VasPickDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };
const getAllPickBinType = async () => {
  try {
    console.log("Component: Fetching bin types for orgId:", orgId);
    console.log("Component: Full orgId from localStorage:", localStorage.getItem("orgId"));
    console.log("Component: Global param orgId:", globalParam?.orgId);
    
    // Test if API is accessible
    console.log("Component: Testing API accessibility...");
    
    // Call the API function correctly
    const activeBinData = await vasPickAPI.getAllActiveLocationTypes(orgId);
    
    console.log("Component: API call completed");
    console.log("Component: Received bin data:", activeBinData);
    console.log("Component: Type of data:", typeof activeBinData);
    console.log("Component: Is array?", Array.isArray(activeBinData));
    
    if (activeBinData === undefined) {
      console.error("Component: API returned undefined");
    }
    
    if (activeBinData === null) {
      console.error("Component: API returned null");
    }
    
    // Ensure we set an array
    const binList = Array.isArray(activeBinData) ? activeBinData : [];
    setPickBinTypeList(binList);
    
    console.log("Component: Setting bin list:", binList);
    
    if (binList.length > 0) {
      console.log(`Component: Loaded ${binList.length} bin types:`, binList.map(b => b.binType));
    } else {
      console.warn("Component: No bin types loaded or empty array returned");
      addToast("No active bin types found", "info");
    }
  } catch (error) {
    console.error("Component: Error fetching bin types:", error);
    console.error("Component: Error details:", error.message);
    console.error("Component: Error stack:", error.stack);
    // Set empty array to prevent component crash
    setPickBinTypeList([]);
    addToast("Failed to fetch bin types", "error");
  }
};
  const getVasPickById = async (row) => {
    setEditId(row.id);
    try {
      const response = await vasPickAPI.getVasPickById(row.id);
      
      if (response?.status === true && response.paramObjectsMap?.vasPickVO) {
        const particularVasPick = response.paramObjectsMap.vasPickVO;
        
        // Update form data
        setFormData({
          docId: particularVasPick.docId || "",
          docDate: particularVasPick.docDate ? formatDateForInput(particularVasPick.docDate) : formatDateForInput(new Date()),
          pickBinType: particularVasPick.picBin || "",
          stockState: particularVasPick.stockState || "",
          stockStateFlag: particularVasPick.stateStatus || "",
          status: particularVasPick.status || "Edit",
          freeze: particularVasPick.freeze || false,
          totalOrderQty: particularVasPick.totalOrderQty || "",
          totalPickedQty: particularVasPick.totalPickedQty || "",
        });

        // Update table data
        if (particularVasPick.vasPickDetailsVO) {
          const tableData = particularVasPick.vasPickDetailsVO.map((row) => ({
            id: row.id || Date.now(),
            partNo: row.partNo || "",
            partDesc: row.partDescription || row.partDesc || "",
            sku: row.sku || "",
            avlQty: row.avlQty || "",
            batchNo: row.batchNo || "",
            batchDate: row.batchDate || "",
            grnNo: row.grnNo || "",
            grnDate: row.grnDate || "",
            bin: row.bin || "",
            binType: row.binType || "",
            binClass: row.binClass || "",
            core: row.core || "",
            expDate: row.expDate || "",
            qcFlag: row.qcFlag || "",
            pickQty: row.picQty || "",
            cellType: row.cellType || "",
            remainingQty: row.remaningQty || "",
          }));
          setVasPickGridTableData(tableData);
        }

        addToast("VAS Pick data loaded successfully", "success");
      } else {
        addToast("Failed to fetch VAS Pick details", "error");
      }
    } catch (error) {
      console.error("Error fetching VAS Pick details:", error);
      addToast("Error fetching VAS Pick details", "error");
    }
  };

  const getFillGridDetails = async () => {
    if (!formData.pickBinType || !formData.stockStateFlag) {
      addToast("Please select Pick Bin Type and Stock State first", "error");
      return;
    }

    try {
      const params = {
        bintype: formData.pickBinType,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        stateStatus: formData.stockStateFlag,
        warehouse: loginWarehouse,
      };

      const response = await vasPickAPI.getVasPicGridDetails(params);
      
      if (response?.status === true && response.paramObjectsMap?.vaspickGrid) {
        const gridDetails = response.paramObjectsMap.vaspickGrid;
        
        const formattedData = gridDetails.map((row, index) => ({
          id: row.id || Date.now() + index,
          partNo: row.partNo || "",
          partDesc: row.partDesc || "",
          sku: row.sku || "",
          grnNo: row.grnNo || "",
          grnDate: row.grnDate || "",
          batchNo: row.batch || "",
          batchDate: row.batchDate || "",
          bin: row.bin || "",
          binType: row.binType || "",
          binClass: row.binClass || "",
          core: row.core || "",
          expDate: row.expDate || "",
          avlQty: row.avalQty || "",
          pickQty: row.pickQty || "",
          qcFlag: row.qcFlag || "",
          cellType: row.cellType || "",
          status: row.status || "",
        }));
        
        setModalTableData(formattedData);
        setModalOpen(true);
      } else {
        addToast("No grid details found for selected criteria", "info");
      }
    } catch (error) {
      console.error("Error fetching grid details:", error);
      addToast("Failed to fetch grid details", "error");
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "stockState") {
      const stockStateFlag = value === "READY TO DISPATCH" ? "R" : value === "HOLD" ? "H" : "";
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        stockStateFlag: stockStateFlag,
      }));
    } else if (name === "status") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(modalTableData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmitSelectedRows = () => {
    const selectedData = selectedRows.map((index) => ({
      ...modalTableData[index],
      id: Date.now() + index, // Generate new ID to avoid conflicts
    }));

    // Add selected rows to main table
    setVasPickGridTableData((prev) => [...prev, ...selectedData]);

    // Reset and close modal
    setSelectedRows([]);
    setSelectAll(false);
    setModalOpen(false);

    addToast(`${selectedData.length} rows added to VAS Pick`, "success");
  };

  const handlePickQtyChange = (e, row, index) => {
    const value = e.target.value;
    const intPattern = /^\d*$/;

    if (intPattern.test(value) || value === "") {
      const numericValue = parseInt(value, 10);
      const numericAvlQty = parseInt(row.avlQty, 10) || 0;

      if (value === "" || numericValue <= numericAvlQty) {
        setVasPickGridTableData((prev) =>
          prev.map((r) => {
            if (r.id === row.id) {
              const updatedPickQty = numericValue || 0;
              return {
                ...r,
                pickQty: value,
                remainingQty: !value ? "" : numericAvlQty - updatedPickQty,
              };
            }
            return r;
          })
        );

        // Clear error for this row
        setTableErrors((prev) => {
          const newErrors = [...prev];
          if (newErrors[index]) {
            newErrors[index] = { ...newErrors[index], pickQty: "" };
          }
          return newErrors;
        });
      } else {
        setTableErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            pickQty: "Pick QTY cannot be greater than Avl QTY",
          };
          return newErrors;
        });
      }
    } else {
      setTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], pickQty: "Invalid value" };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id) => {
    setVasPickGridTableData(vasPickGridTableData.filter((row) => row.id !== id));
    addToast("Row removed", "info");
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      pickBinType: "",
      stockState: "",
      stockStateFlag: "",
      status: "Edit",
      freeze: false,
      totalOrderQty: "",
      totalPickedQty: "",
    });
    setVasPickGridTableData([]);
    setEditId("");
    setFieldErrors({});
    setTableErrors([]);
    getNewVasPickDocId();
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const errors = {};

    // Validate main form fields
    if (!formData.pickBinType) errors.pickBinType = "Pick Bin Type is required";
    if (!formData.stockState) errors.stockState = "Stock State is required";
    if (!formData.status) errors.status = "Status is required";

    // Validate table data
    let tableValid = true;
    const newTableErrors = vasPickGridTableData.map((row, index) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        tableValid = false;
      }
      if (!row.pickQty || row.pickQty <= 0) {
        rowErrors.pickQty = "Valid Pick QTY is required";
        tableValid = false;
      }
      if (parseInt(row.pickQty, 10) > parseInt(row.avlQty, 10)) {
        rowErrors.pickQty = "Pick QTY cannot exceed Available QTY";
        tableValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setTableErrors(newTableErrors);

    if (Object.keys(errors).length > 0 || !tableValid || vasPickGridTableData.length === 0) {
      addToast("Please fill all required fields correctly", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const gridVo = vasPickGridTableData.map((row) => ({
        ...(editId && { id: row.id }),
        partNo: row.partNo,
        partDescription: row.partDesc,
        sku: row.sku,
        avlQty: parseInt(row.avlQty || 0),
        batchNo: row.batchNo,
        batchDate: row.batchDate,
        grnNo: row.grnNo,
        grnDate: row.grnDate,
        bin: row.bin,
        binType: row.binType,
        binClass: row.binClass,
        core: row.core,
        expDate: row.expDate,
        qcflag: row.qcFlag,
        picQty: parseInt(row.pickQty || 0),
        cellType: row.cellType,
        remainingQty: 0,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        picBin: formData.pickBinType,
        stockState: formData.stockState,
        stateStatus: formData.stockStateFlag,
        status: formData.status,
        orgId: parseInt(orgId),
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        vasPickDetailsDTO: gridVo,
        createdBy: loginUserName,
      };

      const response = await vasPickAPI.createUpdateVasPick(saveFormData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(
          editId ? "VAS Pick Updated Successfully" : "VAS Pick created successfully",
          "success"
        );
      } else {
        const errorMessage =
          response.paramObjectsMap?.errorMessage || "VAS Pick creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "VAS Pick creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
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

const FloatingSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  error, 
  required = false, 
  disabled = false, 
  ...props 
}) => {
  // Ensure options is always an array
  const optionsArray = Array.isArray(options) ? options : [];
  
  return (
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
        {optionsArray.map((option) => (
          <option 
            key={option.binType || option.value || option} 
            value={option.binType || option.value || option}
          >
            {option.binType || option.label || option}
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
};

  // Modal Component
  const GridModal = () => {
    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Grid Details
            </h3>
            <button
              onClick={() => setModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Part No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                      Part Desc
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      SKU
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      GRN No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Batch No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Bin
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Avl Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {modalTableData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedRows((prev) =>
                              isChecked ? [...prev, index] : prev.filter((i) => i !== index)
                            );
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td className="px-3 py-2">{row.partNo}</td>
                      <td className="px-3 py-2">{row.partDesc}</td>
                      <td className="px-3 py-2">{row.sku}</td>
                      <td className="px-3 py-2">{row.grnNo}</td>
                      <td className="px-3 py-2">{row.batchNo}</td>
                      <td className="px-3 py-2">{row.bin}</td>
                      <td className="px-3 py-2 text-right">{row.avlQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitSelectedRows}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              disabled={selectedRows.length === 0}
            >
              Proceed ({selectedRows.length} selected)
            </button>
          </div>
        </div>
      </div>
    );
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
              {editData ? "Edit VAS Pick" : "Create VAS Pick"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage Value Added Service picking process
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
          <>
            <button
              onClick={getFillGridDetails}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
            >
              <Grid className="h-3 w-3" />
              Fill Grid
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-3 w-3" />
              {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
            </button>
          </>
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

            <FloatingSelect
              label="Pick Bin Type *"
              name="pickBinType"
              value={formData.pickBinType}
              onChange={handleInputChange}
              options={pickBinTypeList}
              error={fieldErrors.pickBinType}
              required
              disabled={formData.freeze}
            />

           <FloatingSelect
  label="Stock State *"
  name="stockState"
  value={formData.stockState}
  onChange={handleInputChange}
  options={["HOLD", "READY TO DISPATCH"]}
  error={fieldErrors.stockState}
  required
  disabled={formData.freeze}
/>
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
              label="Total Picked QTY"
              name="totalPickedQty"
              value={formData.totalPickedQty}
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
            Pick Details
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {vasPickGridTableData.length}
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
                  VAS Pick Items
                </h3>
                {!formData.freeze && vasPickGridTableData.length > 0 && (
                  <button
                    onClick={getFillGridDetails}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add More Items
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
                        Part Desc
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Bin
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Batch No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        GRN No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Avl Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Pick Qty *
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Remain Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {vasPickGridTableData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={formData.freeze ? 10 : 11}
                          className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No items added. Click "Fill Grid" to add items.
                        </td>
                      </tr>
                    ) : (
                      vasPickGridTableData.map((row, index) => (
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
                          <td className="px-3 py-2">{row.partDesc}</td>
                          <td className="px-3 py-2">{row.sku}</td>
                          <td className="px-3 py-2">{row.bin}</td>
                          <td className="px-3 py-2">{row.batchNo}</td>
                          <td className="px-3 py-2">{row.grnNo}</td>
                          <td className="px-3 py-2 text-right">{row.avlQty}</td>

                          <td className="px-3 py-2">
                            {!formData.freeze ? (
                              <div>
                                <input
                                  type="number"
                                  value={row.pickQty}
                                  onChange={(e) =>
                                    handlePickQtyChange(e, row, index)
                                  }
                                  className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    tableErrors[index]?.pickQty
                                      ? "border-red-500"
                                      : "border-gray-200 dark:border-gray-600"
                                  }`}
                                  min="0"
                                  max={row.avlQty}
                                />
                                {tableErrors[index]?.pickQty && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {tableErrors[index].pickQty}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-right">{row.pickQty}</div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-right">
                            {row.remainingQty}
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
                    {vasPickGridTableData.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Picked Quantity
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.totalPickedQty}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Modal */}
      <GridModal />
    </div>
  );
};

export default VasPickForm;