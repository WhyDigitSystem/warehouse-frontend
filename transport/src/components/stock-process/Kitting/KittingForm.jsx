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
    ChevronRight,Calendar,Package,Layers,
    } from "lucide-react";
    import { kittingAPI } from "../../../api/kittingAPI";
    import { warehouseAPI } from "../../../api/kittingAPI";
    import { useToast } from "../../Toast/ToastContext";
    import dayjs from "dayjs";

    // Helper functions
    const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
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

    const appendGNToDocumentId = (docId) => {
    const index = docId.indexOf("KT");
    if (index !== -1) {
        return `${docId.slice(0, index + 2)}GN${docId.slice(index + 2)}`;
    }
    return docId;
    };

    const KittingForm = ({ editData, onBack, onSaveSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("child");
    
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
        refNo: "",
        refDate: formatDateForInput(new Date()),
        active: true,
    });

    // State for child table data
    const [childTableData, setChildTableData] = useState([]);
    const [parentTableData, setParentTableData] = useState([]);
    
    // Dropdown lists
    const [childPartNoList, setChildPartNoList] = useState([]);
    const [parentPartNoList, setParentPartNoList] = useState([]);
    const [binOptions, setBinOptions] = useState([]);

    // Field errors
    const [fieldErrors, setFieldErrors] = useState({});
    const [childTableErrors, setChildTableErrors] = useState([]);
    const [parentTableErrors, setParentTableErrors] = useState([]);

    // Initialize data
    useEffect(() => {
        getDocId();
        getAllChildPartNo();
        getAllParentPart();
        getAllBinDetails();

        if (editData) {
        getKittingById(editData);
        } else {
        // Initialize with one empty row
        setChildTableData([createEmptyChildRow()]);
        setParentTableData([createEmptyParentRow()]);
        }
    }, [editData]);


    const createEmptyChildRow = () => ({
        id: Date.now(),
        partNo: "",
        partDesc: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        batchNo: "",
        batchDate: "",
        expDate: "",
        bin: "",
        avlQty: "",
        qty: "",
        rowGrnNoList: [],
        rowBatchNoList: [],
        rowBinList: [],
    });

  const createEmptyParentRow = () => {
  // Get current modified docId
  const modifiedDocId = appendGNToDocumentId(docId || "");
  
  return {
    id: Date.now(),
    partNo: "",
    partDesc: "",
    sku: "",
    grnNo: modifiedDocId,
    grnDate: formatDateForInput(new Date()),
    batchNo: "",
    batchDate: "",
    lotNo: "",
    bin: "",
    qty: "",
    expDate: "",
    binType: "",
    binClass: "",
    cellType: "",
    core: "",
  };
};

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

        const response = await kittingAPI.getKittingDocId(params);
        
        if (response?.paramObjectsMap?.KittingDocId) {
            const newDocId = response.paramObjectsMap.KittingDocId;
            setDocId(newDocId);
            setFormData(prev => ({ ...prev, docId: newDocId }));
            
            // Update parent table with GN-modified docId
            const modifiedDocId = appendGNToDocumentId(newDocId);
            setParentTableData(prev => prev.map(row => ({
            ...row,
            grnNo: modifiedDocId,
            grnDate: formatDateForInput(new Date()),
            })));
        }
        } catch (error) {
        console.error("Error fetching document ID:", error);
        addToast("Failed to fetch document ID", "error");
        }
    };

    const appendGNToDocumentId = (docId) => {
        const index = docId.indexOf("KT");
        if (index !== -1) {
        return `${docId.slice(0, index + 2)}GN${docId.slice(index + 2)}`;
        }
        return docId;
    };

    const getAllChildPartNo = async () => {
        try {
        const params = {
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            orgId: orgId,
            warehouse: loginWarehouse,
        };

        const response = await kittingAPI.getPartNoByChild(params);
        
        if (response?.paramObjectsMap?.kittingVO) {
            setChildPartNoList(response.paramObjectsMap.kittingVO);
        }
        } catch (error) {
        console.error("Error fetching child part numbers:", error);
        addToast("Failed to fetch part numbers", "error");
        }
    };

    const getAllParentPart = async () => {
        try {
        const params = {
            branchCode: loginBranchCode,
            client: loginClient,
            orgId: orgId,
        };

        const response = await kittingAPI.getPartNoByParent(params);
        
        if (response?.paramObjectsMap?.kittingVO) {
            setParentPartNoList(response.paramObjectsMap.kittingVO);
        }
        } catch (error) {
        console.error("Error fetching parent part numbers:", error);
        addToast("Failed to fetch parent part numbers", "error");
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

        const response = await warehouseAPI.getAllBinDetails(params);
        
        if (response?.paramObjectsMap?.Bins) {
            setBinOptions(response.paramObjectsMap.Bins);
        }
        } catch (error) {
        console.error("Error fetching bin details:", error);
        addToast("Failed to fetch bin details", "error");
        }
    };

const getKittingById = async (row) => {
  setEditId(row.id);
  try {
    const response = await kittingAPI.getKittingById(row.id);
    
    if (response?.status === true && response.paramObjectsMap?.kittingVO) {
      const particularKitting = response.paramObjectsMap.kittingVO;
      
      // Update form data
      setFormData({
        docId: particularKitting.docId || "",
        docDate: particularKitting.docDate ? formatDateForInput(particularKitting.docDate) : formatDateForInput(new Date()),
        refNo: particularKitting.refNo || "",
        refDate: particularKitting.refDate ? formatDateForInput(particularKitting.refDate) : "",
        active: particularKitting.active === true,
      });

      // Helper function to fetch dropdown data for a child row
      const fetchRowData = async (rowData, index) => {
        const updatedRow = {
          id: rowData.id || Date.now() + index,
          partNo: rowData.partNo || "",
          partDesc: rowData.partDesc || rowData.partDescription || "",
          sku: rowData.sku || "",
          grnNo: rowData.grnNo || "",
          grnDate: rowData.grnDate || "",
          batchNo: rowData.batchNo || "",
          batchDate: rowData.batchDate || "",
          expDate: rowData.expDate || "",
          bin: rowData.bin || "",
          avlQty: rowData.avlQty || "",
          qty: rowData.qty || "",
          rowGrnNoList: [],
          rowBatchNoList: [],
          rowBinList: [],
        };

        // Fetch GRN list if partNo exists
        if (rowData.partNo) {
          try {
            const grnParams = {
              branchCode: loginBranchCode,
              client: loginClient,
              customer: loginCustomer,
              orgId: orgId,
              partNo: rowData.partNo,
              warehouse: loginWarehouse,
            };
            
            const grnResponse = await kittingAPI.getGrnNoByChild(grnParams);
            updatedRow.rowGrnNoList = grnResponse.paramObjectsMap?.kittingVO || [];
            
            // Fetch Batch list if GRN exists
            if (rowData.grnNo) {
              const batchParams = {
                branchCode: loginBranchCode,
                client: loginClient,
                customer: loginCustomer,
                orgId: orgId,
                partNo: rowData.partNo,
                warehouse: loginWarehouse,
                grnNo: rowData.grnNo,
              };
              
              const batchResponse = await kittingAPI.getBatchByChild(batchParams);
              updatedRow.rowBatchNoList = batchResponse.paramObjectsMap?.kittingVO || [];
              
              // Fetch Bin list if batch exists
              if (rowData.batchNo) {
                const binParams = {
                  branchCode: loginBranchCode,
                  client: loginClient,
                  customer: loginCustomer,
                  orgId: orgId,
                  partNo: rowData.partNo,
                  warehouse: loginWarehouse,
                  grnNo: rowData.grnNo,
                  batch: rowData.batchNo,
                };
                
                const binResponse = await kittingAPI.getBinByChild(binParams);
                updatedRow.rowBinList = binResponse.paramObjectsMap?.kittingVO || [];
                
                // Get available quantity
                if (rowData.bin) {
                  const qtyParams = {
                    orgId: orgId,
                    batch: rowData.batchNo,
                    branchCode: loginBranchCode,
                    client: loginClient,
                    partNo: rowData.partNo,
                    warehouse: loginWarehouse,
                    grnNo: rowData.grnNo,
                    bin: rowData.bin,
                  };
                  
                  const qtyResponse = await kittingAPI.getSqtyByKitting(qtyParams);
                  if (qtyResponse?.paramObjectsMap?.avlQty !== undefined) {
                    updatedRow.avlQty = qtyResponse.paramObjectsMap.avlQty;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error fetching dropdown data for row", index, error);
          }
        }
        
        return updatedRow;
      };

      // Update child table data
      const childDetails = particularKitting.kittingDetails1VO || [];
      const updatedChildData = [];
      
      for (let i = 0; i < childDetails.length; i++) {
        const row = await fetchRowData(childDetails[i], i);
        updatedChildData.push(row);
      }
      
      // If no child data, create empty row
      if (updatedChildData.length === 0) {
        updatedChildData.push(createEmptyChildRow());
      }
      
      setChildTableData(updatedChildData);

      // Update parent table data
      const parentDetails = particularKitting.kittingDetails2VO || [];
      const updatedParentData = [];
      
      // Get the modified GRN for parent rows
      const modifiedDocId = appendGNToDocumentId(particularKitting.docId || "");
      
      for (let i = 0; i < parentDetails.length; i++) {
        const detail = parentDetails[i];
        updatedParentData.push({
          id: detail.id || Date.now() + i + 1000,
          partNo: detail.ppartNo || "",
          partDesc: detail.ppartDesc || "",
          sku: detail.psku || "",
          grnNo: modifiedDocId || detail.pgrnNo || "",
          grnDate: detail.pgrnDate ? formatDateForInput(detail.pgrnDate) : formatDateForInput(new Date()),
          batchNo: detail.pbatchNo || "",
          batchDate: detail.pbatchDate || "",
          lotNo: detail.plotNo || "",
          bin: detail.pbin || "",
          qty: detail.pqty || "",
          expDate: detail.pexpDate || "",
          binType: detail.pbinType || "",
          binClass: detail.pbinClass || "",
          cellType: detail.pcellType || "",
          core: detail.pcore || "",
        });
      }
      
      // If no parent data, create empty row
      if (updatedParentData.length === 0) {
        updatedParentData.push({
          ...createEmptyParentRow(),
          grnNo: modifiedDocId,
          grnDate: formatDateForInput(new Date()),
        });
      }
      
      setParentTableData(updatedParentData);

      addToast("Kitting data loaded successfully", "success");
    } else {
      addToast("Failed to fetch kitting details", "error");
    }
  } catch (error) {
    console.error("Error fetching kitting details:", error);
    addToast("Error fetching kitting details", "error");
  }
};


    const getAllChildGrnNo = async (selectedPartNo, row) => {
        try {
        const params = {
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            orgId: orgId,
            partNo: selectedPartNo,
            warehouse: loginWarehouse,
        };

        const response = await kittingAPI.getGrnNoByChild(params);
        
        setChildTableData(prev =>
            prev.map(r =>
            r.id === row.id
                ? {
                    ...r,
                    rowGrnNoList: response.paramObjectsMap?.kittingVO || [],
                }
                : r
            )
        );
        } catch (error) {
        console.error("Error fetching GRN data:", error);
        }
    };

    const getAllChildBatchNo = async (selectedGrnNo, row) => {
        try {
        const params = {
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            orgId: orgId,
            partNo: row.partNo,
            warehouse: loginWarehouse,
            grnNo: selectedGrnNo,
        };

        const response = await kittingAPI.getBatchByChild(params);
        
        setChildTableData(prev =>
            prev.map(r =>
            r.id === row.id
                ? {
                    ...r,
                    rowBatchNoList: response.paramObjectsMap?.kittingVO || [],
                }
                : r
            )
        );
        } catch (error) {
        console.error("Error fetching batch data:", error);
        }
    };

    const getAllChildBin = async (selectedPartNo, selectedGrnNo, selectedBatchNo, row) => {
        try {
        const params = {
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            orgId: orgId,
            partNo: selectedPartNo,
            warehouse: loginWarehouse,
            grnNo: selectedGrnNo,
            batch: selectedBatchNo,
        };

        const response = await kittingAPI.getBinByChild(params);
        
        setChildTableData(prev =>
            prev.map(r =>
            r.id === row.id
                ? {
                    ...r,
                    rowBinList: response.paramObjectsMap?.kittingVO || [],
                }
                : r
            )
        );
        } catch (error) {
        console.error("Error fetching bin data:", error);
        }
    };

    const getAvlQty = async (row, selectedBin) => {
        try {
        const params = {
            orgId: orgId,
            batch: row.batchNo,
            branchCode: loginBranchCode,
            client: loginClient,
            partNo: row.partNo,
            warehouse: loginWarehouse,
            grnNo: row.grnNo,
            bin: selectedBin,
        };

        const response = await kittingAPI.getSqtyByKitting(params);
        
        if (response?.paramObjectsMap?.avlQty !== undefined) {
            setChildTableData(prev =>
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

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: "" }));
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };
const handleChildPartNoChange = (row, value) => {
  const selectedPart = childPartNoList.find(p => p.partNo === value);
  
  setChildTableData(prev =>
    prev.map(r =>
      r.id === row.id
        ? {
            ...r,
            partNo: value,
            partDesc: selectedPart?.partDesc || selectedPart?.partDescription || "",
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
    getAllChildGrnNo(value, row);
  }
};

    const handleChildGrnNoChange = (row, value) => {
        const selectedGrn = row.rowGrnNoList.find(g => g.grnNo === value);
        
        setChildTableData(prev =>
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
        getAllChildBatchNo(value, row);
        }
    };

    const handleChildBatchNoChange = (row, value) => {
        const selectedBatch = row.rowBatchNoList.find(b => b.batchNo === value);
        
        setChildTableData(prev =>
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
        getAllChildBin(row.partNo, row.grnNo, value, row);
        }
    };

    const handleChildBinChange = (row, value) => {
        const selectedBin = row.rowBinList.find(b => b.bin === value);
        
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

        if (value) {
        getAvlQty(row, value);
        }
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
                }
            : r
        )
        );
    };

    const handleParentBinChange = (row, value) => {
        const selectedBin = binOptions.find(b => b.bin === value);
        
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
    };

    const handleAddChildRow = () => {
        setChildTableData([...childTableData, createEmptyChildRow()]);
    };

    const handleAddParentRow = () => {
        setParentTableData([...parentTableData, createEmptyParentRow()]);
    };

    const handleDeleteChildRow = (id) => {
        setChildTableData(childTableData.filter(row => row.id !== id));
    };

    const handleDeleteParentRow = (id) => {
        setParentTableData(parentTableData.filter(row => row.id !== id));
    };

    const handleClear = () => {
        setFormData({
        docId: "",
        docDate: formatDateForInput(new Date()),
        refNo: "",
        refDate: formatDateForInput(new Date()),
        active: true,
        });
        setChildTableData([createEmptyChildRow()]);
        setParentTableData([createEmptyParentRow()]);
        setEditId("");
        setFieldErrors({});
        setChildTableErrors([]);
        setParentTableErrors([]);
        getDocId();
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

    const handleSave = async () => {
        if (isSubmitting) return;
        
        const errors = {};

        // Validate main form fields
        if (!formData.refNo) errors.refNo = "Ref No is required";
        if (!formData.refDate) errors.refDate = "Ref Date is required";

        // Validate child table data
        let childTableValid = true;
        const newChildErrors = childTableData.map(row => {
        const rowErrors = {};
        if (!row.partNo) {
            rowErrors.partNo = "Part No is required";
            childTableValid = false;
        }
        if (!row.grnNo) {
            rowErrors.grnNo = "GRN No is required";
            childTableValid = false;
        }
        if (!row.batchNo) {
            rowErrors.batchNo = "Batch No is required";
            childTableValid = false;
        }
        if (!row.bin) {
            rowErrors.bin = "Bin is required";
            childTableValid = false;
        }
        if (!row.qty || row.qty <= 0) {
            rowErrors.qty = "Valid quantity is required";
            childTableValid = false;
        }
        return rowErrors;
        });

        // Validate parent table data
        let parentTableValid = true;
        const newParentErrors = parentTableData.map(row => {
        const rowErrors = {};
        if (!row.partNo) {
            rowErrors.partNo = "Part No is required";
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

        setFieldErrors(errors);
        setChildTableErrors(newChildErrors);
        setParentTableErrors(newParentErrors);

        if (Object.keys(errors).length > 0 || !childTableValid || !parentTableValid) {
        addToast("Please fill all required fields", "error");
        return;
        }

        setIsSubmitting(true);

        try {
        const kittingDetails1DTO = childTableData.map(item => ({
            ...(editId && { id: item.id }),
            bin: item.bin,
            partNo: item.partNo,
            partDesc: item.partDesc,
            batchNo: item.batchNo,
            expDate: item.expDate,
            batchDate: item.batchDate,
            lotNo: item.lotNo,
            grnNo: item.grnNo,
            binType: item.binType,
            binClass: item.binClass,
            cellType: item.cellType,
            core: item.core,
            grnDate: item.grnDate ? formatDateForAPI(item.grnDate) : null,
            sku: item.sku,
            avlQty: parseInt(item.avlQty || 0),
            qty: parseInt(item.qty || 0),
            unitRate: 0,
            amount: 0,
            qQcflag: true,
        }));

        const kittingDetails2DTO = parentTableData.map(item => ({
            ...(editId && { id: item.id }),
            ppartNo: item.partNo,
            ppartDesc: item.partDesc,
            pbatchNo: item.batchNo,
            pbatchDate: item.batchDate,
            plotNo: item.lotNo,
            psku: item.sku,
            pqty: parseInt(item.qty || 0),
            pbin: item.bin,
            pgrnNo: item.grnNo,
            pgrnDate: item.grnDate ? formatDateForAPI(item.grnDate) : null,
            pexpDate: item.expDate,
            pqcflag: true,
            pbinType: item.binType,
            pbinClass: item.binClass,
            pcellType: item.cellType,
            pcore: item.core,
        }));

        const saveFormData = {
            ...(editId && { id: parseInt(editId) }),
            docDate: formData.docDate ? formatDateForAPI(formData.docDate) : null,
            refNo: formData.refNo,
            refDate: formData.refDate ? formatDateForAPI(formData.refDate) : null,
            kittingDetails1DTO,
            kittingDetails2DTO,
            orgId: parseInt(orgId),
            createdBy: loginUserName,
            branch: loginBranch,
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            finYear: loginFinYear,
            warehouse: loginWarehouse,
            active: formData.active,
        };

        console.log("📤 Saving Kitting:", saveFormData);

        const response = await kittingAPI.createUpdateKitting(saveFormData);

        if (response.status === true) {
            handleClear();
            onSaveSuccess && onSaveSuccess();
            addToast(editId ? "Kitting Updated Successfully" : "Kitting created successfully", "success");
            onBack();
        } else {
            const errorMessage = response.paramObjectsMap?.errorMessage || "Kitting creation failed";
            addToast(errorMessage, "error");
        }
        } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.response?.data?.message || "Kitting creation failed";
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
        <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm ${
            value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
        } bg-white dark:bg-gray-700 px-1`}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, disabled = false, ...props }) => (
        <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
            } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
            {...props}
        >
            <option value="">Select {label}</option>
            {options?.map((option) => (
            <option key={option.value || option.partNo || option.bin || option} 
                    value={option.value || option.partNo || option.bin || option}>
                {option.label || option.partNo || option.bin || option}
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
                {editData ? "Edit Kitting" : "Create Kitting"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage kitting process
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
            
            {/* HEADER SECTION WITH 4 FIELDS */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

                <FloatingInput
                label="Ref No *"
                name="refNo"
                value={formData.refNo}
                onChange={handleInputChange}
                error={fieldErrors.refNo}
                required
                />

                <div className="relative">
                <FloatingInput
                    label="Ref Date *"
                    name="refDate"
                    value={formData.refDate}
                    onChange={handleInputChange}
                    type="date"
                    error={fieldErrors.refDate}
                    required
                />
                <Calendar className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4">
            <button
                onClick={() => setActiveTab("child")}
                className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
                activeTab === "child"
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                <Package className="h-4 w-4" />
                Child Parts
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                {childTableData.length}
                </span>
            </button>
            
            <button
                onClick={() => setActiveTab("parent")}
                className={`px-4 py-3 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
                activeTab === "parent"
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                <Layers className="h-4 w-4" />
                Parent Parts
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                {parentTableData.length}
                </span>
            </button>
            </div>

            {/* CHILD PARTS TAB CONTENT */}
            {activeTab === "child" && (
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Child Parts Details</h3>
                </div>
                
                <button
                    onClick={handleAddChildRow}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
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
                        GRN No *
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        GRN Date
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
                                onChange={(e) => {
                                const selectedPart = childPartNoList.find(p => p.partNo === e.target.value);
                                if (selectedPart) {
                                    setChildTableData(prev =>
                                    prev.map(r =>
                                        r.id === row.id
                                        ? {
                                            ...r,
                                            partNo: e.target.value,
                                            partDesc: selectedPart.partDesc || "",
                                            sku: selectedPart.sku || "",
                                            }
                                        : r
                                    )
                                    );
                                    // Call API to get GRN numbers
                                    // getAllChildGrnNo(e.target.value, row);
                                }
                                }}
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
                                 value={row.partDesc || row.partDescription || ""}
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
                                onChange={(e) => {
                                setChildTableData(prev =>
                                    prev.map(r =>
                                    r.id === row.id ? { ...r, grnNo: e.target.value } : r
                                    )
                                );
                                }}
                                disabled={!row.partNo}
                                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select GRN No</option>
                                {/* Populate with API data */}
                                {row.rowGrnNoList?.map((grn) => (
                                <option key={grn.grnNo} value={grn.grnNo}>
                                    {grn.grnNo}
                                </option>
                                ))}
                            </select>
                            </td>

                            {/* GRN Date */}
                            <td className="px-3 py-2">
                            <input
                                type="text"
                                value={row.grnDate ? formatDateForDisplay(row.grnDate) : ""}
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

                            {/* Bin */}
                            <td className="px-3 py-2">
                            <select
                                value={row.bin}
                                onChange={(e) => {
                                const selectedBin = row.rowBinList?.find(b => b.bin === e.target.value);
                                if (selectedBin) {
                                    setChildTableData(prev =>
                                    prev.map(r =>
                                        r.id === row.id
                                        ? {
                                            ...r,
                                            bin: e.target.value,
                                            binClass: selectedBin.binClass || "",
                                            binType: selectedBin.binType || "",
                                            cellType: selectedBin.cellType || "",
                                            core: selectedBin.core || "",
                                            }
                                        : r
                                    )
                                    );
                                }
                                }}
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

            {/* PARENT PARTS TAB CONTENT */}
            {activeTab === "parent" && (
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Parent Parts Details</h3>
                </div>
                
                <button
                    onClick={handleAddParentRow}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
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
                        GRN No
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        GRN Date
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Batch No
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Bin *
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
                                onChange={(e) => {
                                const selectedPart = parentPartNoList.find(p => p.partNo === e.target.value);
                                if (selectedPart) {
                                    setParentTableData(prev =>
                                    prev.map(r =>
                                        r.id === row.id
                                        ? {
                                            ...r,
                                            partNo: e.target.value,
                                            partDesc: selectedPart.partDesc || "",
                                            sku: selectedPart.sku || "",
                                            }
                                        : r
                                    )
                                    );
                                }
                                }}
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
                            <input
                                type="text"
                                value={row.grnNo}
                                readOnly
                                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                            </td>

                            {/* GRN Date */}
                            <td className="px-3 py-2">
                            <input
                                type="text"
                                value={row.grnDate ? formatDateForDisplay(row.grnDate) : formatDateForDisplay(new Date())}
                                readOnly
                                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                            </td>

                            {/* Batch No */}
                            <td className="px-3 py-2">
                            <input
                                type="text"
                                value={row.batchNo}
                                onChange={(e) => setParentTableData(prev =>
                                prev.map(r =>
                                    r.id === row.id ? { ...r, batchNo: e.target.value } : r
                                )
                                )}
                                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            </td>

                            {/* Bin */}
                            <td className="px-3 py-2">
                            <select
                                value={row.bin}
                                onChange={(e) => {
                                const selectedBin = binOptions.find(b => b.bin === e.target.value);
                                if (selectedBin) {
                                    setParentTableData(prev =>
                                    prev.map(r =>
                                        r.id === row.id
                                        ? {
                                            ...r,
                                            bin: e.target.value,
                                            binClass: selectedBin.binClass || "",
                                            binType: selectedBin.binType || "",
                                            cellType: selectedBin.cellType || "",
                                            core: selectedBin.core || "",
                                            }
                                        : r
                                    )
                                    );
                                }
                                }}
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
        </div>
        </div>
    );
    };

    export default KittingForm;