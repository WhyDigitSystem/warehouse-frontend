import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  MapPin,
  Hash,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import { openingStockAPI } from "../../../api/openingstockAPI";


const OpeningStockForm = ({ editData, onBack, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    partCode: "",
    partName: "",
    binLocation: "",
    batchNo: "",
    quantity: "",
    uom: "",
    rate: "",
    value: "",
    remarks: "",
    openingDate: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState([]);
  const [partList, setPartList] = useState([]);
  const [binList, setBinList] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (editData) {
      setFormData({
        partCode: editData.partCode || "",
        partName: editData.partName || "",
        binLocation: editData.binLocation || "",
        batchNo: editData.batchNo || "",
        quantity: editData.quantity || "",
        uom: editData.uom || "",
        rate: editData.rate || "",
        value: editData.value || "",
        remarks: editData.remarks || "",
        openingDate: editData.openingDate ? editData.openingDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
    fetchMasterData();
  }, [editData]);

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      // Fetch parts
      const partsResponse = await openingStockAPI.getParts({
        orgId: orgId,
        branchCode: loginBranchCode,
      });
      
      if (partsResponse.status === true) {
        setPartList(partsResponse.paramObjectsMap?.parts || []);
      }

      // Fetch bins
      const binsResponse = await openingStockAPI.getBins({
        orgId: orgId,
        warehouse: loginWarehouse,
      });
      
      if (binsResponse.status === true) {
        setBinList(binsResponse.paramObjectsMap?.bins || []);
      }

      // Fetch UOMs
      const uomsResponse = await openingStockAPI.getUOMs({
        orgId: orgId,
      });
      
      if (uomsResponse.status === true) {
        setUomList(uomsResponse.paramObjectsMap?.uoms || []);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      addToast("Failed to load master data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };

    // Auto-calculate value if quantity and rate are both numbers
    if ((name === "quantity" || name === "rate") && !isNaN(updatedForm.quantity) && !isNaN(updatedForm.rate)) {
      const qty = parseFloat(updatedForm.quantity) || 0;
      const rate = parseFloat(updatedForm.rate) || 0;
      updatedForm.value = (qty * rate).toFixed(2);
    }

    setFormData(updatedForm);
  };

  const handlePartChange = (partCode) => {
    const selectedPart = partList.find(p => p.code === partCode);
    if (selectedPart) {
      setFormData(prev => ({
        ...prev,
        partCode: selectedPart.code,
        partName: selectedPart.name,
        uom: selectedPart.defaultUom || prev.uom,
      }));
    }
  };

  const addItem = () => {
    if (!formData.partCode || !formData.quantity || !formData.uom) {
      addToast("Please fill Part Code, Quantity, and UOM", "error");
      return;
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate) || 0,
      value: parseFloat(formData.value) || 0,
    };

    setItems([...items, newItem]);
    
    // Reset form except for common fields
    setFormData({
      partCode: "",
      partName: "",
      binLocation: "",
      batchNo: "",
      quantity: "",
      uom: "",
      rate: "",
      value: "",
      remarks: "",
      openingDate: formData.openingDate,
    });
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (items.length === 0 && !editData) {
      addToast("Please add at least one item", "error");
      return;
    }

    const errors = {};
    if (!loginBranch) errors.loginBranch = "Branch is required";
    if (!loginBranchCode) errors.loginBranchCode = "BranchCode is required";
    if (!loginClient) errors.loginClient = "Client is required";
    if (!loginCustomer) errors.loginCustomer = "Customer is required";
    if (!loginWarehouse) errors.loginWarehouse = "Warehouse is required";
    if (!loginFinYear) errors.loginFinYear = "FinYear is required";
    if (!formData.openingDate) errors.openingDate = "Opening Date is required";

    if (Object.keys(errors).length > 0) {
      addToast("Please fix validation errors", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        orgId: orgId,
        openingDate: formData.openingDate,
        remarks: formData.remarks,
        createdBy: loginUserName,
        items: editData 
          ? [{
              id: editData.id,
              ...formData,
              quantity: parseFloat(formData.quantity),
              rate: parseFloat(formData.rate) || 0,
              value: parseFloat(formData.value) || 0,
              modifiedBy: loginUserName,
            }]
          : items.map(item => ({
              partCode: item.partCode,
              partName: item.partName,
              binLocation: item.binLocation,
              batchNo: item.batchNo,
              quantity: item.quantity,
              uom: item.uom,
              rate: item.rate,
              value: item.value,
              createdBy: loginUserName,
            }))
      };

      const response = editData 
        ? await openingStockAPI.updateOpeningStock(payload)
        : await openingStockAPI.createOpeningStock(payload);

      if (response.status === true) {
        addToast(
          editData 
            ? "Opening stock updated successfully" 
            : "Opening stock created successfully",
          "success"
        );
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        
        if (!editData) {
          setItems([]);
          setFormData({
            partCode: "",
            partName: "",
            binLocation: "",
            batchNo: "",
            quantity: "",
            uom: "",
            rate: "",
            value: "",
            remarks: "",
            openingDate: new Date().toISOString().split('T')[0],
          });
        }
        
        onBack();
      } else {
        addToast(response.paramObjectsMap?.errorMessage || "Failed to save opening stock", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to save opening stock", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editData ? 'Edit Opening Stock' : 'Add Opening Stock'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {editData ? 'Update existing opening stock entry' : 'Create new opening stock entries'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
            text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
            hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Save')}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opening Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4" />
              Opening Date *
            </label>
            <input
              type="date"
              name="openingDate"
              value={formData.openingDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter remarks"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Item Form */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editData ? 'Item Details' : 'Add Items'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Part Code */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Package className="h-4 w-4" />
              Part Code *
            </label>
            <select
              value={formData.partCode}
              onChange={(e) => handlePartChange(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select Part</option>
              {partList.map(part => (
                <option key={part.id} value={part.code}>
                  {part.code} - {part.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="partName"
              value={formData.partName}
              readOnly
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
              placeholder="Part name will auto-fill"
            />
          </div>

          {/* Bin Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4" />
              Bin Location
            </label>
            <select
              name="binLocation"
              value={formData.binLocation}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Bin</option>
              {binList.map(bin => (
                <option key={bin.id} value={bin.code}>{bin.code}</option>
              ))}
            </select>
          </div>

          {/* Batch No */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Hash className="h-4 w-4" />
              Batch No
            </label>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleInputChange}
              placeholder="Enter batch number"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* UOM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UOM *
            </label>
            <select
              name="uom"
              value={formData.uom}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select UOM</option>
              {uomList.map(uom => (
                <option key={uom.id} value={uom.code}>{uom.code} - {uom.name}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Rate */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="h-4 w-4" />
              Rate
            </label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Value
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              readOnly
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
            />
          </div>

          {/* Add Button (only for new entries) */}
          {!editData && (
            <div className="flex items-end">
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md 
                hover:bg-green-700 w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items Table (only for new entries) */}
      {!editData && items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Added Items ({items.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="p-3 text-left">Part Code</th>
                  <th className="p-3 text-left">Part Name</th>
                  <th className="p-3 text-left">Bin Location</th>
                  <th className="p-3 text-left">Batch No</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">UOM</th>
                  <th className="p-3 text-left">Rate</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr 
                    key={item.id} 
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3">{item.partCode}</td>
                    <td className="p-3">{item.partName}</td>
                    <td className="p-3">{item.binLocation || '-'}</td>
                    <td className="p-3">{item.batchNo || '-'}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.uom}</td>
                    <td className="p-3">{item.rate.toFixed(2)}</td>
                    <td className="p-3">{item.value.toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {editData 
                ? 'Editing opening stock entry'
                : `Total Items: ${items.length} | Total Value: ₹${items.reduce((sum, item) => sum + parseFloat(item.value || 0), 0).toFixed(2)}`
              }
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!editData && items.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (editData ? 'Update Opening Stock' : 'Save Opening Stock')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningStockForm;