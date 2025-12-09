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
  FileText,
  Grid,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  Layers,
} from "lucide-react";
import { deKittingService } from "../../../api/dekittingAPI";
import { warehouseService } from "../../../api/warehouseService";
import { useToast } from "../../Toast/ToastContext";
import { FloatingInput,FloatingSelect } from "../../../utils/InputFields";
import {
  formatDateForInput,
  formatDateForDisplay,
  formatDateForAPI,
  appendGNToDocumentId
} from "../../../utils/dateFormatter";

const DeKittingForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("parent");
  
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
  const [docId, setDocId] = useState("");

  // State for form data
  const [formData, setFormData] = useState({
    docId: "",
    docDate: formatDateForInput(new Date()),
    active: true,
  });

  // State for table data
  const [parentTableData, setParentTableData] = useState([]);
  const [childTableData, setChildTableData] = useState([]);
  
  // Dropdown lists
  const [parentPartNoList, setParentPartNoList] = useState([]);
  const [childPartNoList, setChildPartNoList] = useState([]);
  const [binOptions, setBinOptions] = useState([]);

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [parentTableErrors, setParentTableErrors] = useState([]);
  const [childTableErrors, setChildTableErrors] = useState([]);

  // Initialize data
  useEffect(() => {
    getDocId();
    getAllParentPartNo();
    getAllChildPartNo();
    getAllBinDetails();

    if (editData) {
      getDeKittingById(editData);
    } else {
      // Initialize with one empty row
      setParentTableData([createEmptyParentRow()]);
      setChildTableData([createEmptyChildRow()]);
    }
  }, [editData]);

  const createEmptyParentRow = () => ({
    id: Date.now(),
    partNo: "",
    partDesc: "",
    batchDate: "",
    batchNo: "",
    bin: "",
    binClass: "",
    binType: "",
    cellType: "",
    core: "",
    sku: "",
    grnNo: "",
    grnDate: "",
    expDate: "",
    avlQty: "",
    qty: "",
    rowGrnNoList: [],
    rowBatchNoList: [],
    rowBinList: [],
  });

  const createEmptyChildRow = () => ({
    id: Date.now(),
    partNo: "",
    partDesc: "",
    batchNo: "",
    batchDate: "",
    bin: "",
    binClass: "",
    binType: "",
    cellType: "",
    core: "",
    lotNo: "",
    sku: "",
    grnNo: "",
    grnDate: "",
    expDate: "",
    qty: "",
  });

  // API Functions
  const getDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const response = await deKittingService.getDeKittingDocId(params);
      
      if (response?.paramObjectsMap?.deKittingDocId) {
        const newDocId = response.paramObjectsMap.deKittingDocId;
        setDocId(newDocId);
        setFormData(prev => ({ ...prev, docId: newDocId }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getAllParentPartNo = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
      };

      const response = await deKittingService.getPartNoFromStockForDeKittingParent(params);
      
      if (response?.paramObjectsMap?.partNoDetails) {
        const partData = response.paramObjectsMap.partNoDetails.map(
          ({ partNo, partDesc, sku }) => ({ partNo, partDesc, sku })
        );
        setParentPartNoList(partData);
      }
    } catch (error) {
      console.error("Error fetching parent part numbers:", error);
      addToast("Failed to fetch parent part numbers", "error");
    }
  };

  const getAllChildPartNo = async () => {
    try {
      const params = {
        orgId: orgId,
        branchCode: loginBranchCode,
        client: loginClient,
      };

      const response = await deKittingService.getPartNoforDeKittingChild(params);
      
      if (response?.paramObjectsMap?.partNoChild) {
        const options = response.paramObjectsMap.partNoChild.map(
          (item) => ({
            partNo: item.partNo,
            partDesc: item.partDesc,
            sku: item.sku,
          })
        );
        setChildPartNoList(options);
      }
    } catch (error) {
      console.error("Error fetching child part numbers:", error);
      addToast("Failed to fetch child part numbers", "error");
    }
  };

  const getAllBinDetails = async () => {
    try {
      const params = {
        warehouse: loginWarehouse,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
      };

      const response = await warehouseService.getAllBinDetails(params);
      
      if (response?.paramObjectsMap?.Bins) {
        setBinOptions(response.paramObjectsMap.Bins);
      }
    } catch (error) {
      console.error("Error fetching bin details:", error);
      addToast("Failed to fetch bin details", "error");
    }
  };

  const getDeKittingById = async (row) => {
    setEditId(row.id);
    try {
      const response = await deKittingService.getDeKittingById(row.id);
      
      if (response?.status === true && response.paramObjectsMap?.deKittingVO) {
        const particularDeKitting = response.paramObjectsMap.deKittingVO;
        
        // Update form data
        setFormData({
          docId: particularDeKitting.docId || "",
          docDate: particularDeKitting.docDate ? formatDateForInput(particularDeKitting.docDate) : formatDateForInput(new Date()),
          active: particularDeKitting.active === true,
          freeze: particularDeKitting.freeze,
        });

        // Update parent table data
        const parentDetails = particularDeKitting.deKittingParentVO.map((detail, index) => ({
          id: detail.id || Date.now() + index,
          partNo: detail.partNo || "",
          partDesc: detail.partDesc || "",
          batchNo: detail.batchNo || "",
          batchDate: detail.batchDate || "",
          bin: detail.bin || "",
          binType: detail.binType || "",
          cellType: detail.cellType || "",
          core: detail.core || "",
          sku: detail.sku || "",
          grnNo: detail.grnNo || "",
          grnDate: detail.grnDate || "",
          expDate: detail.expDate || "",
          qty: detail.qty || "",
          avlQty: detail.avlQty || "",
          rowGrnNoList: [],
          rowBatchNoList: [],
          rowBinList: [],
        })) || [createEmptyParentRow()];

        setParentTableData(parentDetails);

        // Update child table data
        const childDetails = particularDeKitting.deKittingChildVO.map((detail, index) => ({
          id: detail.id || Date.now() + index + 1000,
          partNo: detail.partNo || "",
          partDesc: detail.partDesc || "",
          batchNo: detail.batchNo || "",
          batchDate: detail.batchDate || "",
          bin: detail.bin || "",
          binType: detail.binType || "",
          cellType: detail.cellType || "",
          core: detail.core || "",
          lotNo: detail.lotNo || "",
          sku: detail.sku || "",
          grnNo: detail.grnNo || "",
          grnDate: detail.grnDate || "",
          expDate: detail.expDate || "",
          qty: detail.qty || "",
        })) || [createEmptyChildRow()];

        setChildTableData(childDetails);

        // Fetch dropdown data for parent rows
        for (const row of parentDetails) {
          if (row.partNo) {
            await getParentGrnNo(row.partNo, row);
          }
          if (row.grnNo && row.partNo) {
            await getParentBatchNo(row.partNo, row.grnNo, row);
          }
        }

        // Update child table GRN numbers with modified docId
        const modifiedDocId = appendGNToDocumentId(particularDeKitting.docId);
        setChildTableData(prev => prev.map(row => ({
          ...row,
          grnNo: modifiedDocId,
          grnDate: formatDateForInput(new Date()),
        })));

        addToast("DeKitting data loaded successfully", "success");
      } else {
        addToast("Failed to fetch deKitting details", "error");
      }
    } catch (error) {
      console.error("Error fetching deKitting details:", error);
      addToast("Error fetching deKitting details", "error");
    }
  };

  const getParentGrnNo = async (selectedPartNo, row) => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        partNo: selectedPartNo,
      };

      const response = await deKittingService.getGrnDetailsForDekittingParent(params);
      
      setParentTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowGrnNoList: response.paramObjectsMap?.grnDetails || [],
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching GRN data:", error);
    }
  };

  const getParentBatchNo = async (selectedPartNo, selectedGrnNo, row) => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo: selectedGrnNo,
        orgId: orgId,
        partNo: selectedPartNo,
      };

      const response = await deKittingService.getBatchNoForDeKittingParent(params);
      
      setParentTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowBatchNoList: response.paramObjectsMap?.batchDetails || [],
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching batch data:", error);
    }
  };

  const getParentBin = async (selectedBatchNo, selectedGrnNo, selectedPartNo, row) => {
    try {
      const params = {
        batchNo: selectedBatchNo,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo: selectedGrnNo,
        orgId: orgId,
        partNo: selectedPartNo,
      };

      const response = await deKittingService.getBinForDeKittingParent(params);
      
      setParentTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowBinList: response.paramObjectsMap?.binDetails || [],
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching bin data:", error);
    }
  };

  const getAvlQty = async (selectedBatchNo, selectedBin, selectedGrnNo, selectedPartNo, row) => {
    try {
      const params = {
        batchNo: selectedBatchNo,
        bin: selectedBin,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo: selectedGrnNo,
        orgId: orgId,
        partNo: selectedPartNo,
      };

      const response = await deKittingService.getAvlQtyForDeKittingParent(params);
      
      if (response?.paramObjectsMap?.avlQty !== undefined) {
        setParentTableData(prev =>
          prev.map(r =>
            r.id === row.id
              ? { ...r, avlQty: response.paramObjectsMap.avlQty }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }
  };

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParentPartNoChange = (row, value) => {
    const selectedPart = parentPartNoList.find(p => p.partNo === value);
    
    setParentTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              grnNo: "",
              rowGrnNoList: [],
              batchNo: "",
              rowBatchNoList: [],
              bin: "",
              rowBinList: [],
              avlQty: "",
            }
          : r
      )
    );

    if (value) {
      getParentGrnNo(value, row);
    }
  };

  const handleParentGrnNoChange = (row, value) => {
    const selectedGrn = row.rowGrnNoList.find(g => g.grnNo === value);
    
    setParentTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              grnNo: value,
              grnDate: selectedGrn?.grnDate || "",
              batchNo: "",
              rowBatchNoList: [],
              bin: "",
              rowBinList: [],
              avlQty: "",
            }
          : r
      )
    );

    if (value && row.partNo) {
      getParentBatchNo(row.partNo, value, row);
    }
  };

  const handleParentBatchNoChange = (row, value) => {
    const selectedBatch = row.rowBatchNoList.find(b => b.batchNo === value);
    
    setParentTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              batchNo: value,
              batchDate: selectedBatch?.batchDate || "",
              expDate: selectedBatch?.expDate || "",
            }
          : r
      )
    );

    if (value && row.partNo && row.grnNo) {
      getParentBin(value, row.grnNo, row.partNo, row);
    }
  };

  const handleParentBinChange = (row, value) => {
    const selectedBin = row.rowBinList.find(b => b.bin === value);
    
    setParentTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              bin: value,
              binClass: selectedBin?.binClass || "",
              binType: selectedBin?.binType || "",
              cellType: selectedBin?.cellType || "",
              core: selectedBin?.core || "",
            }
          : r
      )
    );

    if (value && row.batchNo && row.grnNo && row.partNo) {
      getAvlQty(row.batchNo, value, row.grnNo, row.partNo, row);
    }
  };

  const handleChildPartNoChange = (row, value) => {
    const selectedPart = childPartNoList.find(p => p.partNo === value);
    
    setChildTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
            }
          : r
      )
    );
  };

  const handleChildBinChange = (row, value) => {
    const selectedBin = binOptions.find(b => b.bin === value);
    
    setChildTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              bin: value,
              binClass: selectedBin?.binClass || "",
              binType: selectedBin?.binType || "",
              cellType: selectedBin?.cellType || "",
              core: selectedBin?.core || "",
            }
          : r
      )
    );
  };

  const handleAddParentRow = () => {
    setParentTableData([...parentTableData, createEmptyParentRow()]);
  };

  const handleAddChildRow = () => {
    setChildTableData([...childTableData, createEmptyChildRow()]);
  };

  const handleDeleteParentRow = (id) => {
    setParentTableData(parentTableData.filter(row => row.id !== id));
  };

  const handleDeleteChildRow = (id) => {
    setChildTableData(childTableData.filter(row => row.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      active: true,
    });
    setParentTableData([createEmptyParentRow()]);
    setChildTableData([createEmptyChildRow()]);
    setEditId("");
    setFieldErrors({});
    setParentTableErrors([]);
    setChildTableErrors([]);
    getDocId();
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    
    const errors = {};

    // Validate main form fields
    if (!formData.docId) errors.docId = "Document ID is required";

    // Validate parent table data
    let parentTableValid = true;
    const newParentErrors = parentTableData.map(row => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        parentTableValid = false;
      }
      if (!row.grnNo) {
        rowErrors.grnNo = "GRN No is required";
        parentTableValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "Batch No is required";
        parentTableValid = false;
      }
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        parentTableValid = false;
      }
      if (!row.qty || row.qty <= 0) {
        rowErrors.qty = "Valid quantity is required";
        parentTableValid = false;
      }
      return rowErrors;
    });

    // Validate child table data
    let childTableValid = true;
    const newChildErrors = childTableData.map(row => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        childTableValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "Batch No is required";
        childTableValid = false;
      }
      if (!row.batchDate) {
        rowErrors.batchDate = "Batch Date is required";
        childTableValid = false;
      }
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        childTableValid = false;
      }
      if (!row.expDate) {
        rowErrors.expDate = "Exp Date is required";
        childTableValid = false;
      }
      if (!row.qty || row.qty <= 0) {
        rowErrors.qty = "Valid quantity is required";
        childTableValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setParentTableErrors(newParentErrors);
    setChildTableErrors(newChildErrors);

    if (Object.keys(errors).length > 0 || !parentTableValid || !childTableValid) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update child table with modified docId
      const modifiedDocId = appendGNToDocumentId(formData.docId);
      const updatedChildTableData = childTableData.map(row => ({
        ...row,
        grnNo: modifiedDocId,
        grnDate: formatDateForInput(new Date()),
      }));

      const deKittingParentDTO = parentTableData.map(item => ({
        ...(editId && { id: item.id }),
        avlQty: parseInt(item.avlQty || 0),
        batchDate: item.batchDate,
        batchNo: item.batchNo,
        bin: item.bin,
        binClass: item.binClass,
        binType: item.binType,
        cellType: item.cellType,
        core: item.core,
        expDate: item.expDate,
        grnDate: item.grnDate ? formatDateForAPI(item.grnDate) : null,
        grnNo: item.grnNo,
        partNo: item.partNo,
        partDesc: item.partDesc,
        qty: parseInt(item.qty || 0),
        sku: item.sku,
      }));

      const deKittingChildDTO = updatedChildTableData.map(item => ({
        ...(editId && { id: item.id }),
        batchDate: item.batchDate ? formatDateForAPI(item.batchDate) : null,
        batchNo: item.batchNo,
        bin: item.bin,
        binClass: item.binClass,
        binType: item.binType,
        cellType: item.cellType,
        core: item.core,
        expDate: item.expDate ? formatDateForAPI(item.expDate) : null,
        grnDate: item.grnDate ? formatDateForAPI(item.grnDate) : null,
        grnNo: item.grnNo,
        partNo: item.partNo,
        partDesc: item.partDesc,
        qty: parseInt(item.qty || 0),
        sku: item.sku,
        lotNo: item.lotNo || "",
      }));

      const saveFormData = {
        ...(editId && { id: parseInt(editId) }),
        docDate: formData.docDate ? formatDateForAPI(formData.docDate) : null,
        deKittingParentDTO,
        deKittingChildDTO,
        orgId: parseInt(orgId),
        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        active: formData.active,
        freeze: formData.freeze || false,
      };

      console.log("📤 Saving DeKitting:", saveFormData);

      const response = await deKittingService.createUpdateDeKitting(saveFormData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(editId ? "DeKitting Updated Successfully" : "DeKitting created successfully", "success");
        onBack();
      } else {
        const errorMessage = response.paramObjectsMap?.errorMessage || "DeKitting creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "DeKitting creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
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
              {editData ? "Edit DeKitting" : "Create DeKitting"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage de-kitting process
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
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        
        {/* HEADER SECTION */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FloatingInput
              label="Document No"
              name="docId"
              value={formData.docId}
              onChange={handleInputChange}
              disabled
            />
            
            <div className="relative">
              <FloatingInput
                label="Doc Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />
              <Calendar className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4">
          <button
            onClick={() => setActiveTab("parent")}
            className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === "parent"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Package className="h-4 w-4" />
            Parent Parts
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {parentTableData.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("child")}
            className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === "child"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Layers className="h-4 w-4" />
            Child Parts
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {childTableData.length}
            </span>
          </button>
        </div>

        {/* PARENT PARTS TAB CONTENT */}
        {activeTab === "parent" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Parent Parts Details</h3>
              </div>
              
              <button
                onClick={handleAddParentRow}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </button>
            </div>

            {/* Parent Parts Table */}
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
                      GRN No *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Batch No *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Bin *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Avl Qty
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Qty *
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {parentTableData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                        No parent parts added. Click "Add Row" to start.
                      </td>
                    </tr>
                  ) : (
                    parentTableData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Action */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDeleteParentRow(row.id)}
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
                            value={row.partNo}
                            onChange={(e) => handleParentPartNoChange(row, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Part No</option>
                            {parentPartNoList.map((part) => (
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

                        {/* GRN No */}
                        <td className="px-3 py-2">
                          <select
                            value={row.grnNo}
                            onChange={(e) => handleParentGrnNoChange(row, e.target.value)}
                            disabled={!row.partNo}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select GRN No</option>
                            {row.rowGrnNoList?.map((grn) => (
                              <option key={grn.grnNo} value={grn.grnNo}>
                                {grn.grnNo}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Batch No */}
                        <td className="px-3 py-2">
                          <select
                            value={row.batchNo}
                            onChange={(e) => handleParentBatchNoChange(row, e.target.value)}
                            disabled={!row.grnNo}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Batch No</option>
                            {row.rowBatchNoList?.map((batch) => (
                              <option key={batch.batchNo} value={batch.batchNo}>
                                {batch.batchNo}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Bin */}
                        <td className="px-3 py-2">
                          <select
                            value={row.bin}
                            onChange={(e) => handleParentBinChange(row, e.target.value)}
                            disabled={!row.batchNo}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Bin</option>
                            {row.rowBinList?.map((bin) => (
                              <option key={bin.bin} value={bin.bin}>
                                {bin.bin}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Available Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.avlQty}
                            readOnly
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                          />
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => setParentTableData(prev =>
                              prev.map(r =>
                                r.id === row.id ? { ...r, qty: e.target.value } : r
                              )
                            )}
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
          </div>
        )}

        {/* CHILD PARTS TAB CONTENT */}
        {activeTab === "child" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Child Parts Details</h3>
              </div>
              
              <button
                onClick={handleAddChildRow}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </button>
            </div>

            {/* Child Parts Table */}
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
                      GRN No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Batch No *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Batch Date *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Bin *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Exp Date *
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Qty *
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {childTableData.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                        No child parts added. Click "Add Row" to start.
                      </td>
                    </tr>
                  ) : (
                    childTableData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Action */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDeleteChildRow(row.id)}
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
                            value={row.partNo}
                            onChange={(e) => handleChildPartNoChange(row, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Part No</option>
                            {childPartNoList.map((part) => (
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

                        {/* GRN No */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.grnNo}
                            readOnly
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                          />
                        </td>

                        {/* Batch No */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.batchNo}
                            onChange={(e) => setChildTableData(prev =>
                              prev.map(r =>
                                r.id === row.id ? { ...r, batchNo: e.target.value } : r
                              )
                            )}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Batch Date */}
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={row.batchDate}
                            onChange={(e) => setChildTableData(prev =>
                              prev.map(r =>
                                r.id === row.id ? { ...r, batchDate: e.target.value } : r
                              )
                            )}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Bin */}
                        <td className="px-3 py-2">
                          <select
                            value={row.bin}
                            onChange={(e) => handleChildBinChange(row, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Bin</option>
                            {binOptions.map((bin) => (
                              <option key={bin.bin} value={bin.bin}>
                                {bin.bin}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Exp Date */}
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={row.expDate}
                            onChange={(e) => setChildTableData(prev =>
                              prev.map(r =>
                                r.id === row.id ? { ...r, expDate: e.target.value } : r
                              )
                            )}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => setChildTableData(prev =>
                              prev.map(r =>
                                r.id === row.id ? { ...r, qty: e.target.value } : r
                              )
                            )}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DeKittingForm;