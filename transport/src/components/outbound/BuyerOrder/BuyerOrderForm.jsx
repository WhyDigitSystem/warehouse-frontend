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
  Grid,
  FileText,
} from "lucide-react";
import { buyerOrderAPI, buyerAPI } from "../../../api/buyerorderAPI";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import { useToast } from "../../Toast/ToastContext";
import sampleFile from "../../../assets/sample-files/sample_data_buyerorder.xls";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const BuyerOrderForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
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

  const [buyerList, setBuyerList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [editId, setEditId] = useState("");

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    docid: "",
    docdate: formatDateForInput(new Date()),
    orderNo: "",
    orderDate: formatDateForInput(new Date()),
    buyer: "",
    buyerName: "",
    buyerShortName: "",
    billTo: "",
    billToName: "",
    billToShortName: "",
    shipTo: "",
    shipToName: "",
    shipToShortName: "",
    deliveryDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    paymentTerms: "NET 30",
    shippingMethod: "ROAD",
    remarks: "",
    status: "DRAFT",
    totalAmount: 0,
    totalQuantity: 0,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [orderItems, setOrderItems] = useState([]);

  // Initialize data
  useEffect(() => {
    getNewOrderNo();
    getAllActiveBuyer();
    getAllPartNo();

    if (editData) {
      getBuyerOrderById(editData);
    }
  }, [editData]);

  // API Functions
  const getNewOrderNo = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await buyerOrderAPI.getBuyerOrderDocId(params);
      
      if (response?.paramObjectsMap?.BuyerOrderDocId) {
        setFormData(prev => ({
          ...prev,
          docid: response.paramObjectsMap.BuyerOrderDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching order number:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getAllActiveBuyer = async () => {
    try {
      const params = {
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      };

      const response = await buyerAPI.getAllActiveBuyer(params);
      
      if (response?.paramObjectsMap?.buyerVO) {
        setBuyerList(response.paramObjectsMap.buyerVO);
      }
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      addToast("Failed to fetch buyer data", "error");
    }
  };

  const getAllPartNo = async () => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await buyerOrderAPI.getPartNoByBuyerOrder(params);
      
      if (response?.paramObjectsMap?.partNoDetails) {
        setPartNoList(response.paramObjectsMap.partNoDetails);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      addToast("Failed to fetch part numbers", "error");
    }
  };

  const getBuyerOrderById = async (order) => {
    setEditId(order.id);
    try {
      console.log("🔄 Fetching buyer order by ID:", order.id);
      
      const response = await buyerOrderAPI.getBuyerOrderById(order.id);
      
      console.log("📥 Single Buyer Order API Response:", response);
      console.log("📥 Response status:", response?.status);
      console.log("📥 Response paramObjectsMap:", response?.paramObjectsMap);
      console.log("📥 Response buyerOrderVO:", response?.paramObjectsMap?.buyerOrderVO);

      // FIX: Access response directly, not response.data
      if (response?.status === true && response.paramObjectsMap?.buyerOrderVO) {
        const particularBuyerOrder = response.paramObjectsMap.buyerOrderVO;
        
        console.log("✅ Buyer order data received:", particularBuyerOrder);
        
        setFormData(prev => ({
          ...prev,
          docid: particularBuyerOrder.docId || "",
          docdate: particularBuyerOrder.docDate ? formatDateForInput(particularBuyerOrder.docDate) : formatDateForInput(new Date()),
          orderNo: particularBuyerOrder.orderNo || "",
          orderDate: particularBuyerOrder.orderDate ? formatDateForInput(particularBuyerOrder.orderDate) : formatDateForInput(new Date()),
          buyerShortName: particularBuyerOrder.buyerShortName || "",
          buyerName: particularBuyerOrder.buyer || "",
          billToShortName: particularBuyerOrder.billToShortName || "",
          billToName: particularBuyerOrder.billToName || "",
          shipToShortName: particularBuyerOrder.shipToShortName || "",
          shipToName: particularBuyerOrder.shipToName || "",
          remarks: particularBuyerOrder.remarks || "",
          status: particularBuyerOrder.freeze ? "CONFIRMED" : particularBuyerOrder.cancel ? "CANCELLED" : "DRAFT",
        }));

        // Set order items - buyerOrderDetailsVO is an array
        const orderItemsData = particularBuyerOrder.buyerOrderDetailsVO?.map((bo, index) => ({
          id: bo.id || index + 1,
          partNo: bo.partNo || "",
          partDesc: bo.partDesc || "",
          sku: bo.sku || "",
          batchNo: bo.batchNo || "",
          availQty: bo.availQty || 0,
          quantity: bo.qty || 0,
          rowBatchNoList: [],
          expDate: bo.expDate || "",
          avlqty: bo.availQty || 0,
          orderqty: bo.qty || 0,
        })) || [];

        console.log("✅ Order items data:", orderItemsData);
        setOrderItems(orderItemsData);

        // Fetch batch numbers for each part
        if (orderItemsData.length > 0) {
          for (const item of orderItemsData) {
            if (item.partNo) {
              await getBatchNo(item.partNo, item);
            }
          }
        }
      } else {
        console.error("❌ Failed to fetch buyer order data");
        addToast("Failed to fetch buyer order details", "error");
      }
    } catch (error) {
      console.error("❌ Error fetching buyer order details:", error);
      addToast("Error fetching buyer order details", "error");
    }
  };

  const getBatchNo = async (selectedPartNo, row) => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        partNo: selectedPartNo,
        warehouse: loginWarehouse
      };

      const response = await buyerOrderAPI.getBatchByBuyerOrder(params);
      
      setOrderItems(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowBatchNoList: response.paramObjectsMap?.skuDetails || [],
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching batch data:", error);
    }
  };

  const getAvailQty = async (selectedBatchNo, selectedPartNo, row) => {
    try {
      const params = {
        batchNo: selectedBatchNo,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        partNo: selectedPartNo,
        warehouse: loginWarehouse
      };

      const response = await buyerOrderAPI.getAvlQtyForBuyerOrder(params);
      
      setOrderItems(prev =>
        prev.map(item =>
          item.id === row.id
            ? {
                ...item,
                avlqty: response.paramObjectsMap?.avlQty || 0,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }
  };

  const fetchSkuDetailsByOrder = async () => {
    if (!formData.orderNo) {
      addToast("Please enter an order number", "warning");
      return;
    }

    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orderno: formData.orderNo,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await buyerOrderAPI.getBoSkuDetails(params);

      if (response.status === true) {
        const skuDetails = response.paramObjectsMap?.skuDetails || [];
        
        const transformedData = skuDetails.map((item, index) => ({
          id: index + 1,
          partNo: item.partNo || "",
          partDesc: item.partDesc || "",
          sku: item.sku || "",
          batchNo: item.batch || "",
          avlqty: item.sqty || 0,
          orderqty: item.qty || 0,
          rowBatchNoList: [],
          expDate: item.expDate || "",
        }));

        setOrderItems(transformedData);
        addToast(`Loaded ${transformedData.length} items from order`, "success");
      } else {
        addToast("No SKU details found for this order", "error");
      }
    } catch (error) {
      console.error("Error fetching order-based SKU details:", error);
      addToast("Failed to fetch order details", "error");
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
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle buyer selection
    if (name === "buyerShortName") {
      const selectedBuyer = buyerList.find(row => row.buyerShortName === value);
      if (selectedBuyer) {
        setFormData(prev => ({
          ...prev,
          buyerShortName: value,
          buyerName: selectedBuyer.buyer,
        }));
      }
    }

    // Handle bill to selection
    if (name === "billToShortName") {
      const selectedBillTo = buyerList.find(row => row.buyerShortName === value);
      if (selectedBillTo) {
        setFormData(prev => ({
          ...prev,
          billToShortName: value,
          billToName: selectedBillTo.buyer,
        }));
      }
    }

    // Handle ship to selection
    if (name === "shipToShortName") {
      const selectedShipTo = buyerList.find(row => row.buyerShortName === value);
      if (selectedShipTo) {
        setFormData(prev => ({
          ...prev,
          shipToShortName: value,
          shipToName: selectedShipTo.buyer,
        }));
      }
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? formatDateForInput(date) : "";
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  const handleBatchNoChange = (row, value) => {
    const selectedBatch = row.rowBatchNoList.find(
      (batch) => batch.batch === value
    );

    setOrderItems(prev =>
      prev.map(item =>
        item.id === row.id
          ? {
              ...item,
              batchNo: value,
              expDate: selectedBatch?.expDate || "",
              availQty: selectedBatch?.availQty || "",
            }
          : item
      )
    );

    // Call getAvailQty with the selected batch number and part number
    getAvailQty(value, row.partNo, row);
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      sku: "",
      batchNo: "",
      availQty: "",
      quantity: "",
      rowBatchNoList: [],
      deliveryDate: formData.deliveryDate,
      status: "PENDING",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems(prev =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // If partNo changes, fetch batch numbers
    if (field === "partNo" && value) {
      const item = orderItems.find((i) => i.id === id);
      if (item) {
        getBatchNo(value, item);
      }
    }
  };

  const handleDeleteItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docid: "",
      docdate: formatDateForInput(new Date()),
      orderNo: "",
      orderDate: formatDateForInput(new Date()),
      buyer: "",
      buyerName: "",
      buyerShortName: "",
      billTo: "",
      billToName: "",
      billToShortName: "",
      shipTo: "",
      shipToName: "",
      shipToShortName: "",
      deliveryDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      paymentTerms: "NET 30",
      shippingMethod: "ROAD",
      remarks: "",
      status: "DRAFT",
      totalAmount: 0,
      totalQuantity: 0,
    });
    setOrderItems([]);
    setEditId("");
    setFieldErrors({});
    getNewOrderNo();
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    try {
      if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
        return dateString;
      }

      if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
        const date = new Date(dateString.split('-').reverse().join('-'));
        return date.toISOString().split('T')[0];
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
    if (!formData.orderNo) errors.orderNo = "Order No is required";
    if (!formData.orderDate) errors.orderDate = "Order Date is required";
    if (!formData.buyerShortName) errors.buyerShortName = "Buyer is required";

    // Validate table data
    let orderItemsValid = true;
    orderItems.forEach((row) => {
      if (!row.partNo || !row.quantity || row.quantity <= 0) {
        orderItemsValid = false;
      }
    });

    if (!orderItemsValid) {
      addToast("Please fill all required fields in the table", "error");
      return;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const buyerOrderDetailsDTO = orderItems.map((item) => ({
        ...(editId && { id: item.id }),
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        batchNo: item.batchNo,
        availQty: item.avlqty || 0,
        qty: item.quantity,
        remarks: item.remarks || "",
        expDate: item.expDate || "",
      }));

      const saveFormData = {
        ...(editId && { id: parseInt(editId) }),
        branch: loginBranch,
        branchCode: loginBranchCode,
        buyerOrderDetailsDTO,
        client: loginClient,
        createdBy: loginUserName,
        buyer: formData.buyerName || "",
        buyerShortName: formData.buyerShortName,
        billToName: formData.billToName || "",
        billToShortName: formData.billToShortName || "",
        customer: loginCustomer,
        docDate: formData.docdate ? formatDateForAPI(formData.docdate) : null,
        docId: formData.docid || "",
        finYear: loginFinYear,
        orderDate: formData.orderDate ? formatDateForAPI(formData.orderDate) : null,
        orderNo: formData.orderNo,
        orgId: parseInt(orgId),
        shipToName: formData.shipToName || "",
        shipToShortName: formData.shipToShortName || "",
        warehouse: loginWarehouse,
        ...(formData.deliveryDate && { deliveryDate: formData.deliveryDate }),
        ...(formData.paymentTerms && { paymentTerms: formData.paymentTerms }),
        ...(formData.remarks && { remarks: formData.remarks }),
        ...(formData.shippingMethod && { shippingMethod: formData.shippingMethod }),
        ...(formData.status && { status: formData.status }),
        ...(formData.totalAmount && { totalAmount: formData.totalAmount }),
        ...(formData.totalQuantity && { totalQuantity: formData.totalQuantity }),
      };

      console.log("📤 Saving Buyer Order:", saveFormData);

      const response = await buyerOrderAPI.saveBuyerOrder(saveFormData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(editId ? "Buyer Order Updated Successfully" : "Buyer Order created successfully", "success");
        onBack();
      } else {
        const errorMessage = response.paramObjectsMap?.errorMessage || "Buyer Order creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Buyer Order creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals when order items change
  useEffect(() => {
    const totalQty = orderItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const totalAmt = orderItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
    }));
  }, [orderItems]);

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
              {editData ? "Edit Buyer Order" : "Create Buyer Order"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage buyer orders
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
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
        </button>
        
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = sampleFile;
            link.download = "sample_BuyerOrder.xls";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("Downloading sample file...", "info");
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download
        </button>
      </div>

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
        </div>

        {/* BASIC INFORMATION TAB */}
        {activeTab === "basic" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Document No"
                name="docid"
                value={formData.docid}
                onChange={handleInputChange}
                disabled
              />
              
              <FloatingInput
                label="Doc Date"
                name="docdate"
                value={formData.docdate}
                onChange={handleInputChange}
                type="date"
                disabled={!!editId}
              />

              <div className="relative">
                <FloatingInput
                  label="Order No"
                  name="orderNo"
                  value={formData.orderNo}
                  onChange={handleInputChange}
                  error={fieldErrors.orderNo}
                  required
                />
                <button
                  onClick={fetchSkuDetailsByOrder}
                  className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <FloatingInput
                label="Order Date"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleInputChange}
                type="date"
                error={fieldErrors.orderDate}
                required
                disabled={!!editId}
              />

              <FloatingSelect
                label="Buyer *"
                name="buyerShortName"
                value={formData.buyerShortName}
                onChange={handleSelectChange}
                options={buyerList.map(buy => ({ 
                  value: buy.buyerShortName, 
                  label: buy.buyerShortName 
                }))}
                error={fieldErrors.buyerShortName}
                required
                disabled={!!editId}
              />

              <FloatingInput
                label="Buyer Name"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Bill To"
                name="billToShortName"
                value={formData.billToShortName}
                onChange={handleSelectChange}
                options={buyerList.map(buy => ({ 
                  value: buy.buyerShortName, 
                  label: buy.buyerShortName 
                }))}
              />

              <FloatingInput
                label="Bill To Name"
                name="billToName"
                value={formData.billToName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Ship To"
                name="shipToShortName"
                value={formData.shipToShortName}
                onChange={handleSelectChange}
                options={buyerList.map(buy => ({ 
                  value: buy.buyerShortName, 
                  label: buy.buyerShortName 
                }))}
              />

              <FloatingInput
                label="Ship To Name"
                name="shipToName"
                value={formData.shipToName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Delivery Date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                type="date"
              />

              <FloatingSelect
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleSelectChange}
                options={[
                  { value: "NET 30", label: "NET 30" },
                  { value: "NET 45", label: "NET 45" },
                  { value: "NET 60", label: "NET 60" },
                  { value: "CASH", label: "CASH" },
                  { value: "ADVANCE", label: "ADVANCE" },
                ]}
              />

              <FloatingSelect
                label="Shipping Method"
                name="shippingMethod"
                value={formData.shippingMethod}
                onChange={handleSelectChange}
                options={[
                  { value: "ROAD", label: "ROAD" },
                  { value: "AIR", label: "AIR" },
                  { value: "SEA", label: "SEA" },
                  { value: "RAIL", label: "RAIL" },
                ]}
              />

              <FloatingSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                options={[
                  { value: "DRAFT", label: "DRAFT" },
                  { value: "CONFIRMED", label: "CONFIRMED" },
                  { value: "CANCELLED", label: "CANCELLED" },
                  { value: "COMPLETED", label: "COMPLETED" },
                ]}
              />

              <FloatingInput
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        {/* ORDER ITEMS TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Order Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {orderItems.length}
              </span>
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
                onClick={fetchSkuDetailsByOrder}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
              >
                <Grid className="h-3 w-3" />
                Fill from Order
              </button>
              <button
                onClick={() => setOrderItems([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

          {/* Order Items Table */}
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
                    Part No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    Part Desc
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Batch No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Avl Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Order Qty *
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">
                        {index + 1}
                      </td>

                      {/* Part No */}
                      <td className="px-3 py-2">
                        <select
                          value={item.partNo}
                          onChange={(e) => {
                            const selectedPart = partNoList.find(
                              (p) => p.partNo === e.target.value
                            );
                            handleItemChange(item.id, "partNo", e.target.value);
                            handleItemChange(
                              item.id,
                              "partDesc",
                              selectedPart?.description || selectedPart?.partDesc || ""
                            );
                            handleItemChange(
                              item.id,
                              "sku",
                              selectedPart?.sku || ""
                            );
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Part No</option>
                          {partNoList.map((part) => (
                            <option key={part.partNo} value={part.partNo}>
                              {part.partNo}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Part Desc */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.partDesc}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
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
                        <select
                          value={item.batchNo}
                          onChange={(e) => handleBatchNoChange(item, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!item.partNo}
                        >
                          <option value="">Select Batch No</option>
                          {item.rowBatchNoList?.map((batch) => (
                            <option key={batch.batch} value={batch.batch}>
                              {batch.batch}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Available Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.avlqty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Order Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.orderqty}
                          onChange={(e) => handleItemChange(item.id, "orderqty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Quantity */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Total Order Qty: {formData.totalQuantity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Buyer Order Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSaveOrder}
        sampleFileDownload={sampleFile}
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/buyerOrder/ExcelUploadForBuyerOrder?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Buyer Order"
      />
    </div>
  );
};

export default BuyerOrderForm;