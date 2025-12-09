// ItemMasterForm.jsx - FIXED VERSION
import {
  ArrowLeft,
  Building,
  Plus,
  Save,
  Trash2,
  X,List,
  Upload,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { masterAPI } from "../../../api/itemAPI";
import { unitAPI } from "../../../api/unitAPI"; // ADD THIS IMPORT
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import * as XLSX from "xlsx";

/* -----------------------------------------------
   MAIN COMPONENT
------------------------------------------------ */
const ItemMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({
    units: false,
    groups: false
  });
  
  const loginBranchCode = localStorage.getItem("branchcode") || "";
  const loginBranch = localStorage.getItem("branch") || "";
  const loginWarehouse = localStorage.getItem("warehouse") || "";
  const loginCustomer = localStorage.getItem("customer") || "";
  const loginClient = localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    id: editData?.id || 0,
    itemType: editData?.itemType || "",
    partNo: editData?.partno || "",
    partDesc: editData?.partDesc || "",
    custPartNo: editData?.custPartno || "",
    groupName: editData?.groupName || "",
    styleCode: editData?.styleCode || "",
    baseSku: editData?.baseSku || "",
    purchaseUnit: editData?.purchaseUnit || "",
    storageUnit: editData?.storageUnit || "",
    fsn: editData?.fsn || "",
    saleUnit: editData?.saleUnit || "",
    type: editData?.type || "",
    sku: editData?.sku || "",
    skuQty: editData?.skuQty || "",
    ssku: editData?.ssku || "",
    sskuQty: editData?.sskuQty || "",
    weightSkuUom: editData?.weightOfSkuAndUom || "",
    hsnCode: editData?.hsnCode || "",
    controlBranch: editData?.cbranch || loginBranchCode,
    criticalStockLevel: editData?.criticalStockLevel || "",
    status: editData?.status || "R",
    parentChildKey: editData?.parentChildKey || "CHILD",
    barcode: editData?.barcode || "",
    skuCategory: editData?.skuCategory || "",
    movingType: editData?.movingType || "",
    active: editData?.active === "Active" || editData?.active === true ? true : false,
  });

  const [itemTableData, setItemTableData] = useState([
    { id: 1, mrp: "", fDate: null, tDate: null },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize data on component mount
  useEffect(() => {
    getAllUnits();
    getAllGroups();
    
    if (editData) {
      if (editData.itemVo && editData.itemVo.length > 0) {
        setItemTableData(
          editData.itemVo.map((item, index) => ({
            id: index + 1,
            mrp: item.mrp,
            fDate: item.fromdate ? new Date(item.fromdate) : null,
            tDate: item.todate ? new Date(item.todate) : null,
          }))
        );
      }
    }
  }, [editData]);

  // FIXED: Fetch all units from unitAPI
  const getAllUnits = async () => {
    try {
      setIsLoading(prev => ({ ...prev, units: true }));
      console.log("📦 [ItemForm] Fetching units for orgId:", ORG_ID);
      
      const response = await unitAPI.getUnits(ORG_ID);
      console.log("📦 [ItemForm] Units API Response:", response);

      // Handle different response structures
      let units = [];
      if (Array.isArray(response)) {
        units = response;
      } else if (response?.data?.paramObjectsMap?.unitVO) {
        units = response.data.paramObjectsMap.unitVO;
      } else if (response?.paramObjectsMap?.unitVO) {
        units = response.paramObjectsMap.unitVO;
      } else if (response?.unitVO) {
        units = response.unitVO;
      }

      if (units && units.length > 0) {
        const sortedUnits = units
          .filter(unit => unit.unitName) // Filter out null/undefined
          .sort((a, b) => (a.unitName || "").localeCompare(b.unitName || ""));
        
        setUnitList(sortedUnits);
        console.log("✅ [ItemForm] Units loaded:", sortedUnits.length);
      } else {
        console.warn("❌ [ItemForm] No units found in response");
        setUnitList([]);
        addToast("No units found", "warning");
      }
    } catch (error) {
      console.error("❌ [ItemForm] Error fetching units:", error);
      addToast("Failed to fetch units", "error");
      setUnitList([]);
    } finally {
      setIsLoading(prev => ({ ...prev, units: false }));
    }
  };

  // Fetch all groups
// Fetch all groups
const getAllGroups = async () => {
  try {
    setIsLoading(prev => ({ ...prev, groups: true }));
    const response = await masterAPI.getAllGroups(ORG_ID);
    
    // DEBUG: Log the entire response to see the structure
    console.log("🏷️ [ItemForm] DEBUG - Full Groups Response:", response);
    console.log("🏷️ [ItemForm] DEBUG - Response keys:", Object.keys(response));
    console.log("🏷️ [ItemForm] DEBUG - paramObjectsMap:", response.paramObjectsMap);
    console.log("🏷️ [ItemForm] DEBUG - groupVO:", response.paramObjectsMap?.groupVO);
    
    if (response.status === true) {
      setGroupList(response.data.paramObjectsMap?.groupVO || []);
      console.log("✅ [ItemForm] Groups loaded:", response.data.paramObjectsMap?.groupVO?.length || 0);
    } else {
      console.warn("❌ [ItemForm] No groups found in response");
      setGroupList([]);
    }
  } catch (error) {
    console.error("❌ [ItemForm] Error fetching groups:", error);
    addToast("Failed to fetch groups", "error");
    setGroupList([]);
  } finally {
    setIsLoading(prev => ({ ...prev, groups: false }));
  }
};
  // Rest of your code remains the same...
  // Bulk Upload Handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };

  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
    addToast("Items uploaded successfully!", "success");
  };

  const handleDownloadSample = () => {
    try {
      const sampleData = [
        {
          "Item Type": "ITEM",
          "Part No": "PART001",
          "Part Description": "Sample Part Description",
          "Customer Part No": "CUST001",
          "Group Name": "ELECTRONICS",
          "Style Code": "STYLE001",
          "Base SKU": "BSKU001",
          "Purchase Unit": "PCS",
          "Storage Unit": "PCS",
          "FSN": "123456",
          "Sale Unit": "PCS",
          "Type": "TYPE 1",
          "SKU": "PCS",
          "SKU Qty": "1",
          "SSKU": "PCS",
          "SSKU Qty": "1",
          "Weight SKU UOM": "0.5",
          "HSN Code": "85444290",
          "Control Branch": loginBranchCode,
          "Critical Stock Level": "10",
          "Status": "R",
          "Parent Child Key": "CHILD",
          "Barcode": "1234567890123",
          "SKU Category": "OPENSTORAGE",
          "Moving Type": "FAST",
          "Active": "Yes"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Items");
      const fileName = `Sample_Item_Upload_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      addToast("Sample file downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      addToast("Failed to download sample file", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.toUpperCase(),
    }));
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.partNo.trim()) errors.partNo = "Part No is required";
    if (!form.partDesc.trim()) errors.partDesc = "Part Description is required";
    if (!form.sku) errors.sku = "SKU is required";
    if (!form.ssku) errors.ssku = "SSKU is required";
    if (!form.status) errors.status = "Status is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...(form.id && { id: form.id }),
        
        itemType: form.itemType,
        partno: form.partNo,
        partDesc: form.partDesc,
        custPartno: form.custPartNo,
        groupName: form.groupName,
        styleCode: form.styleCode,
        baseSku: form.baseSku,
        purchaseUnit: form.purchaseUnit,
        storageUnit: form.storageUnit,
        fsn: form.fsn,
        saleUnit: form.saleUnit,
        type: form.type,
        sku: form.sku,
        skuQty: form.skuQty,
        ssku: form.ssku,
        sskuQty: form.sskuQty,
        weightOfSkuAndUom: form.weightSkuUom,
        hsnCode: form.hsnCode,
        cbranch: form.controlBranch,
        criticalStockLevel: form.criticalStockLevel,
        status: form.status,
        parentChildKey: form.parentChildKey,
        barcode: form.barcode,
        skuCategory: form.skuCategory,
        movingType: form.movingType,
        active: form.active,

        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        warehouse: loginWarehouse,
        customer: loginCustomer,
        client: loginClient,
        orgId: ORG_ID,
        
        itemVo: itemTableData.map((row) => ({
          mrp: row.mrp,
          fromdate: row.fDate ? formatDate(row.fDate) : "",
          todate: row.tDate ? formatDate(row.tDate) : "",
        })),
      };

      console.log("📤 Saving Item Payload:", payload);

      const response = await masterAPI.saveItem(payload);

      console.log("📥 Save Response:", response);

      if (response.status === true) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Item updated successfully!" : "Item created successfully!");
        
        addToast(successMessage, 'success');
        onSaveSuccess && onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save item";
        
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      
      const errorMessage = error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Please try again.";
      
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  // Handle add row to item table
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      mrp: "",
      fDate: null,
      tDate: null,
    };
    setItemTableData([...itemTableData, newRow]);
  };

  // Handle delete row from item table
  const handleDeleteRow = (index) => {
    if (itemTableData.length > 1) {
      setItemTableData(itemTableData.filter((_, i) => i !== index));
    }
  };

  const handleTableDataChange = (index, field, value) => {
    setItemTableData(prev => 
      prev.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  /* -------------------------- OPTIONS -------------------------- */
  const itemTypeOptions = [
    { value: "GROUP", label: "GROUP" },
    { value: "ITEM", label: "ITEM" }
  ];

  const controlBranchOptions = [
    { value: loginBranchCode, label: loginBranchCode },
    { value: "ALL", label: "ALL" },
  ];

  const statusOptions = [
    { value: "R", label: "R" },
    { value: "H", label: "H" },
  ];

  const parentChildOptions = [
    { value: "PARENT", label: "PARENT" },
    { value: "CHILD", label: "CHILD" },
  ];

  const skuCategoryOptions = [
    { value: "OPENSTORAGE", label: "Open Storage" },
    { value: "COLDSTORAGE", label: "Cold Storage" },
    { value: "STRONG", label: "Strong" },
    { value: "REGULAR", label: "Regular" },
  ];

  const movingTypeOptions = [
    { value: "FAST", label: "Fast" },
    { value: "MEDIUM", label: "Medium" },
    { value: "SLOW", label: "Slow" },
  ];

  const typeOptions = [
    { value: "TYPE 1", label: "TYPE 1" },
    { value: "TYPE 2", label: "TYPE 2" },
  ];

  // FIXED: Unit options with proper loading state
  const unitOptions = unitList.map(unit => ({
    value: unit.unitName,
    label: unit.unitName
  }));

  const groupOptions = groupList.map(group => ({
    value: group.groupName,
    label: group.groupName
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Item" : "Create Item"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage item master entries
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

      {/* ACTION BUTTONS - With Upload and Download */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
        </button>
        
        <button
          onClick={handleBulkUploadOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download Sample
        </button>
      </div>

      {/* Loading States */}
      {isLoading.units && (
        <div className="flex justify-center items-center py-2 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading units...</span>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {uploadOpen && (
        <CommonBulkUpload
          open={uploadOpen}
          handleClose={handleBulkUploadClose}
          title="Upload Items"
          uploadText="Upload Excel File"
          downloadText="Download Sample"
          onSubmit={handleSubmitUpload}
          sampleFileDownload={null}
          handleFileUpload={handleFileUpload}
          apiUrl={`/api/warehousemastercontroller/MaterialUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&orgId=${ORG_ID}&warehouse=${loginWarehouse}`}
          screen="Item Master"
        />
      )}

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID - 5 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <FloatingSelect
            label="Item Type"
            name="itemType"
            value={form.itemType}
            onChange={(value) => handleSelectChange("itemType", value)}
            options={itemTypeOptions}
          />
          
          <FloatingInput
            label="Part No *"
            name="partNo"
            value={form.partNo}
            onChange={handleChange}
            error={fieldErrors.partNo}
            required
          />
          
          <FloatingInput
            label="Part Description *"
            name="partDesc"
            value={form.partDesc}
            onChange={handleChange}
            error={fieldErrors.partDesc}
            required
          />
          
          <FloatingInput
            label="Customer Part No"
            name="custPartNo"
            value={form.custPartNo}
            onChange={handleChange}
          />

         <FloatingSelect
            label="Group Name"
            name="groupName"
            value={form.groupName}
            onChange={(value) => handleSelectChange("groupName", value)}
            options={groupOptions}
            disabled={isLoading.groups}
          />

          <FloatingInput
            label="Style Code"
            name="styleCode"
            value={form.styleCode}
            onChange={handleChange}
          />

          <FloatingInput
            label="Base SKU"
            name="baseSku"
            value={form.baseSku}
            onChange={(value) => handleSelectChange("baseSku", value)}
          />

          {/* FIXED: Unit dropdowns with proper loading state */}
          <FloatingSelect
            label="Purchase Unit"
            name="purchaseUnit"
            value={form.purchaseUnit}
            onChange={(value) => handleSelectChange("purchaseUnit", value)}
            options={unitOptions}
            disabled={isLoading.units}
          />

          <FloatingSelect
            label="Storage Unit"
            name="storageUnit"
            value={form.storageUnit}
            onChange={(value) => handleSelectChange("storageUnit", value)}
            options={unitOptions}
            disabled={isLoading.units}
          />

          <FloatingSelect
            label="SKU *"
            name="sku"
            value={form.sku}
            onChange={(value) => handleSelectChange("sku", value)}
            options={unitOptions}
            error={fieldErrors.sku}
            disabled={isLoading.units}
            required
          />

          <FloatingSelect
            label="SSKU *"
            name="ssku"
            value={form.ssku}
            onChange={(value) => handleSelectChange("ssku", value)}
            options={unitOptions}
            error={fieldErrors.ssku}
            disabled={isLoading.units}
            required
          />

          <FloatingSelect
            label="Control Branch"
            name="controlBranch"
            value={form.controlBranch}
            onChange={(value) => handleSelectChange("controlBranch", value)}
            options={controlBranchOptions}
          />

          <FloatingSelect
            label="Status *"
            name="status"
            value={form.status}
            onChange={(value) => handleSelectChange("status", value)}
            options={statusOptions}
            error={fieldErrors.status}
            required
          />

          <FloatingSelect
            label="Parent Child Key"
            name="parentChildKey"
            value={form.parentChildKey}
            onChange={(value) => handleSelectChange("parentChildKey", value)}
            options={parentChildOptions}
          />

          <FloatingSelect
            label="SKU Category"
            name="skuCategory"
            value={form.skuCategory}
            onChange={(value) => handleSelectChange("skuCategory", value)}
            options={skuCategoryOptions}
          />

          <FloatingSelect
            label="Moving Type"
            name="movingType"
            value={form.movingType}
            onChange={(value) => handleSelectChange("movingType", value)}
            options={movingTypeOptions}
          />

          <FloatingInput
            label="FSN"
            name="fsn"
            value={form.fsn}
            onChange={handleChange}
          />

          <FloatingSelect
            label="Sale Unit"
            name="saleUnit"
            value={form.saleUnit}
            onChange={(value) => handleSelectChange("saleUnit", value)}
            options={unitOptions}
            disabled={isLoading.units}
          />

          <FloatingSelect
            label="Type"
            name="type"
            value={form.type}
            onChange={(value) => handleSelectChange("type", value)}
            options={typeOptions}
          />

          <FloatingInput
            label="SKU Qty"
            name="skuQty"
            value={form.skuQty}
            onChange={handleChange}
            type="number"
          />

          <FloatingInput
            label="SSKU Qty"
            name="sskuQty"
            value={form.sskuQty}
            onChange={handleChange}
            type="number"
          />

          <FloatingInput
            label="Weight SKU UOM"
            name="weightSkuUom"
            value={form.weightSkuUom}
            onChange={handleChange}
          />

          <FloatingInput
            label="HSN Code"
            name="hsnCode"
            value={form.hsnCode}
            onChange={handleChange}
          />

          <FloatingInput
            label="Critical Stock Level"
            name="criticalStockLevel"
            value={form.criticalStockLevel}
            onChange={handleChange}
          />
          
          <div className="flex items-center gap-2 p-1">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </span>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              activeTab === "pricing"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Pricing
            <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs px-1 rounded">
              {itemTableData.length}
            </span>
          </button>
        </div>

        {activeTab === "pricing" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Pricing Details
              </h3>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Row
              </button>
            </div>

            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left font-medium text-gray-900 dark:text-white w-10"></th>
                    <th className="p-2 text-left font-medium text-gray-900 dark:text-white">MRP</th>
                    <th className="p-2 text-left font-medium text-gray-900 dark:text-white">From Date</th>
                    <th className="p-2 text-left font-medium text-gray-900 dark:text-white">To Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {itemTableData.map((row, index) => (
                    <tr
                      key={index}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteRow(index)}
                          disabled={itemTableData.length === 1}
                          className={`p-1 rounded ${
                            itemTableData.length === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.mrp}
                          onChange={(e) => handleTableDataChange(index, "mrp", e.target.value)}
                          placeholder="MRP"
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.fDate ? new Date(row.fDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleTableDataChange(index, "fDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.tDate ? new Date(row.tDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleTableDataChange(index, "tDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemMasterForm;