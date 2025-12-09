import React, { useEffect, useState, useRef } from "react";
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
  Edit,
  FileText,
} from "lucide-react";

import { gatePassInAPI } from "../../../api/gatepassAPI";
import { warehouseAPI } from "../../../api/warehouseAPI";

import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import { useToast } from "../../Toast/ToastContext";
import sampleFile from "../../../assets/sample-files/Sample_Grn_Upload.xls";
import { FloatingInput,FloatingSelect } from "../../../utils/InputFields";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const GatePassInForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Use globalParams similar to CarrierForm with proper fallbacks
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

  const [supplierList, setSupplierList] = useState([]);
  const [modeOfShipmentList, setModeOfShipmentList] = useState([]);
  const [carrierList, setCarrierList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    docId: "",
    docDate: formatDateForInput(new Date()),
    entrySlNo: "",
    date: formatDateForInput(new Date()),
    supplierShortName: "",
    supplier: "",
    modeOfShipment: "",
    carrier: "",
    vehicleType: "",
    contact: "",
    driverName: "",
    securityName: "",
    vehicleNo: "",
    goodsDesc: "",
    freeze: false,
    remarks: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [lrTableData, setLrTableData] = useState([]);
  const [lrTableErrors, setLrTableErrors] = useState([]);

  // Initialize data
  useEffect(() => {
    getNewGatePassDocId();
    getAllSuppliers();
    getAllModesOfShipment();
    getAllPartNo();

    if (editData) {
      getGatePassById(editData);
    }
  }, [editData]);

  // API Functions using separate API service
  const getNewGatePassDocId = async () => {
    try {
      if (!loginBranchCode || !loginClient || !loginFinYear || !orgId) {
        console.error("Missing required parameters for API call");
        return;
      }

      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await gatePassInAPI.getNewDocId(params);
      
      if (response && response.paramObjectsMap) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.GatePassInDocId || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching Gate Pass document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getAllSuppliers = async () => {
    try {
      if (!loginBranchCode || !loginClient || !orgId) {
        console.error("Missing required parameters for supplier API");
        return;
      }

      const response = await warehouseAPI.getSuppliers({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      });

      if (response?.status) {
        const sortedSupplier = (response.paramObjectsMap.supplierVO || []).sort((a, b) => b.id - a.id);
        setSupplierList(sortedSupplier);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      addToast("Failed to fetch suppliers", "error");
    }
  };

  const getAllModesOfShipment = async () => {
    try {
      if (!orgId) {
        console.error("Missing orgId for modes of shipment API");
        return;
      }

      const response = await gatePassInAPI.getModesOfShipment(orgId);
      
      const defaultModes = [
        { id: 1, shipmentMode: "AIR" },
        { id: 2, shipmentMode: "SEA" },
        { id: 3, shipmentMode: "ROAD" },
      ];
      
      const apiModes = response?.paramObjectsMap?.modOfShipments || [];
      const mergedModes = [...defaultModes];
      
      apiModes.forEach((apiMode) => {
        if (!mergedModes.some(defaultMode => 
          defaultMode.shipmentMode.toUpperCase() === apiMode.shipmentMode.toUpperCase()
        )) {
          mergedModes.push(apiMode);
        }
      });
      
      setModeOfShipmentList(mergedModes);
    } catch (error) {
      console.error("Error fetching modes of shipment:", error);
      setModeOfShipmentList([
        { id: 1, shipmentMode: "AIR" },
        { id: 2, shipmentMode: "SEA" },
        { id: 3, shipmentMode: "ROAD" },
      ]);
    }
  };

  const getAllCarriers = async (selectedModeOfShipment) => {
    try {
      if (!loginBranchCode || !loginClient || !orgId || !selectedModeOfShipment) {
        console.error("Missing required parameters for carrier API");
        return;
      }

      const response = await warehouseAPI.getCarriersByMode({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId,
        shipmentMode: selectedModeOfShipment
      });

      setCarrierList(response?.paramObjectsMap?.CarrierVO || []);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  const getAllPartNo = async () => {
    try {
      if (!loginBranchCode || !loginClient || !orgId) {
        console.error("Missing required parameters for part number API");
        return;
      }

      const response = await warehouseAPI.getMaterials({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      });

      if (response?.paramObjectsMap?.materialVO) {
        const partNos = response.paramObjectsMap.materialVO
          .filter(item => item.partno)
          .map(item => ({
            id: item.id,
            partNo: item.partno,
            description: item.partDesc,
            sku: item.sku,
            unit: item.purchaseUnit,
            barcode: item.barcode,
            ...item,
          }));
        setPartNoList(partNos);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      setPartNoList([]);
    }
  };

  const getGatePassById = async (item) => {
    try {
      const response = await gatePassInAPI.getGatePassById(item.id);
      
      if (response?.status === true) {
        const particularGatePass = response.paramObjectsMap.GatePassIn;
        
        const formattedData = {
          docId: particularGatePass.docId,
          docDate: formatDateForInput(particularGatePass.docDate || particularGatePass.docdate),
          entrySlNo: particularGatePass.entryNo,
          date: formatDateForInput(particularGatePass.entryDate),
          supplierShortName: particularGatePass.supplierShortName,
          supplier: particularGatePass.supplier,
          modeOfShipment: particularGatePass.modeOfShipment,
          carrier: particularGatePass.carrier,
          vehicleType: particularGatePass.vehicleType,
          contact: particularGatePass.contact,
          driverName: particularGatePass.driverName,
          securityName: particularGatePass.securityName,
          vehicleNo: particularGatePass.vehicleNo,
          goodsDesc: particularGatePass.goodsDescription,
          freeze: particularGatePass.freeze,
          remarks: particularGatePass.remarks,
        };

        setFormData(formattedData);
        getAllCarriers(particularGatePass.modeOfShipment);

        setLrTableData(
          particularGatePass.gatePassDetailsVO.map((detail, index) => ({
            id: detail.id || index + 1,
            qrCode: detail.qrCode || "",
            lr_Hawb_Hbl_No: detail.irNoHaw || "",
            invNo: detail.invoiceNo || "",
            invDate: formatDateForInput(detail.invoiceDate),
            partNo: detail.partNo || "",
            partDesc: detail.partDescription || "",
            sku: detail.sku || "",
            invQty: detail.invQty?.toString() || "0",
            recQty: detail.recQty?.toString() || "0",
            shortQty: detail.shortQty?.toString() || "0",
            damageQty: detail.damageQty?.toString() || "0",
            grnQty: detail.grnQty?.toString() || "0",
            batch_PalletNo: detail.batchNo || "",
            batchDate: formatDateForInput(detail.batchDate),
            expDate: formatDateForInput(detail.expDate),
            remarks: detail.remarks || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Error fetching gate pass data", "error");
    }
  };

  const convertToAPIDateFormat = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
        const parts = dateString.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    const updatedValue = type === 'date' ? value : value.toUpperCase();

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "supplierShortName") {
      const selectedName = supplierList.find(
        supplier => supplier.supplierShortName === updatedValue
      );
      if (selectedName) {
        setFormData({
          ...formData,
          supplierShortName: selectedName.supplierShortName,
          supplier: selectedName.supplier,
        });
      }
    } else if (name === "modeOfShipment") {
      setFormData({
        ...formData,
        [name]: updatedValue,
      });
      getAllCarriers(updatedValue);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: updatedValue,
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEntryNoChange = async (value) => {
    if (!value || value.length < 3) return;
    try {
      setLoadingEntry(true);
      
      const entryParams = {
        branchCode: loginBranchCode,
        client: loginClient,
        entryNo: value,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const entryResponse = await gatePassInAPI.getEntryNoDetails(entryParams);

      if (entryResponse?.status && entryResponse.paramObjectsMap) {
        const entryDetails = entryResponse.paramObjectsMap.entryNoDetails;
        let entryData = Array.isArray(entryDetails) ? entryDetails[0] : entryDetails;

        if (entryData) {
          setFormData(prev => ({
            ...prev,
            supplierShortName: entryData.supplierShortName || "",
            supplier: entryData.supplier || "",
            modeOfShipment: entryData.modeOfShipment || "",
            carrier: entryData.carrierShortName || entryData.carrier || "",
            vehicleType: entryData.vehicleType || "",
            contact: entryData.contact || "",
            driverName: entryData.driverName || "",
            securityName: entryData.securityName || "",
            vehicleNo: entryData.vehicleNo || "",
            goodsDesc: entryData.goodsDescription || "",
          }));

          if (entryData.modeOfShipment) {
            getAllCarriers(entryData.modeOfShipment);
          }

          const fillResponse = await gatePassInAPI.getEntryNoFillDetails(entryParams);

          if (fillResponse?.status && fillResponse.paramObjectsMap) {
            const fillDetails = fillResponse.paramObjectsMap.entryNoFillDetails;
            let fillData = Array.isArray(fillDetails) ? fillDetails : [fillDetails];

            const tableData = fillData.map((detail, index) => ({
              id: index + 1,
              qrCode: detail.qrCode || "",
              lr_Hawb_Hbl_No: detail.irNoHaw || "",
              invNo: detail.invoiceNo || "",
              invDate: formatDateForInput(detail.invoiceDate),
              partNo: detail.partNo || "",
              partDesc: detail.partDesc || detail.partDescription || "",
              sku: detail.sku || "",
              invQty: detail.invQty?.toString() || "0",
              recQty: detail.recQty?.toString() || "0",
              shortQty: detail.shortQty?.toString() || "0",
              damageQty: detail.damageQty?.toString() || "0",
              grnQty: detail.grnQty?.toString() || "0",
              batch_PalletNo: detail.batchNo || "",
              batchDate: formatDateForInput(detail.batchDate),
              expDate: formatDateForInput(detail.expDate),
              remarks: detail.remarks || "",
            }));

            setLrTableData(tableData);
            addToast("Entry details loaded successfully", "success");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
      addToast("Failed to fetch entry details", "error");
    } finally {
      setLoadingEntry(false);
    }
  };

  // Table Handlers
  const handleTableChange = (id, field, value) => {
    setLrTableData(prevData =>
      prevData.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          if (["invQty", "recQty", "shortQty", "damageQty"].includes(field)) {
            const recQty = parseFloat(updatedRow.recQty) || 0;
            const shortQty = parseFloat(updatedRow.shortQty) || 0;
            const damageQty = parseFloat(updatedRow.damageQty) || 0;
            const grnQty = Math.max(0, recQty - (shortQty + damageQty));
            updatedRow.grnQty = grnQty.toString();
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  const handlePartNoChange = (row, value) => {
    const selectedPartNo = partNoList.find(p => p.partNo === value);
    setLrTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPartNo ? selectedPartNo.description : "",
              sku: selectedPartNo ? selectedPartNo.sku : "",
            }
          : r
      )
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      qrCode: "",
      lr_Hawb_Hbl_No: "",
      invNo: "",
      invDate: "",
      partNo: "",
      partDesc: "",
      sku: "",
      invQty: "0",
      recQty: "0",
      shortQty: "0",
      damageQty: "0",
      grnQty: "0",
      batch_PalletNo: "",
      batchDate: "",
      expDate: "",
      remarks: "",
    };
    setLrTableData([...lrTableData, newRow]);
  };

  const handleDeleteRow = (id) => {
    setLrTableData(lrTableData.filter(row => row.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      entrySlNo: "",
      date: formatDateForInput(new Date()),
      supplierShortName: "",
      supplier: "",
      modeOfShipment: "",
      carrier: "",
      vehicleType: "",
      contact: "",
      driverName: "",
      securityName: "",
      vehicleNo: "",
      goodsDesc: "",
      freeze: false,
      remarks: "",
    });
    setFieldErrors({});
    setLrTableData([]);
    setLrTableErrors([]);
    getNewGatePassDocId();
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.entrySlNo) errors.entrySlNo = "Entry No is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.supplierShortName) errors.supplierShortName = "Supplier Short Name is required";
    if (!formData.modeOfShipment) errors.modeOfShipment = "Mode of Shipment is required";
    if (!formData.carrier) errors.carrier = "Carrier is required";

    let lrTableDataValid = true;
    if (!lrTableData || lrTableData.length === 0) {
      lrTableDataValid = false;
      setLrTableErrors([{ general: "Lr Table Data is required" }]);
    } else {
      const newTableErrors = lrTableData.map(row => {
        const rowErrors = {};
        if (!row.lr_Hawb_Hbl_No) rowErrors.lr_Hawb_Hbl_No = "Lr_Hawb_Hbl_No is required";
        if (!row.invNo) rowErrors.invNo = "Inv No is required";
        if (!row.partNo) rowErrors.partNo = "Part No is required";
        if (!row.invQty) rowErrors.invQty = "Inv QTY is required";
        if (!row.recQty) rowErrors.recQty = "Rec QTY is required";
        return rowErrors;
      });
      setLrTableErrors(newTableErrors);
      lrTableDataValid = !newTableErrors.some(error => Object.keys(error).length > 0);
    }

    setFieldErrors(errors);

    if (!lrTableDataValid || Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const lrVo = lrTableData.map(row => ({
        ...(editData && { id: row.id }),
        qrCode: row.qrCode,
        irNoHaw: row.lr_Hawb_Hbl_No,
        invoiceNo: row.invNo,
        invoiceDate: row.invDate ? convertToAPIDateFormat(row.invDate) : null,
        partNo: row.partNo,
        partDescription: row.partDesc,
        sku: row.sku,
        invQty: parseFloat(row?.invQty || 0),
        recQty: parseFloat(row?.recQty || 0),
        shortQty: parseFloat(row?.shortQty || 0),
        damageQty: parseFloat(row?.damageQty || 0),
        grnQty: parseFloat(row?.grnQty || 0),
        batchNo: row.batch_PalletNo,
        batchDate: row.batchDate ? convertToAPIDateFormat(row.batchDate) : null,
        expDate: row.expDate ? convertToAPIDateFormat(row.expDate) : null,
        remarks: row.remarks,
      }));

      const saveFormData = {
        ...(editData && { id: editData.id }),
        entryNo: formData.entrySlNo,
        entryDate: formData.date ? convertToAPIDateFormat(formData.date) : null,
        docdate: formData.docDate ? convertToAPIDateFormat(formData.docDate) : null,
        supplierShortName: formData.supplierShortName,
        supplier: formData.supplier,
        modeOfShipment: formData.modeOfShipment,
        carrier: formData.carrier,
        vehicleType: formData.vehicleType,
        contact: formData.contact,
        driverName: formData.driverName,
        securityName: formData.securityName,
        vehicleNo: formData.vehicleNo,
        goodsDescription: formData.goodsDesc,
        remarks: formData.remarks,
        orgId: orgId,
        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        gatePassInDetailsDTO: lrVo,
      };

      const response = await gatePassInAPI.saveGatePass(saveFormData);

      if (response.status === true) {
        addToast(editData ? "Gate Pass Updated Successfully" : "Gate Pass created successfully", "success");
        onSaveSuccess && onSaveSuccess();
        handleClear();
        onBack();
      } else {
        addToast(response.paramObjectsMap.errorMessage || "Gate Pass creation failed", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Gate Pass creation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER - Matching Enquiry Form Design */}
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
              {editData ? "Edit Gate Pass In" : "Create Gate Pass In"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage Gate Pass In entries
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

      {/* ACTION BUTTONS - Matching Enquiry Form Design */}
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
            link.download = "sample_GatePass.xls";
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
        {/* TABS NAVIGATION - Compact Design */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
          {['Basic Information', 'Additional Information'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index === 0 ? "basic" : "additional")}
              className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === (index === 0 ? "basic" : "additional")
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
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
                label="Document Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              <FloatingInput
                label="Entry/SI No *"
                name="entrySlNo"
                value={formData.entrySlNo}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData({
                    ...formData,
                    entrySlNo: value,
                  });
                }}
                onBlur={(e) => handleEntryNoChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleEntryNoChange(e.target.value);
                  }
                }}
                disabled={formData.freeze}
                error={fieldErrors.entrySlNo}
                required
              />

              <FloatingInput
                label="Date *"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
                error={fieldErrors.date}
                required
              />

              <FloatingSelect
                label="Supplier Short Name *"
                name="supplierShortName"
                value={formData.supplierShortName}
                onChange={handleSelectChange}
                options={supplierList.map(s => ({ value: s.supplierShortName, label: s.supplierShortName }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.supplierShortName}
                required
              />

              <FloatingInput
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Mode Of Shipment *"
                name="modeOfShipment"
                value={formData.modeOfShipment}
                onChange={(name, value) => {
                  handleSelectChange(name, value);
                  getAllCarriers(value);
                }}
                options={modeOfShipmentList.map(m => ({ value: m.shipmentMode, label: m.shipmentMode }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.modeOfShipment}
                required
              />

              <FloatingSelect
                label="Carrier *"
                name="carrier"
                value={formData.carrier}
                onChange={handleSelectChange}
                options={carrierList.map(c => ({ value: c.carrier, label: c.carrier }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.carrier}
                required
              />

              <FloatingInput
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={editData || formData.freeze}
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION TAB */}
        {activeTab === "additional" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingSelect
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleSelectChange}
                options={[
                  { value: "45 FEET", label: "45 FEET" },
                  { value: "CANTER", label: "CANTER" },
                  { value: "CONTAINER", label: "CONTAINER" },
                  { value: "TEMPO", label: "TEMPO" },
                ]}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Vehicle No"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Contact No"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                type="tel"
                maxLength={10}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Driver Name"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Security Person"
                name="securityName"
                value={formData.securityName}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Goods Desc"
                name="goodsDesc"
                value={formData.goodsDesc}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />
            </div>
          </div>
        )}

        {/* TABLE SECTION - Matching Enquiry Form Design */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Gate Pass Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {lrTableData.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              {!editData && (
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Row
                </button>
              )}
              <button
                onClick={() => setLrTableData([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

          {/* Beautiful Table Design */}
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
                    QR Code
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    LR No/HAWB No/HBL No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Inv No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Inv Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px]">
                    Part No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    Part Desc
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                    Inv QTY *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                    Rec QTY *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                    Short QTY
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                    Damage QTY
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                    GRN QTY
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                    Pallet No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Batch Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Exp Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lrTableData.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                      No items added
                    </td>
                  </tr>
                ) : (
                  lrTableData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.qrCode}
                          onChange={(e) => handleTableChange(row.id, "qrCode", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.lr_Hawb_Hbl_No}
                          onChange={(e) => handleTableChange(row.id, "lr_Hawb_Hbl_No", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.invNo}
                          onChange={(e) => handleTableChange(row.id, "invNo", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.invDate || ''}
                          onChange={(e) => handleTableChange(row.id, "invDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.partNo}
                          onChange={(e) => handlePartNoChange(row, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Part No</option>
                          {partNoList.map((part) => (
                            <option key={part.id} value={part.partNo}>
                              {part.partNo}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.partDesc}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.sku}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.invQty}
                          onChange={(e) => handleTableChange(row.id, "invQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.recQty}
                          onChange={(e) => handleTableChange(row.id, "recQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.shortQty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.damageQty || ""}
                          onChange={(e) => handleTableChange(row.id, "damageQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.grnQty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.batch_PalletNo}
                          onChange={(e) => handleTableChange(row.id, "batch_PalletNo", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.batchDate || ''}
                          onChange={(e) => handleTableChange(row.id, "batchDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.expDate || ''}
                          onChange={(e) => handleTableChange(row.id, "expDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => handleTableChange(row.id, "remarks", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Gate Pass In Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload={sampleFile}
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/grn/ExcelUploadForGrn?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}`}
        screen="GatePassIn"
      />
    </div>
  );
};

export default GatePassInForm;