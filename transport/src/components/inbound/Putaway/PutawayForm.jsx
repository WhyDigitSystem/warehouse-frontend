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
  Barcode,
  Printer,
} from "lucide-react";

import { putawayAPI } from "../../../api/putawayAPI";
import { warehouseAPI } from "../../../api/warehouseAPI";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import { useToast } from "../../Toast/ToastContext";
import sampleFile from "../../../assets/sample-files/sample_Putaway.xls";
import { warehouseLocationAPI } from "../../../api/warehouseLocationAPI";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";



// Barcode Label Component
const BarcodeLabel = ({ data, onPrint }) => {
  const generateBarcodeText = (item) => {
    return [
      `Part: ${item.partNo || 'N/A'}`,
      `Batch: ${item.batchNo || 'N/A'}`,
      `Qty: ${item.putawayQty || '0'}`,
      `Loc: ${item.location || 'N/A'}`,
      `Date: ${new Date().toLocaleDateString()}`
    ].join(' | ');
  };

  return (
    <div className="barcode-label p-4 border border-gray-300 bg-white rounded-lg shadow-sm max-w-xs mx-auto">
      <div className="text-center">
        {/* Company/Header Info */}
        <div className="mb-2">
          <div className="font-bold text-sm">PUTAWAY LABEL</div>
          <div className="text-xs text-gray-600">{data.warehouse || 'Warehouse'}</div>
        </div>
        
        {/* Barcode Data */}
        <div className="my-3 p-2 border border-dashed border-gray-400 rounded">
          <div className="text-xs font-mono text-center break-all">
            {generateBarcodeText(data)}
          </div>
        </div>
        
        {/* Human Readable Info */}
        <div className="text-left text-xs space-y-1">
          <div><strong>Part No:</strong> {data.partNo || 'N/A'}</div>
          <div><strong>Description:</strong> {data.partDesc || 'N/A'}</div>
          <div><strong>Batch No:</strong> {data.batchNo || 'N/A'}</div>
          <div><strong>Qty:</strong> {data.putawayQty || '0'}</div>
          <div><strong>Location:</strong> {data.location || 'N/A'}</div>
          {data.batchDate && <div><strong>Batch Date:</strong> {data.batchDate}</div>}
          {data.expDate && <div><strong>Exp Date:</strong> {data.expDate}</div>}
        </div>
        
        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-300 text-xs text-gray-500">
          Generated on: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Print Button */}
      <button
        onClick={() => onPrint(data)}
        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
      >
        <Printer className="h-3 w-3" />
        Print Label
      </button>
    </div>
  );
};

// Barcode Modal Component
const BarcodeModal = ({ isOpen, onClose, selectedItems, onPrintAll }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generate Barcode Labels
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.length} item(s) selected for labeling
            </span>
            {selectedItems.length > 0 && (
              <button
                onClick={onPrintAll}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print All Labels
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedItems.map((item, index) => (
              <BarcodeLabel
                key={`${item.id}-${index}`}
                data={item}
                onPrint={onPrintAll}
              />
            ))}
          </div>
          
          {selectedItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Barcode className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No items selected for barcode generation</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const PutawayForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedItemsForBarcode, setSelectedItemsForBarcode] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

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

  const [grnList, setGrnList] = useState([]);
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);

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
    docId: "",
    docDate: formatDateForInput(new Date()),
    grnNo: "",
    grnDate: "",
    entryNo: "",
    entryDate: "",
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
    lotNo: "",
    totalGrnQty: "",
    binClass: "Fixed",
    binPick: "Empty",
    binType: "",
    core: "Multi",
    status: "Edit",
    freeze: false,
    remarks: "",
    createdBy: loginUserName,
    createdOn: formatDateForInput(new Date()),
    totalPutawayQty: 0,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [putawayItems, setPutawayItems] = useState([]);
  const [originalStatus, setOriginalStatus] = useState("Edit");

  // Barcode Functions
  const handleRowSelection = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAllRows = () => {
    if (selectedRows.size === putawayItems.length) {
      setSelectedRows(new Set());
    } else {
      const allRowIds = new Set(putawayItems.map(row => row.id));
      setSelectedRows(allRowIds);
    }
  };

  const generateBarcodeLabels = () => {
    const selectedItems = putawayItems.filter(row => selectedRows.has(row.id));
    
    if (selectedItems.length === 0) {
      addToast("Please select items to generate barcode labels", "warning");
      return;
    }

    setSelectedItemsForBarcode(selectedItems);
    setBarcodeModalOpen(true);
  };

  const handlePrintLabel = (item) => {
    // Create a printable version of the label
    const printWindow = window.open('', '_blank');
    const labelContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode Label - ${item.partNo || 'Putaway'}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px;
            -webkit-print-color-adjust: exact;
          }
          .barcode-label { 
            width: 3in; 
            height: 2in; 
            border: 1px solid #000;
            padding: 5px;
            font-size: 10px;
          }
          .label-header { 
            text-align: center; 
            font-weight: bold; 
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            margin-bottom: 3px;
          }
          .barcode-data {
            background: #f5f5f5;
            padding: 3px;
            margin: 3px 0;
            font-family: monospace;
            font-size: 8px;
            word-break: break-all;
          }
          .label-info { margin: 2px 0; }
          .label-footer { 
            border-top: 1px solid #000;
            margin-top: 3px;
            padding-top: 2px;
            font-size: 7px;
          }
          @media print {
            body { margin: 0; }
            .barcode-label { 
              border: 1px solid #000 !important;
              margin: 2px;
            }
          }
        </style>
      </head>
      <body>
        <div class="barcode-label">
          <div class="label-header">PUTAWAY LABEL</div>
          <div style="text-align: center; font-size: 8px;">${loginWarehouse}</div>
          <div class="barcode-data">
            Part:${item.partNo}|Batch:${item.batchNo}|Qty:${item.putawayQty}|Loc:${item.location}
          </div>
          <div class="label-info"><strong>Part:</strong> ${item.partNo || 'N/A'}</div>
          <div class="label-info"><strong>Desc:</strong> ${item.partDesc || 'N/A'}</div>
          <div class="label-info"><strong>Batch:</strong> ${item.batchNo || 'N/A'}</div>
          <div class="label-info"><strong>Qty:</strong> ${item.putawayQty || '0'}</div>
          <div class="label-info"><strong>Location:</strong> ${item.location || 'N/A'}</div>
          <div class="label-footer">
            ${new Date().toLocaleDateString()} | ${loginUserName}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(labelContent);
    printWindow.document.close();
  };

  const handlePrintAllLabels = () => {
    selectedItemsForBarcode.forEach(item => {
      setTimeout(() => handlePrintLabel(item), 100);
    });
    addToast(`Printing ${selectedItemsForBarcode.length} barcode labels`, "info");
  };

  // Initialize data
  useEffect(() => {
    getPutAwayDocId();
    getGrnForPutaway();
    getAllLocationTypes();
    getBinLocations();
    getAllPartNo();

    if (editData) {
      getPutAwayById(editData);
    }
  }, [editData]);

  // ... (rest of your existing API functions remain the same)
  const getPutAwayDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await putawayAPI.getPutAwayDocId(params);
      
      if (response && response.paramObjectsMap) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.PutAwayDocId || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching Putaway document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getGrnForPutaway = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await putawayAPI.getGrnForPutaway(params);

      if (response && response.paramObjectsMap) {
        setGrnList(response.paramObjectsMap.grnVO || []);
      }
    } catch (error) {
      console.error("Error fetching GRN data:", error);
      addToast("Failed to fetch GRN data", "error");
    }
  };

const getAllLocationTypes = async () => {
  try {
    const response = await warehouseLocationAPI.getAllLocationTypes(orgId);
    
    if (response?.paramObjectsMap?.binTypeVO) {
      const locationTypes = response.paramObjectsMap.binTypeVO.map(type => ({
        ltype: type.binType,
        core: type.core
      }));
      setLocationTypeList(locationTypes);
    }
  } catch (error) {
    console.error("Error fetching location types:", error);
    addToast("Failed to fetch location types", "error");
  }
};

const getBinLocations = async () => {
  try {
    const response = await warehouseLocationAPI.getAllWarehouseLocations(
      loginBranch, 
      orgId, 
      loginWarehouse
    );

    if (response?.paramObjectsMap?.warehouseLocationVO) {
      const transformedLocations = response.paramObjectsMap.warehouseLocationVO.map((location, index) => ({
        id: index + 1,
        name: location.binLocation || `Location ${index + 1}`,
        bin: location.binLocation,
        binType: location.binType,
        core: location.core,
        cellType: location.cellType,
        binClass: location.binClass,
      }));
      setLocationList(transformedLocations);
    }
  } catch (error) {
    console.error("Error fetching bin locations:", error);
    addToast("Failed to fetch bin locations", "error");
  }
};

  const getAllPartNo = async () => {
    try {
      const response = await warehouseAPI.getMaterials({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      });

      let partNos = [];
      if (Array.isArray(response)) {
        partNos = response
          .filter(item => item && item.partno && item.partno.trim() !== "")
          .map(item => ({
            id: item.id,
            partNo: item.partno,
            description: item.partDesc,
            sku: item.sku || item.partno,
            unit: item.purchaseUnit,
            barcode: item.barcode,
            ...item,
          }));
      } else if (response?.paramObjectsMap?.materialVO) {
        partNos = response.paramObjectsMap.materialVO
          .filter(item => item && item.partno && item.partno.trim() !== "")
          .map(item => ({
            id: item.id,
            partNo: item.partno,
            description: item.partDesc,
            sku: item.sku || item.partno,
            unit: item.purchaseUnit,
            barcode: item.barcode,
            ...item,
          }));
      }

      setPartNoList(partNos);
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      addToast("Failed to fetch part numbers", "error");
    }
  };

  const getPutAwayById = async (item) => {
    try {
      const response = await putawayAPI.getPutAwayById(item.id);
      
      if (response?.status === true) {
        const particularPutaway = response.paramObjectsMap.putAwayVO;
        setOriginalStatus(particularPutaway.status);

        const formattedData = {
          docId: particularPutaway.docId,
          docDate: formatDateForInput(particularPutaway.docDate),
          grnNo: particularPutaway.grnNo,
          grnDate: formatDateForInput(particularPutaway.grnDate),
          entryNo: particularPutaway.entryNo,
          entryDate: formatDateForInput(particularPutaway.entryDate),
          supplierShortName: particularPutaway.supplierShortName,
          supplier: particularPutaway.supplier,
          modeOfShipment: particularPutaway.modeOfShipment,
          carrier: particularPutaway.carrier,
          vehicleType: particularPutaway.vehicleType,
          contact: particularPutaway.contact,
          driverName: particularPutaway.driverName,
          securityName: particularPutaway.securityName,
          vehicleNo: particularPutaway.vehicleNo,
          goodsDesc: particularPutaway.goodsDescripition,
          lotNo: particularPutaway.lotNo,
          totalGrnQty: particularPutaway.totalGrnQty,
          binClass: particularPutaway.binClass,
          binPick: particularPutaway.binPick,
          binType: particularPutaway.binType,
          core: particularPutaway.core,
          status: particularPutaway.status,
          freeze: particularPutaway.freeze,
          remarks: particularPutaway.remarks,
          totalPutawayQty: particularPutaway.totalPutawayQty,
        };

        setFormData(formattedData);

        // Set putaway items
        const putawayItemsData = particularPutaway.putAwayDetailsVO.map((pa) => ({
          id: Date.now() + Math.random(),
          partNo: pa.partNo,
          partDesc: pa.partDesc,
          sku: pa.sku,
          batchNo: pa.batch,
          batchDate: formatDateForInput(pa.batchDate),
          expDate: formatDateForInput(pa.expDate),
          grnQty: pa.grnQty?.toString() || "",
          putawayQty: pa.putAwayQty?.toString() || "",
          location: pa.bin,
          remarks: pa.remarks || "",
        }));

        setPutawayItems(putawayItemsData);
      }
    } catch (error) {
      console.error("Error fetching Putaway data:", error);
      addToast("Error fetching Putaway data", "error");
    }
  };

  const getPutawayGridDetails = async () => {
    const errors = {};
    if (!formData.grnNo) errors.grnNo = "GRN No is required";
    if (!formData.binType) errors.binType = "Bin Type is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const params = {
        binClass: formData.binClass,
        binPick: formData.binPick,
        binType: formData.binType,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo: formData.grnNo,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await putawayAPI.getPutawayGridDetails(params);

      if (response?.paramObjectsMap?.gridDetails) {
        const gridDetails = response.paramObjectsMap.gridDetails;
        
        const putawayItemsData = gridDetails.map((row) => ({
          id: Date.now() + Math.random(),
          partNo: row.partNo || "",
          partDesc: row.partDesc || "",
          sku: row.sku || "",
          batchNo: row.batchNo || "",
          batchDate: formatDateForInput(row.batchDate),
          expDate: formatDateForInput(row.expDate),
          grnQty: row.grnQty?.toString() || "",
          putawayQty: row.pQty?.toString() || "",
          location: row.bin || "",
          remarks: row.remarks || "",
        }));

        setPutawayItems(putawayItemsData);
        addToast("Grid details loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching grid details:", error);
      addToast("Failed to load grid details", "error");
    }
  };

  // ... (rest of your existing form handlers remain the same)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value.toUpperCase();

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (name === "grnNo") {
      const selectedGrn = grnList.find(grn => grn.docId === value);
      if (selectedGrn) {
        setFormData(prev => ({
          ...prev,
          grnNo: selectedGrn.docId,
          grnDate: formatDateForInput(selectedGrn.grnDate),
          entryNo: selectedGrn.entryNo,
          entryDate: formatDateForInput(selectedGrn.entryDate),
          supplierShortName: selectedGrn.supplierShortName,
          supplier: selectedGrn.supplier,
          carrier: selectedGrn.carrier,
          modeOfShipment: selectedGrn.modeOfShipment?.toUpperCase() || "",
          vehicleType: selectedGrn.vehicleType?.toUpperCase() || "",
          contact: selectedGrn.contact,
          driverName: selectedGrn.driverName?.toUpperCase() || "",
          securityName: selectedGrn.securityName?.toUpperCase() || "",
          goodsDesc: selectedGrn.goodsDescripition?.toUpperCase() || "",
          vehicleNo: selectedGrn.vehicleNo,
          lotNo: selectedGrn.lotNo,
          totalGrnQty: selectedGrn.totalGrnQty,
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

  const handleTableChange = (id, field, value) => {
    setPutawayItems(prevData =>
      prevData.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const handlePartNoChange = (row, value) => {
    const selectedPartNo = partNoList.find(p => p.partNo === value);
    
    setPutawayItems(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPartNo ? selectedPartNo.description : "",
              sku: selectedPartNo ? (selectedPartNo.sku || selectedPartNo.partNo) : "",
            }
          : r
      )
    );
  };

  const handleLocationChange = (row, value) => {
    setPutawayItems(prev =>
      prev.map(r =>
        r.id === row.id
          ? { ...r, location: value }
          : r
      )
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now() + Math.random(),
      partNo: "",
      partDesc: "",
      sku: "",
      batchNo: "",
      batchDate: "",
      expDate: "",
      grnQty: "",
      putawayQty: "",
      location: "",
      remarks: "",
    };
    setPutawayItems([...putawayItems, newRow]);
  };

  const handleDeleteRow = (id) => {
    setPutawayItems(putawayItems.filter(row => row.id !== id));
    // Remove from selected rows
    const newSelected = new Set(selectedRows);
    newSelected.delete(id);
    setSelectedRows(newSelected);
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      grnNo: "",
      grnDate: "",
      entryNo: "",
      entryDate: "",
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
      lotNo: "",
      totalGrnQty: "",
      binClass: "Fixed",
      binPick: "Empty",
      binType: "",
      core: "Multi",
      status: "Edit",
      freeze: false,
      remarks: "",
      createdBy: loginUserName,
      createdOn: formatDateForInput(new Date()),
      totalPutawayQty: 0,
    });
    setFieldErrors({});
    setPutawayItems([]);
    setSelectedRows(new Set());
    getPutAwayDocId();
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

  const handleSave = async () => {
    const errors = {};
    if (!formData.grnNo) errors.grnNo = "GRN No is required";
    if (!formData.binType) errors.binType = "Bin Type is required";
    if (!formData.status) errors.status = "Status is required";

    let tableDataValid = true;
    putawayItems.forEach((row) => {
      if (!row.partNo || !row.location || !row.putawayQty || !row.batchNo) {
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
      const putAwayDetailsDTO = putawayItems.map((row) => ({
        ...(editData && { id: row.id }),
        batch: row.batchNo,
        batchDt: row.batchDate ? convertToAPIDateFormat(row.batchDate) : null,
        bin: row.location,
        binType: formData.binType,
        cellType: "ACTIVE",
        expdate: row.expDate ? convertToAPIDateFormat(row.expDate) : null,
        grnQty: parseFloat(row.grnQty) || 0,
        invoiceNo: row.invoiceNo || "",
        invQty: parseFloat(row.invQty) || 0,
        partDesc: row.partDesc || "",
        partNo: row.partNo,
        putAwayPiecesQty: 0,
        putAwayQty: parseFloat(row.putawayQty) || 0,
        recQty: parseFloat(row.recQty) || 0,
        remarks: row.remarks || "",
        sku: row.sku || "",
        ssku: row.ssku || "",
      }));

      const saveFormData = {
        ...(editData && { id: parseInt(editData.id) }),
        binClass: formData.binClass,
        binPick: formData.binPick,
        binType: formData.binType,
        branch: loginBranch,
        branchCode: loginBranchCode,
        carrier: formData.carrier,
        client: loginClient,
        contact: formData.contact,
        core: formData.core,
        createdBy: loginUserName,
        customer: loginCustomer,
        driverName: formData.driverName,
        enteredPerson: formData.enteredPerson,
        entryDate: formData.entryDate ? convertToAPIDateFormat(formData.entryDate) : null,
        entryNo: formData.entryNo,
        finYear: loginFinYear,
        grnDate: formData.grnDate ? convertToAPIDateFormat(formData.grnDate) : null,
        grnNo: formData.grnNo,
        lotNo: formData.lotNo,
        modeOfShipment: formData.modeOfShipment,
        orgId: parseInt(orgId),
        putAwayDetailsDTO: putAwayDetailsDTO,
        status: formData.status,
        supplier: formData.supplier,
        supplierShortName: formData.supplierShortName,
        vehicleNo: formData.vehicleNo,
        vehicleType: formData.vehicleType,
        warehouse: loginWarehouse,
        docDate: formData.docDate ? convertToAPIDateFormat(formData.docDate) : null,
      };

      const response = await putawayAPI.savePutaway(saveFormData);

      if (response?.status === true) {
        addToast(editData ? "Putaway Updated Successfully" : "Putaway created successfully", "success");
        handleClear();
        onSaveSuccess && onSaveSuccess();
        onBack();
      } else {
        const errorMessage = response?.message || "Putaway creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Putaway creation failed";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      }
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total putaway quantity
  useEffect(() => {
    const totalQty = putawayItems.reduce((sum, row) => sum + (parseFloat(row.putawayQty) || 0), 0);
    setFormData(prev => ({ ...prev, totalPutawayQty: totalQty }));
  }, [putawayItems]);

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

  const isSaveDisabled = () => {
    return formData.status === "Confirm" && formData.status === originalStatus;
  };


  

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
              {editData ? "Edit Putaway" : "Create Putaway"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage Putaway operations
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
        
        {!formData.freeze && (
          <button
            onClick={handleSave}
            disabled={isSubmitting || isSaveDisabled()}
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
            link.download = "sample_Putaway.xls";
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

        {/* Barcode Generation Button */}
        {putawayItems.length > 0 && (
          <button
            onClick={generateBarcodeLabels}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
          >
            <Barcode className="h-3 w-3" />
            Generate Barcodes ({selectedRows.size})
          </button>
        )}
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* TABS NAVIGATION */}
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
                label="Putaway No"
                name="docId"
                value={formData.docId}
                onChange={handleInputChange}
                disabled
              />
              
              <FloatingInput
                label="Putaway Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled={formData.freeze}
              />

              <FloatingSelect
                label="GRN No *"
                name="grnNo"
                value={formData.grnNo}
                onChange={handleSelectChange}
                options={grnList.map(grn => ({ 
                  value: grn.docId, 
                  label: grn.docId 
                }))}
                disabled={formData.freeze}
                error={fieldErrors.grnNo}
                required
              />

              <FloatingInput
                label="GRN Date"
                name="grnDate"
                value={formData.grnDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              <FloatingInput
                label="Supplier Short Name"
                name="supplierShortName"
                value={formData.supplierShortName}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                options={[
                  { value: "Edit", label: "Edit" },
                  { value: "Confirm", label: "Confirm" },
                ]}
                disabled={formData.status === "Confirm" || formData.freeze}
                error={fieldErrors.status}
                required
              />

              <FloatingInput
                label="Created By"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Created On"
                name="createdOn"
                value={formData.createdOn}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              <FloatingInput
                label="Total GRN Qty"
                name="totalGrnQty"
                value={formData.totalGrnQty}
                onChange={handleInputChange}
                disabled
              />

              <FloatingSelect
                label="Bin Class"
                name="binClass"
                value={formData.binClass}
                onChange={handleSelectChange}
                options={[
                  { value: "Fixed", label: "Fixed" },
                  { value: "Open", label: "Open" },
                ]}
                disabled={formData.freeze}
              />

              <FloatingSelect
                label="Bin Pick"
                name="binPick"
                value={formData.binPick}
                onChange={handleSelectChange}
                options={[
                  { value: "Empty", label: "Empty" },
                  { value: "Occupied", label: "Occupied" },
                  { value: "Both", label: "Both" },
                ]}
                disabled={formData.freeze}
              />

              <FloatingSelect
                label="Bin Type *"
                name="binType"
                value={formData.binType}
                onChange={handleSelectChange}
                options={locationTypeList.map(type => ({ 
                  value: type.ltype.toUpperCase(), 
                  label: type.ltype.toUpperCase() 
                }))}
                disabled={formData.freeze}
                error={fieldErrors.binType}
                required
              />

              <FloatingSelect
                label="Core"
                name="core"
                value={formData.core}
                onChange={handleSelectChange}
                options={[
                  { value: "Multi", label: "Multi" },
                  { value: "Single", label: "Single" },
                ]}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION TAB */}
        {activeTab === "additional" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Entry No"
                name="entryNo"
                value={formData.entryNo}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Entry Date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              <FloatingInput
                label="Mode of Shipment"
                name="modeOfShipment"
                value={formData.modeOfShipment}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Carrier"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
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
                label="Security Name"
                name="securityName"
                value={formData.securityName}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Goods Description"
                name="goodsDesc"
                value={formData.goodsDesc}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Lot No"
                name="lotNo"
                value={formData.lotNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Putaway Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {putawayItems.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              {!formData.freeze && (
                <>
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Row
                  </button>
                  <button
                    onClick={getPutawayGridDetails}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  >
                    <Grid className="h-3 w-3" />
                    Fill from GRN
                  </button>
                </>
              )}
              <button
                onClick={() => setPutawayItems([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

          {/* Putaway Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === putawayItems.length && putawayItems.length > 0}
                      onChange={handleSelectAllRows}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                    Batch No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Batch Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Exp Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    GRN Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Putaway Qty *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    Location *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {putawayItems.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items added. Click "Add Row" to start.
                    </td>
                  </tr>
                ) : (
                  putawayItems.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Checkbox */}
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleRowSelection(row.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
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

                      {/* Part No */}
                      <td className="px-3 py-2">
                        <select
                          value={row.partNo}
                          onChange={(e) => handlePartNoChange(row, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.freeze}
                        >
                          <option value="">Select Part No</option>
                          {partNoList.map((part) => (
                            <option key={part.id} value={part.partNo}>
                              {part.partNo}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Part Desc */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.partDesc}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* SKU */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.sku}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Batch No */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.batchNo}
                          onChange={(e) => handleTableChange(row.id, "batchNo", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.freeze}
                        />
                      </td>

                      {/* Batch Date */}
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.batchDate || ''}
                          onChange={(e) => handleTableChange(row.id, "batchDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.freeze}
                        />
                      </td>

                      {/* Exp Date */}
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.expDate || ''}
                          onChange={(e) => handleTableChange(row.id, "expDate", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.freeze}
                        />
                      </td>

                      {/* GRN Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.grnQty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Putaway Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.putawayQty}
                          onChange={(e) => handleTableChange(row.id, "putawayQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          disabled={formData.freeze}
                        />
                      </td>

                      {/* Location */}
                      <td className="px-3 py-2">
                        <select
                          value={row.location}
                          onChange={(e) => handleLocationChange(row, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.freeze}
                        >
                          <option value="">Select Location</option>
                          {locationList.map((loc) => (
                            <option key={loc.id} value={loc.bin}>
                              {loc.bin || `Location ${loc.id}`}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => handleTableChange(row.id, "remarks", e.target.value)}
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

          {/* Total Putaway Qty */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Total Putaway Qty: {formData.totalPutawayQty}
              </span>
              {selectedRows.size > 0 && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedRows.size} item(s) selected for barcode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Putaway Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload={sampleFile}
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/putaway/ExcelUploadForPutAway?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Putaway"
      />

      {/* Barcode Modal */}
      <BarcodeModal
        isOpen={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
        selectedItems={selectedItemsForBarcode}
        onPrintAll={handlePrintAllLabels}
      />
    </div>
  );
};

export default PutawayForm;