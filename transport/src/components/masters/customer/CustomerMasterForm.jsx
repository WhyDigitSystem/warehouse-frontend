// ItemMasterForm.jsx
import {
  ArrowLeft,
  Building,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { masterAPI } from "../../../api/itemAPI";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";

/* -----------------------------------------------
   MAIN COMPONENT
------------------------------------------------ */
const ItemMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");
  
  const loginBranchCode = localStorage.getItem("branchcode") || "";
  const loginBranch = localStorage.getItem("branch") || "";
  const loginWarehouse = localStorage.getItem("warehouse") || "";
  const loginCustomer = localStorage.getItem("customer") || "";
  const loginClient = localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);

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
    
    // If editing, populate the form data
    if (editData) {
      // If the record has itemVo data, populate the itemTableData
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

  // Fetch all units
  const getAllUnits = async () => {
    try {
      const response = await masterAPI.getAllUnits();
      if (response.status === true) {
        setUnitList(response.paramObjectsMap?.unitVO || []);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Fetch all groups
  const getAllGroups = async () => {
    try {
      const response = await masterAPI.getAllGroups(ORG_ID);
      if (response.status === true) {
        setGroupList(response.paramObjectsMap?.groupVO || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
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
      // Create payload with correct API field names
      const payload = {
        ...(form.id && { id: form.id }),
        
        // Map form field names to API expected field names
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

        // Additional required fields
        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        warehouse: loginWarehouse,
        customer: loginCustomer,
        client: loginClient,
        orgId: ORG_ID,
        
        // Pricing data
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
        // Show success toast
        showToast(
          editData ? "Item Updated!" : "Item Saved!",
          "success"
        );
        
        // Call success callback if provided
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        
        onBack();
      } else {
        // Handle specific error cases
        const errorMessage = response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save item";
        
        // Show error toast
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      
      // Handle specific error cases from the API response
      const errorMessage = error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Please try again.";
      
      // Show error toast
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toast function (similar to your CustomerMasterForm)
  const showToast = (message, type = "success") => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-sm transition-all duration-300 transform ${
      type === 'success' 
        ? 'bg-green-500' 
        : 'bg-red-500'
    }`;
    toast.textContent = message;

    // Add to page
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const formatDate = (date) => {
    if (!date) return "";
    
    // Format as DD-MM-YYYY
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
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Item" : "Add Item"}
        </h2>
      </div>

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
            onChange={handleChange}
          />

          <FloatingSelect
            label="Purchase Unit"
            name="purchaseUnit"
            value={form.purchaseUnit}
            onChange={(value) => handleSelectChange("purchaseUnit", value)}
            options={unitOptions}
          />

          <FloatingSelect
            label="Storage Unit"
            name="storageUnit"
            value={form.storageUnit}
            onChange={(value) => handleSelectChange("storageUnit", value)}
            options={unitOptions}
          />

          <FloatingSelect
            label="SKU *"
            name="sku"
            value={form.sku}
            onChange={(value) => handleSelectChange("sku", value)}
            options={unitOptions}
            error={fieldErrors.sku}
            required
          />

          <FloatingSelect
            label="SSKU *"
            name="ssku"
            value={form.ssku}
            onChange={(value) => handleSelectChange("ssku", value)}
            options={unitOptions}
            error={fieldErrors.ssku}
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

          <FloatingInput
            label="Barcode"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            className="md:col-span-2"
          />

          {/* ACTIVE CHECKBOX */}
          <div className="flex items-center gap-2 p-1 md:col-span-2 lg:col-span-5">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
              className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
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

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" /> 
            {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterForm;