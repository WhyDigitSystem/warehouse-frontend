import React, { useState, useEffect } from "react";
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
  QrCode,
  Printer,
  Package,
  FileText,
  Truck,
  Box,
  Scale,
  Banknote,
  Shield,
  ClipboardCheck,
  Calendar,
  User,
  MapPin,
  Mail,
  Tag,
  Percent,
  FileDigit,
  Container,
  Car,
  Receipt,
  CreditCard,
  Building,
  FileWarning,
  CheckSquare,
} from "lucide-react";
import dayjs from "dayjs";

import { deliveryChallanAPI } from "../../../api/deliverychallanAPI";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const DeliveryChallanForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  
  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const orgId = globalParam?.orgId || localStorage.getItem("orgId");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const [editId, setEditId] = useState("");
  const [editBuyerOrderNo, setEditBuyerOrderNo] = useState("");
  const [deliveryChallanDocId, setDeliveryChallanDocId] = useState("");

  const [formData, setFormData] = useState({
    docDate: dayjs().format("YYYY-MM-DD"),
    buyerOrderNo: "",
    pickReqDate: "",
    invoiceNo: "",
    containerNO: "",
    vechileNo: "",
    exciseInvoiceNo: "",
    commercialInvoiceNo: "",
    boDate: "",
    buyer: "",
    deliveryTerms: "",
    payTerms: "",
    grWaiverNo: "",
    grWaiverDate: dayjs().format("YYYY-MM-DD"),
    bankName: "",
    grWaiverClosureDate: dayjs().format("YYYY-MM-DD"),
    gatePassNo: "",
    gatePassDate: dayjs().format("YYYY-MM-DD"),
    insuranceNo: "",
    billTo: "",
    shipTo: "",
    automailerGroup: "",
    docketNo: "",
    noOfBoxes: "",
    pkgUom: "",
    grossWeight: "",
    gwtUom: "",
    transportName: "",
    transporterDate: dayjs().format("YYYY-MM-DD"),
    packingSlipNo: "",
    bin: "",
    taxType: "",
    remarks: "",
    freeze: false,
  });

  const [deliveryItems, setDeliveryItems] = useState([
    {
      key: Date.now(),
      qrbarcode: "",
      pickRequestNo: "",
      prDate: "",
      partNo: "",
      partDescription: "",
      outBoundBin: "",
      shippedQty: "",
      unitRate: "",
      skuValue: "",
      discount: "",
      tax: "",
      gstTax: "",
      amount: "",
      sgst: "",
      cgst: "",
      igst: "",
      totalGst: "",
      billAmount: "",
      remarks: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});

  // Helper functions
  const safeDayjs = (dateValue, format = "YYYY-MM-DD") => {
    if (!dateValue) return null;
    if (dayjs.isDayjs(dateValue)) return dateValue;
    const date = dayjs(dateValue, format);
    return date.isValid() ? date : null;
  };

  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return null;
    const date = safeDayjs(dateValue);
    return date && date.isValid() ? date.format("YYYY-MM-DD") : null;
  };

  // Initialize data
  useEffect(() => {
    fetchDocId();
    fetchBuyerOrders();

    if (editData) {
      handleEditDeliveryChallan(editData);
    }
  }, [editData]);

  // API Functions
  const fetchDocId = async () => {
    try {
      const params = {
        orgId,
        branchCode: loginBranchCode,
        client: loginClient,
        branch: loginBranch,
        finYear: loginFinYear
      };

      const response = await deliveryChallanAPI.getDeliveryChallanDocId(params);
      
      if (response?.status === true) {
        setDeliveryChallanDocId(response.paramObjectsMap.DeliveryChallanDocId);
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const fetchBuyerOrders = async () => {
    try {
      const params = {
        orgId,
        branchCode: loginBranchCode,
        client: loginClient,
        branch: loginBranch,
        warehouse: loginWarehouse
      };

      const response = await deliveryChallanAPI.getAllPickRequests(params);
      
      if (response?.status === true) {
        setBuyerOrderList(response.paramObjectsMap.pickRequestVO || []);
      }
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
      addToast("Failed to fetch buyer orders", "error");
    }
  };

  const fetchBuyerOrderTableData = async (buyerOrderNo) => {
    try {
      const params = {
        orgId,
        branchCode: loginBranchCode,
        client: loginClient,
        branch: loginBranch,
        warehouse: loginWarehouse
      };

      const response = await deliveryChallanAPI.getAllPickRequests(params);
      
      const pickRequests = response.data.paramObjectsMap.pickRequestVO || [];
      const selectedPickRequest = pickRequests.find(
        (pr) => pr.buyerOrderNo === buyerOrderNo
      );

      if (selectedPickRequest && selectedPickRequest.pickRequestDetailsVO) {
        const tableData = selectedPickRequest.pickRequestDetailsVO.map(
          (item, index) => ({
            key: Date.now() + index,
            qrbarcode: "",
            pickRequestNo: selectedPickRequest.docId || "",
            prDate: selectedPickRequest.docDate,
            partNo: item.partNo || "",
            partDescription: item.partDesc || "",
            outBoundBin: item.bin || "",
            shippedQty: item.pickQty?.toString() || item.orderQty?.toString() || "0",
            unitRate: "0",
            skuValue: "0",
            discount: "0",
            tax: "0",
            gstTax: "0",
            amount: "0",
            sgst: "0",
            cgst: "0",
            igst: "0",
            totalGst: "0",
            billAmount: "0",
            remarks: item.remarks || "",
          })
        );
        setDeliveryItems(tableData);
      } else {
        const tableData = [
          {
            key: Date.now(),
            qrbarcode: "",
            pickRequestNo: selectedPickRequest?.docId || "",
            prDate: selectedPickRequest?.docDate,
            partNo: "",
            partDescription: "",
            outBoundBin: "",
            shippedQty: "0",
            unitRate: "0",
            skuValue: "0",
            discount: "0",
            tax: "0",
            gstTax: "0",
            amount: "0",
            sgst: "0",
            cgst: "0",
            igst: "0",
            totalGst: "0",
            billAmount: "0",
            remarks: "",
          },
        ];
        setDeliveryItems(tableData);
      }
    } catch (error) {
      console.error("Error fetching buyer order table data:", error);
      addToast("Failed to fetch item details", "error");
      setDeliveryItems([]);
    }
  };

  const handleBuyerOrderChange = async (value) => {
    const selectedBuyerOrder = buyerOrderList.find(
      (buyer) => buyer.buyerOrderNo === value
    );

    if (selectedBuyerOrder) {
      setFormData(prev => ({
        ...prev,
        buyerOrderNo: selectedBuyerOrder.buyerOrderNo,
        invoiceNo: selectedBuyerOrder.invoiceNo || "",
        pickReqDate: selectedBuyerOrder.docDate,
        boDate: selectedBuyerOrder.buyerRefDate || selectedBuyerOrder.buyerOrderDate,
        buyer: selectedBuyerOrder.customerName || "",
        billTo: selectedBuyerOrder.customerAddress || "",
        shipTo: selectedBuyerOrder.customerAddress || "",
      }));

      try {
        // Fetch additional data
        const response = await deliveryChallanAPI.getBuyerOrderData(value);
        const buyerData = response.data.paramObjectsMap.vasPutawayVO?.[0] ||
                        response.data.paramObjectsMap.pickRequestVO?.[0];

        if (buyerData) {
          setFormData(prev => ({
            ...prev,
            buyer: buyerData.customerName || buyerData.buyer || "",
            billTo: buyerData.customerAddress || buyerData.billTo || "",
            shipTo: buyerData.customerAddress || buyerData.shipTo || "",
          }));
        }

        // Fetch table data
        await fetchBuyerOrderTableData(value);
        
        addToast("Buyer order details loaded successfully", "success");
      } catch (error) {
        console.error("Error fetching buyer order data:", error);
        addToast("Failed to load buyer order details", "error");
      }
    }
  };

  const handleEditDeliveryChallan = async (record) => {
    setEditId(record.id);
    setEditBuyerOrderNo(record.buyerOrderNo);
    
    try {
      const response = await deliveryChallanAPI.getDeliveryChallanById(record.id);
      const challan = response.data.paramObjectsMap.deliveryChallanVO;
      
      setDeliveryChallanDocId(challan.docId);

      setFormData({
        docDate: challan.docDate,
        buyerOrderNo: challan.buyerOrderNo,
        pickReqDate: challan.pickReqDate,
        invoiceNo: challan.invoiceNo,
        containerNO: challan.containerNO,
        vechileNo: challan.vechileNo,
        exciseInvoiceNo: challan.exciseInvoiceNo,
        commercialInvoiceNo: challan.commercialInvoiceNo,
        boDate: challan.boDate,
        buyer: challan.buyer,
        deliveryTerms: challan.deliveryTerms,
        payTerms: challan.payTerms,
        grWaiverNo: challan.grWaiverNo,
        grWaiverDate: challan.grWaiverDate,
        bankName: challan.bankName,
        grWaiverClosureDate: challan.grWaiverClosureDate,
        gatePassNo: challan.gatePassNo,
        gatePassDate: challan.gatePassDate,
        insuranceNo: challan.insuranceNo,
        billTo: challan.billTo,
        shipTo: challan.shipTo,
        automailerGroup: challan.automailerGroup,
        docketNo: challan.docketNo,
        noOfBoxes: challan.noOfBoxes,
        pkgUom: challan.pkgUom,
        grossWeight: challan.grossWeight,
        gwtUom: challan.gwtUom,
        transportName: challan.transportName,
        transporterDate: challan.transporterDate,
        packingSlipNo: challan.packingSlipNo,
        bin: challan.bin,
        taxType: challan.taxType,
        remarks: challan.remarks,
        freeze: challan.freeze || false,
      });

      setDeliveryItems(
        challan.deliveryChallanDetailsVO?.map((detail, index) => ({
          key: Date.now() + index,
          pickRequestNo: detail.pickRequestNo,
          prDate: detail.prDate,
          partNo: detail.partNo,
          partDescription: detail.partDescription,
          outBoundBin: detail.outBoundBin,
          shippedQty: detail.shippedQty,
          unitRate: detail.unitRate,
          skuValue: detail.skuValue,
          discount: detail.discount,
          tax: detail.tax,
          gstTax: detail.gstTax,
          amount: detail.amount,
          sgst: detail.sgst,
          cgst: detail.cgst,
          igst: detail.igst,
          totalGst: detail.totalGst,
          billAmount: detail.billAmount,
          remarks: detail.remarks,
        })) || []
      );
      
      addToast("Delivery challan data loaded successfully", "success");
    } catch (error) {
      console.error("Error loading delivery challan details:", error);
      addToast("Failed to load delivery challan details", "error");
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
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      qrbarcode: "",
      pickRequestNo: "",
      prDate: "",
      partNo: "",
      partDescription: "",
      outBoundBin: "",
      shippedQty: "",
      unitRate: "",
      skuValue: "",
      discount: "",
      tax: "",
      gstTax: "",
      amount: "",
      sgst: "",
      cgst: "",
      igst: "",
      totalGst: "",
      billAmount: "",
      remarks: "",
    };
    setDeliveryItems([...deliveryItems, newItem]);
  };

  const handleItemChange = (key, field, value) => {
    setDeliveryItems(prev =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (key) => {
    setDeliveryItems(deliveryItems.filter((item) => item.key !== key));
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs().format("YYYY-MM-DD"),
      buyerOrderNo: "",
      pickReqDate: "",
      invoiceNo: "",
      containerNO: "",
      vechileNo: "",
      exciseInvoiceNo: "",
      commercialInvoiceNo: "",
      boDate: "",
      buyer: "",
      deliveryTerms: "",
      payTerms: "",
      grWaiverNo: "",
      grWaiverDate: dayjs().format("YYYY-MM-DD"),
      bankName: "",
      grWaiverClosureDate: dayjs().format("YYYY-MM-DD"),
      gatePassNo: "",
      gatePassDate: dayjs().format("YYYY-MM-DD"),
      insuranceNo: "",
      billTo: "",
      shipTo: "",
      automailerGroup: "",
      docketNo: "",
      noOfBoxes: "",
      pkgUom: "",
      grossWeight: "",
      gwtUom: "",
      transportName: "",
      transporterDate: dayjs().format("YYYY-MM-DD"),
      packingSlipNo: "",
      bin: "",
      taxType: "",
      remarks: "",
      freeze: false,
    });
    setDeliveryItems([
      {
        key: Date.now(),
        qrbarcode: "",
        pickRequestNo: "",
        prDate: "",
        partNo: "",
        partDescription: "",
        outBoundBin: "",
        shippedQty: "",
        unitRate: "",
        skuValue: "",
        discount: "",
        tax: "",
        gstTax: "",
        amount: "",
        sgst: "",
        cgst: "",
        igst: "",
        totalGst: "",
        billAmount: "",
        remarks: "",
      },
    ]);
    setEditId("");
    setEditBuyerOrderNo("");
    fetchDocId();
    setFieldErrors({});
  };

  const handleClearItems = () => {
    setDeliveryItems([
      {
        key: Date.now(),
        qrbarcode: "",
        pickRequestNo: "",
        prDate: "",
        partNo: "",
        partDescription: "",
        outBoundBin: "",
        shippedQty: "",
        unitRate: "",
        skuValue: "",
        discount: "",
        tax: "",
        gstTax: "",
        amount: "",
        sgst: "",
        cgst: "",
        igst: "",
        totalGst: "",
        billAmount: "",
        remarks: "",
      },
    ]);
  };

  // Save Delivery Challan
  const handleSave = async () => {
    if (isSubmitting) return;
    
    const errors = {};

    // Validate main form fields
    if (!formData.buyerOrderNo && !editId) errors.buyerOrderNo = "Buyer Order No is required";
    if (!formData.containerNO) errors.containerNO = "Container No is required";
    if (!formData.vechileNo) errors.vechileNo = "Vehicle No is required";
    if (!formData.exciseInvoiceNo) errors.exciseInvoiceNo = "Excise Invoice No is required";
    if (!formData.commercialInvoiceNo) errors.commercialInvoiceNo = "Commercial Invoice No is required";
    if (!formData.deliveryTerms) errors.deliveryTerms = "Delivery Terms are required";
    if (!formData.payTerms) errors.payTerms = "Pay Terms are required";
    if (!formData.grWaiverNo) errors.grWaiverNo = "GR Waiver No is required";
    if (!formData.bankName) errors.bankName = "Bank Name is required";
    if (!formData.gatePassNo) errors.gatePassNo = "Gate Pass No is required";
    if (!formData.insuranceNo) errors.insuranceNo = "Insurance No is required";

    // Validate table data
    if (deliveryItems.length === 0) {
      addToast("Please add at least one item", "error");
      return;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const saveData = {
        ...(editId && { id: parseInt(editId) }),
        ...formData,
        docId: deliveryChallanDocId,
        boDate: formatDateForAPI(formData.boDate),
        gatePassDate: formatDateForAPI(formData.gatePassDate),
        grWaiverDate: formatDateForAPI(formData.grWaiverDate),
        grWaiverClosureDate: formatDateForAPI(formData.grWaiverClosureDate),
        pickReqDate: formatDateForAPI(formData.pickReqDate),
        transporterDate: formatDateForAPI(formData.transporterDate),
        branch: loginBranch,
        client: loginClient,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        deliveryChallanDetailsDTO: deliveryItems.map((item) => ({
          ...item,
          shippedQty: parseFloat(item.shippedQty) || 0,
          unitRate: parseFloat(item.unitRate) || 0,
          skuValue: parseFloat(item.skuValue) || 0,
          discount: parseFloat(item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          gstTax: parseFloat(item.gstTax) || 0,
          amount: parseFloat(item.amount) || 0,
          sgst: parseFloat(item.sgst) || 0,
          cgst: parseFloat(item.cgst) || 0,
          igst: parseFloat(item.igst) || 0,
          totalGst: parseFloat(item.totalGst) || 0,
          billAmount: parseFloat(item.billAmount) || 0,
          prDate: formatDateForAPI(item.prDate),
        })),
        createdBy: loginUserName,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: parseInt(orgId),
      };

      // Remove unwanted fields
      delete saveData.docDate;
      delete saveData.items;

      const response = await deliveryChallanAPI.createUpdateDeliveryChallan(saveData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(
          editId 
            ? "Delivery challan updated successfully" 
            : "Delivery challan created successfully", 
          "success"
        );
        onBack();
      } else {
        const errorMessage = response.message || "Delivery challan creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Delivery challan creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Input Components
  const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", disabled = false, icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-3 h-3" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-1.5 text-xs border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
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

  const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, disabled = false, icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-3 h-3" />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-1.5 text-xs border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
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

  const FloatingTextArea = ({ label, name, value, onChange, error, required = false, disabled = false, rows = 2, icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute left-2.5 top-3 text-gray-400">
          <Icon className="w-3 h-3" />
        </div>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-1.5 text-xs border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
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
              {editData ? "Edit Delivery Challan" : "Create Delivery Challan"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage delivery challans
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
          onClick={handleSave}
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
            const sampleFile = "/sample-files/sample_delivery_challan.xlsx";
            const link = document.createElement("a");
            link.href = sampleFile;
            link.download = "sample_delivery_challan.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("Downloading sample file...", "info");
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download Sample
        </button>
        
        <button
          onClick={() => addToast("Printing barcode...", "info")}
          className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors"
        >
          <Barcode className="h-3 w-3" />
          Print Barcode
        </button>
        
        <button
          onClick={() => addToast("Printing QR code...", "info")}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
        >
          <QrCode className="h-3 w-3" />
          Print QR Code
        </button>
        
        <button
          onClick={() => {
            addToast("Printing barcode...", "info");
            addToast("Printing QR code...", "info");
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs transition-colors"
        >
          <Printer className="h-3 w-3" />
          Print Both
        </button>
      </div>

      {/* MAIN FORM CONTENT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "basic"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Basic Information
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
                value={deliveryChallanDocId}
                onChange={handleInputChange}
                disabled
                icon={FileDigit}
              />
              
              <FloatingInput
                label="Document Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled
                icon={Calendar}
              />

              {editId ? (
                <FloatingInput
                  label="Buyer Order No"
                  name="buyerOrderNo"
                  value={editBuyerOrderNo}
                  onChange={handleInputChange}
                  disabled
                  icon={Tag}
                />
              ) : (
                <FloatingSelect
                  label="Buyer Order No *"
                  name="buyerOrderNo"
                  value={formData.buyerOrderNo}
                  onChange={handleSelectChange}
                  options={buyerOrderList.map(order => ({ 
                    value: order.buyerOrderNo, 
                    label: order.buyerOrderNo 
                  }))}
                  error={fieldErrors.buyerOrderNo}
                  required
                  disabled={formData.freeze}
                  icon={Tag}
                />
              )}

              <FloatingInput
                label="Pick Req Date"
                name="pickReqDate"
                value={formData.pickReqDate}
                onChange={handleInputChange}
                type="date"
                disabled
                icon={Calendar}
              />

              <FloatingInput
                label="Invoice No"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
                disabled
                icon={Receipt}
              />

              <FloatingInput
                label="Container No *"
                name="containerNO"
                value={formData.containerNO}
                onChange={handleInputChange}
                error={fieldErrors.containerNO}
                required
                disabled={formData.freeze}
                icon={Container}
              />

              <FloatingInput
                label="Vehicle No *"
                name="vechileNo"
                value={formData.vechileNo}
                onChange={handleInputChange}
                error={fieldErrors.vechileNo}
                required
                disabled={formData.freeze}
                icon={Car}
              />

              <FloatingInput
                label="Excise Invoice No *"
                name="exciseInvoiceNo"
                value={formData.exciseInvoiceNo}
                onChange={handleInputChange}
                error={fieldErrors.exciseInvoiceNo}
                required
                disabled={formData.freeze}
                icon={Receipt}
              />

              <FloatingInput
                label="Commercial Invoice No *"
                name="commercialInvoiceNo"
                value={formData.commercialInvoiceNo}
                onChange={handleInputChange}
                error={fieldErrors.commercialInvoiceNo}
                required
                disabled={formData.freeze}
                icon={Receipt}
              />

              <FloatingInput
                label="BO Date"
                name="boDate"
                value={formData.boDate}
                onChange={handleInputChange}
                type="date"
                disabled
                icon={Calendar}
              />

              <FloatingInput
                label="Buyer"
                name="buyer"
                value={formData.buyer}
                onChange={handleInputChange}
                disabled
                icon={User}
              />

              <FloatingInput
                label="Delivery Terms *"
                name="deliveryTerms"
                value={formData.deliveryTerms}
                onChange={handleInputChange}
                error={fieldErrors.deliveryTerms}
                required
                disabled={formData.freeze}
                icon={ClipboardCheck}
              />

              <FloatingInput
                label="Pay Terms *"
                name="payTerms"
                value={formData.payTerms}
                onChange={handleInputChange}
                error={fieldErrors.payTerms}
                required
                disabled={formData.freeze}
                icon={CreditCard}
              />

              <FloatingInput
                label="GR Waiver No *"
                name="grWaiverNo"
                value={formData.grWaiverNo}
                onChange={handleInputChange}
                error={fieldErrors.grWaiverNo}
                required
                disabled={formData.freeze}
                icon={FileWarning}
              />

              <FloatingInput
                label="GR Waiver Date"
                name="grWaiverDate"
                value={formData.grWaiverDate}
                onChange={handleInputChange}
                type="date"
                disabled
                icon={Calendar}
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION TAB */}
        {activeTab === "additional" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Bank Name *"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                error={fieldErrors.bankName}
                required
                disabled={formData.freeze}
                icon={Building}
              />

              <FloatingInput
                label="GR Waiver Closure Date"
                name="grWaiverClosureDate"
                value={formData.grWaiverClosureDate}
                onChange={handleInputChange}
                type="date"
                disabled={formData.freeze}
                icon={Calendar}
              />

              <FloatingInput
                label="Gate Pass No *"
                name="gatePassNo"
                value={formData.gatePassNo}
                onChange={handleInputChange}
                error={fieldErrors.gatePassNo}
                required
                disabled={formData.freeze}
                icon={Shield}
              />

              <FloatingInput
                label="Gate Pass Date"
                name="gatePassDate"
                value={formData.gatePassDate}
                onChange={handleInputChange}
                type="date"
                disabled={formData.freeze}
                icon={Calendar}
              />

              <FloatingInput
                label="Insurance No *"
                name="insuranceNo"
                value={formData.insuranceNo}
                onChange={handleInputChange}
                error={fieldErrors.insuranceNo}
                required
                disabled={formData.freeze}
                icon={Shield}
              />

              <FloatingTextArea
                label="Bill To"
                name="billTo"
                value={formData.billTo}
                onChange={handleInputChange}
                rows={2}
                disabled
                icon={MapPin}
              />

              <FloatingTextArea
                label="Ship To"
                name="shipTo"
                value={formData.shipTo}
                onChange={handleInputChange}
                rows={2}
                disabled
                icon={MapPin}
              />

              <FloatingInput
                label="Automailer Group"
                name="automailerGroup"
                value={formData.automailerGroup}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Mail}
              />

              <FloatingInput
                label="Docket No"
                name="docketNo"
                value={formData.docketNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={FileText}
              />

              <FloatingInput
                label="No Of Boxes"
                name="noOfBoxes"
                value={formData.noOfBoxes}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Box}
              />

              <FloatingInput
                label="PKG UOM"
                name="pkgUom"
                value={formData.pkgUom}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Package}
              />

              <FloatingInput
                label="Gross Weight"
                name="grossWeight"
                value={formData.grossWeight}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Scale}
              />

              <FloatingInput
                label="GWT UOM"
                name="gwtUom"
                value={formData.gwtUom}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Scale}
              />

              <FloatingInput
                label="Transport Name"
                name="transportName"
                value={formData.transportName}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Truck}
              />

              <FloatingInput
                label="Transport Date"
                name="transporterDate"
                value={formData.transporterDate}
                onChange={handleInputChange}
                type="date"
                disabled={formData.freeze}
                icon={Calendar}
              />

              <FloatingInput
                label="Packing Slip No"
                name="packingSlipNo"
                value={formData.packingSlipNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Package}
              />

              <FloatingInput
                label="Bin"
                name="bin"
                value={formData.bin}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Package}
              />

              <FloatingInput
                label="Tax Type"
                name="taxType"
                value={formData.taxType}
                onChange={handleInputChange}
                disabled={formData.freeze}
                icon={Percent}
              />

              <FloatingTextArea
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={2}
                disabled={formData.freeze}
                icon={FileText}
              />

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-700 dark:text-gray-300">
                  Freeze
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={formData.freeze}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freeze: e.target.checked,
                      }))
                    }
                    className="sr-only"
                    id="freeze-toggle"
                  />
                  <label
                    htmlFor="freeze-toggle"
                    className={`block h-6 w-10 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      formData.freeze
                        ? 'bg-red-500 dark:bg-red-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white dark:bg-gray-300 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                        formData.freeze ? 'transform translate-x-4' : ''
                      }`}
                    />
                  </label>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.freeze ? "Frozen" : "Editable"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DELIVERY ITEMS TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Items</h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {deliveryItems.length} items
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              disabled={formData.freeze}
            >
              <Plus className="h-3 w-3" />
              Add Item
            </button>
            <button
              onClick={handleClearItems}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              disabled={formData.freeze}
            >
              <Trash2 className="h-3 w-3" />
              Clear Items
            </button>
          </div>
        </div>

        {/* Delivery Items Table */}
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
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  QR/Barcode
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  Pick Request No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  PR Date
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  Part No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                  Part Description
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  OutBound Bin
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Shipped Qty
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Unit Rate
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  SKU Value
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Discount
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Tax
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  GST Tax
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Amount
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  SGST
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  CGST
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  IGST
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Total GST
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Bill Amount
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deliveryItems.length === 0 ? (
                <tr>
                  <td colSpan="21" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items added. Click "Add Item" to start.
                  </td>
                </tr>
              ) : (
                deliveryItems.map((item, index) => (
                  <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* Action */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDeleteItem(item.key)}
                        className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                        title="Delete"
                        disabled={formData.freeze}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>

                    {/* S.No */}
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">
                      {index + 1}
                    </td>

                    {/* QR/Barcode */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.qrbarcode}
                        onChange={(e) => handleItemChange(item.key, "qrbarcode", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Pick Request No */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.pickRequestNo}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* PR Date */}
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={item.prDate || ""}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* Part No */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.partNo}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* Part Description */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.partDescription}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* OutBound Bin */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.outBoundBin}
                        onChange={(e) => handleItemChange(item.key, "outBoundBin", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Shipped Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.shippedQty}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* Unit Rate */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.unitRate}
                        onChange={(e) => handleItemChange(item.key, "unitRate", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* SKU Value */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.skuValue}
                        onChange={(e) => handleItemChange(item.key, "skuValue", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Discount */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(item.key, "discount", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Tax */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(item.key, "tax", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* GST Tax */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.gstTax}
                        onChange={(e) => handleItemChange(item.key, "gstTax", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(item.key, "amount", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* SGST */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.sgst}
                        onChange={(e) => handleItemChange(item.key, "sgst", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* CGST */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.cgst}
                        onChange={(e) => handleItemChange(item.key, "cgst", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* IGST */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.igst}
                        onChange={(e) => handleItemChange(item.key, "igst", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Total GST */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.totalGst}
                        onChange={(e) => handleItemChange(item.key, "totalGst", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Bill Amount */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.billAmount}
                        onChange={(e) => handleItemChange(item.key, "billAmount", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        disabled={formData.freeze}
                      />
                    </td>

                    {/* Remarks */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(item.key, "remarks", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={formData.freeze}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Delivery Challan Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload="/sample-files/sample_delivery_challan.xlsx"
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/deliverychallan/upload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Delivery Challan"
      />
    </div>
  );
};

export default DeliveryChallanForm;