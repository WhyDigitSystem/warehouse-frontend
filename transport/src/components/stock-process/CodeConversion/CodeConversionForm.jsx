import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  List,
  Grid,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { codeconversionAPI } from "../../../api/codeconversionAPI";
import { useToast } from "../../Toast/ToastContext";
import dayjs from "dayjs";

const CodeConversionForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillGridOpen, setFillGridOpen] = useState(false);
  const [selectedModalRows, setSelectedModalRows] = useState([]);
  const [modalFilters, setModalFilters] = useState({
    partNo: "",
    grnNo: "",
  });
  const [modalTableData, setModalTableData] = useState([]);
  const [filteredModalData, setFilteredModalData] = useState([]);
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPartNo, setLoadingPartNo] = useState(false);
  const [loadingCPartNo, setLoadingCPartNo] = useState(false);
  const [loadingCBin, setLoadingCBin] = useState(false);

  // Data lists
  const [partNoList, setPartNoList] = useState([]);
  const [cPartNoList, setCPartNoList] = useState([]);
  const [cBinList, setCBinList] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs().format("YYYY-MM-DD"),
    remarks: "",
    freeze: false,
  });

  const [detailTableData, setDetailTableData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize data - only load document ID and edit data if exists
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await getNewDocId();
        if (editData) {
          await loadEditData(editData);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        addToast("Failed to load form data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [editData]);

  // API Functions
  const getNewDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await codeconversionAPI.getCodeConversionDocId(params);
      
      if (response?.paramObjectsMap?.CodeConversionDocId) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.CodeConversionDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

// Load part numbers only when user clicks on dropdown
// Load part numbers only when user clicks on dropdown
const getPartNoDetails = async () => {
  // If already loaded, don't load again
  if (partNoList.length > 0 || loadingPartNo) return;
  
  try {
    setLoadingPartNo(true);
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      warehouse: loginWarehouse
    };

    console.log("Fetching part numbers with params:", params);
    const response = await codeconversionAPI.getPartNoDetails(params);
    
    console.log("Part No API Response:", response);
    
    // Handle different response formats
    if (response?.paramObjectsMap?.codeConversionVO) {
      // Your API response has: partNo, partDesc, sku
      const mappedData = response.paramObjectsMap.codeConversionVO.map(item => ({
        partNo: item.partNo || "",
        partDesc: item.partDesc || "",
        sku: item.sku || "",
        // Add id for React keys
        id: item.id || item.partNo,
      }));
      
      console.log("Mapped Part No Data:", mappedData);
      setPartNoList(mappedData);
    } 
    // Alternative response format
    else if (response?.data && Array.isArray(response.data)) {
      const mappedData = response.data.map(item => ({
        partNo: item.partNo || "",
        partDesc: item.partDesc || "",
        sku: item.sku || "",
        id: item.id || item.partNo,
      }));
      setPartNoList(mappedData);
    }
    // Direct array response
    else if (Array.isArray(response)) {
      const mappedData = response.map(item => ({
        partNo: item.partNo || "",
        partDesc: item.partDesc || "",
        sku: item.sku || "",
        id: item.id || item.partNo,
      }));
      setPartNoList(mappedData);
    }
    else {
      console.warn("Unexpected Part No API response format:", response);
      setPartNoList([]);
    }
  } catch (error) {
    console.error("Error fetching part no list:", error);
    addToast("Failed to fetch part numbers", "error");
    setPartNoList([]);
  } finally {
    setLoadingPartNo(false);
  }
};
  // Load C part numbers only when needed
  const getCPartNoDetails = async () => {
    // If already loaded, don't load again
    if (cPartNoList.length > 0 || loadingCPartNo) return;
    
    try {
      setLoadingCPartNo(true);
      const params = {
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      };

      const response = await codeconversionAPI.getCPartNoDetails(params);
      
      console.log("C Part No API Response:", response);
      
      if (response?.status === true && response.paramObjectsMap?.materialVO) {
        const activeCparts = response.paramObjectsMap.materialVO
          .filter((row) => row.active === "Active")
          .map(({ id, partno, partDesc, sku }) => ({
            id,
            partno,
            partDesc,
            sku,
          }));
        
        setCPartNoList(activeCparts);
      } else if (response?.data && Array.isArray(response.data)) {
        setCPartNoList(response.data);
      }
    } catch (error) {
      console.error("Error fetching C part no list:", error);
      addToast("Failed to fetch C part numbers", "error");
    } finally {
      setLoadingCPartNo(false);
    }
  };

  // Load C bins only when needed
  const getCBinDetails = async () => {
    // If already loaded, don't load again
    if (cBinList.length > 0 || loadingCBin) return;
    
    try {
      setLoadingCBin(true);
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        warehouse: loginWarehouse
      };

      const response = await codeconversionAPI.getCBinDetails(params);
      
      if (response?.paramObjectsMap?.ToBin) {
        setCBinList(response.paramObjectsMap.ToBin);
      }
    } catch (error) {
      console.error("Error fetching C bin list:", error);
      addToast("Failed to fetch C bins", "error");
    } finally {
      setLoadingCBin(false);
    }
  };

  const getGrnNoList = async (partNo, rowId) => {
  try {
    console.log(`Fetching GRN No for part: ${partNo}, row: ${rowId}`);
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      partNo: partNo,
      warehouse: loginWarehouse
    };

    const response = await codeconversionAPI.getGrnNoDetails(params);
    
    console.log("GRN No API Response:", response);
    
    if (response?.paramObjectsMap?.codeConversionVO) {
      console.log("GRN No Data:", response.paramObjectsMap.codeConversionVO);
      setDetailTableData(prev =>
        prev.map(item =>
          item.id === rowId
            ? { ...item, rowGrnNoList: response.paramObjectsMap.codeConversionVO }
            : item
        )
      );
    } else {
      console.warn("No GRN data found in response");
    }
  } catch (error) {
    console.error("Error fetching GRN list:", error);
    addToast("Failed to fetch GRN numbers", "error");
  }
};

const getBinTypeList = async (partNo, grnNo, rowId) => {
  try {
    console.log(`Fetching Bin Type for part: ${partNo}, GRN: ${grnNo}, row: ${rowId}`);
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      partNo: partNo,
      grnNo: grnNo,
      warehouse: loginWarehouse
    };

    const response = await codeconversionAPI.getBinTypeDetails(params);
    
    console.log("Bin Type API Response:", response);
    
    if (response?.paramObjectsMap?.codeConversionVO) {
      console.log("Bin Type Data:", response.paramObjectsMap.codeConversionVO);
      setDetailTableData(prev =>
        prev.map(item =>
          item.id === rowId
            ? { ...item, rowBinTypeList: response.paramObjectsMap.codeConversionVO }
            : item
        )
      );
    } else {
      console.warn("No Bin Type data found in response");
    }
  } catch (error) {
    console.error("Error fetching bin type list:", error);
    addToast("Failed to fetch bin types", "error");
  }
};

const getBatchNoList = async (partNo, grnNo, binType, rowId) => {
  try {
    console.log(`Fetching Batch No for part: ${partNo}, GRN: ${grnNo}, BinType: ${binType}, row: ${rowId}`);
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      partNo: partNo,
      grnNo: grnNo,
      binType: binType,
      warehouse: loginWarehouse
    };

    const response = await codeconversionAPI.getBatchNoDetails(params);
    
    console.log("Batch No API Response:", response);
    
    if (response?.paramObjectsMap?.codeConversionVO) {
      console.log("Batch No Data:", response.paramObjectsMap.codeConversionVO);
      setDetailTableData(prev =>
        prev.map(item =>
          item.id === rowId
            ? { ...item, rowBatchNoList: response.paramObjectsMap.codeConversionVO }
            : item
        )
      );
    } else {
      console.warn("No Batch No data found in response");
    }
  } catch (error) {
    console.error("Error fetching batch no list:", error);
    addToast("Failed to fetch batch numbers", "error");
  }
};

const getBinList = async (partNo, grnNo, binType, batchNo, rowId) => {
  try {
    console.log(`Fetching Bin for part: ${partNo}, GRN: ${grnNo}, BinType: ${binType}, Batch: ${batchNo}, row: ${rowId}`);
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      partNo: partNo,
      grnNo: grnNo,
      binType: binType,
      batchNo: batchNo,
      warehouse: loginWarehouse
    };

    const response = await codeconversionAPI.getBinDetails(params);
    
    console.log("Bin API Response:", response);
    
    if (response?.paramObjectsMap?.codeConversionVO) {
      console.log("Bin Data:", response.paramObjectsMap.codeConversionVO);
      setDetailTableData(prev =>
        prev.map(item =>
          item.id === rowId
            ? { ...item, rowBinList: response.paramObjectsMap.codeConversionVO }
            : item
        )
      );
    } else {
      console.warn("No Bin data found in response");
    }
  } catch (error) {
    console.error("Error fetching bin list:", error);
    addToast("Failed to fetch bins", "error");
  }
};

  const getAvailableQty = async (partNo, grnNo, binType, batchNo, bin, rowId) => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        partNo: partNo,
        grnNo: grnNo,
        binType: binType,
        batchNo: batchNo,
        bin: bin,
        warehouse: loginWarehouse
      };

      const response = await codeconversionAPI.getAvailableQty(params);
      
      if (response?.paramObjectsMap?.AvgQty) {
        setDetailTableData(prev =>
          prev.map(item =>
            item.id === rowId
              ? { ...item, qty: response.paramObjectsMap.AvgQty }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
      addToast("Failed to fetch available quantity", "error");
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Item Handlers
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDescription: "",
      grnNo: "",
      binType: "",
      batchNo: "",
      bin: "",
      qty: "",
      actualQty: "",
      convertQty: "",
      cpartNo: "",
      cpartDesc: "",
      csku: "",
      cbin: "",
      remarks: "",
      rowGrnNoList: [],
      rowBinTypeList: [],
      rowBatchNoList: [],
      rowBinList: [],
    };
    setDetailTableData([...detailTableData, newItem]);
  };

  const handleDeleteItem = (id) => {
    setDetailTableData(detailTableData.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setDetailTableData(prev =>
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Dropdown change handlers
  const handlePartNoChange = (id, value) => {
    const selectedPart = partNoList.find(part => part.partNo === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDescription: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              // Clear dependent fields
              rowGrnNoList: [],
              grnNo: "",
              rowBinTypeList: [],
              binType: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      getGrnNoList(value, id);
    }
  };

  const handleGrnNoChange = (id, value) => {
    const selectedGrn = detailTableData
      .find(item => item.id === id)
      ?.rowGrnNoList?.find(grn => grn.grnNo === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              // Clear dependent fields
              rowBinTypeList: [],
              binType: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const item = detailTableData.find(item => item.id === id);
      if (item?.partNo) {
        getBinTypeList(item.partNo, value, id);
      }
    }
  };

  const handleBinTypeChange = (id, value) => {
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              binType: value,
              // Clear dependent fields
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const item = detailTableData.find(item => item.id === id);
      if (item?.partNo && item?.grnNo) {
        getBatchNoList(item.partNo, item.grnNo, value, id);
      }
    }
  };

  const handleBatchNoChange = (id, value) => {
    const selectedBatch = detailTableData
      .find(item => item.id === id)
      ?.rowBatchNoList?.find(batch => batch.batchNo === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batchNo || "",
              // Clear dependent fields
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const item = detailTableData.find(item => item.id === id);
      if (item?.partNo && item?.grnNo && item?.binType) {
        getBinList(item.partNo, item.grnNo, item.binType, value, id);
      }
    }
  };

  const handleBinChange = (id, value) => {
    const selectedBin = detailTableData
      .find(item => item.id === id)
      ?.rowBinList?.find(bin => bin.bin === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              bin: selectedBin?.bin || "",
            }
          : item
      )
    );

    if (value) {
      const item = detailTableData.find(item => item.id === id);
      if (item?.partNo && item?.grnNo && item?.binType && item?.batchNo) {
        getAvailableQty(item.partNo, item.grnNo, item.binType, item.batchNo, value, id);
      }
    }
  };

  // Add this useEffect to debug state changes
useEffect(() => {
  console.log("Part No List updated:", partNoList);
}, [partNoList]);

useEffect(() => {
  console.log("Detail Table Data updated:", detailTableData);
}, [detailTableData]);

  const handleCPartNoChange = (id, value) => {
    const selectedCPart = cPartNoList.find(part => part.partno === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              cpartNo: selectedCPart?.partno || "",
              cpartDesc: selectedCPart?.partDesc || "",
              csku: selectedCPart?.sku || "",
            }
          : item
      )
    );
  };

  const handleCBinChange = (id, value) => {
    const selectedCBin = cBinList.find(bin => bin.bin === value);
    
    setDetailTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              cbin: selectedCBin?.bin || "",
            }
          : item
      )
    );
  };

  // Load Edit Data
  const loadEditData = async (record) => {
    setEditId(record.id);
    try {
      setFormData({
        docId: record.docId || "",
        docDate: record.docDate ? dayjs(record.docDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        remarks: record.remarks || "",
        freeze: record.freeze || false,
      });

      if (record.codeConversionDetailsVO?.length > 0) {
        const mappedTableData = record.codeConversionDetailsVO.map((detail, index) => ({
          id: detail.id || Date.now() + index,
          partNo: detail.partNo || "",
          partDescription: detail.partDesc || "",
          grnNo: detail.grnNo || "",
          binType: detail.binType || "",
          batchNo: detail.batchNo || "",
          bin: detail.bin || "",
          qty: detail.qty || "",
          actualQty: detail.actualQty || "",
          convertQty: detail.convertQty || "",
          cpartNo: detail.cpartNo || "",
          cpartDesc: detail.cpartDesc || "",
          csku: detail.csku || "",
          cbin: detail.cbin || "",
          remarks: detail.remarks || "",
          // Initialize empty lists - they will be populated
          rowGrnNoList: [],
          rowBinTypeList: [],
          rowBatchNoList: [],
          rowBinList: [],
        }));

        setDetailTableData(mappedTableData);
      }
    } catch (error) {
      console.error("Error loading edit data:", error);
      addToast("Failed to load edit data", "error");
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs().format("YYYY-MM-DD"),
      remarks: "",
      freeze: false,
    });
    setDetailTableData([]);
    setEditId("");
    setFieldErrors({});
    getNewDocId();
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    
    const errors = {};

    // Validate required fields
    if (detailTableData.length === 0) {
      addToast("Please add at least one item", "error");
      return;
    }

    // Validate table data
    let tableDataValid = true;
    detailTableData.forEach((row) => {
      if (!row.partNo || !row.grnNo || !row.binType || !row.batchNo || !row.bin || 
          !row.actualQty || !row.convertQty || !row.cpartNo || !row.cbin) {
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
      const saveData = {
        ...(editId && { id: parseInt(editId) }),
        ...formData,
        docDate: formData.docDate,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        orgId: parseInt(orgId),
        createdBy: loginUserName,
        codeConversionDetailsDTO: detailTableData.map((item) => ({
          ...(editId && { id: item.id }),
          partNo: item.partNo,
          partDesc: item.partDescription,
          grnNo: item.grnNo,
          binType: item.binType,
          batchNo: item.batchNo,
          bin: item.bin,
          qty: parseFloat(item.qty) || 0,
          actualQty: parseFloat(item.actualQty) || 0,
          convertQty: parseFloat(item.convertQty) || 0,
          cpartNo: item.cpartNo,
          cpartDesc: item.cpartDesc,
          csku: item.csku,
          cbin: item.cbin,
          remarks: item.remarks,
        })),
      };

      console.log("Saving data:", saveData);

      const response = await codeconversionAPI.saveCodeConversion(saveData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(editId ? "Code Conversion Updated Successfully" : "Code Conversion created successfully", "success");
        onBack();
      } else {
        const errorMessage = response.message || "Code Conversion creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Code Conversion creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

// Fill Grid Functions
const getFillGridDetails = async () => {
  try {
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      warehouse: loginWarehouse
    };

    const response = await codeconversionAPI.getFillGridDetails(params);

    if (response?.paramObjectsMap?.codeConversionVO) {
      const gridDetails = response.paramObjectsMap.codeConversionVO || [];

      // Map the data correctly from API response
      const modalData = gridDetails.map((row, index) => ({
        id: row.id || index,
        partNo: row.partNo || "",
        partDescription: row.partDesc || "",
        grnNo: row.grnNo || "",
        binType: row.binType || "",
        batchNo: row.batchNo || "",
        bin: row.bin || "",
        qty: row.totalQty || row.qty || 0, // Use totalQty from API
      }));

      console.log("Modal data mapped:", modalData); // Debug log
      
      setModalTableData(modalData);
      setFilteredModalData(modalData);
      setFillGridOpen(true);
    } else {
      addToast("No grid details found", "error");
    }
  } catch (error) {
    console.error("Error fetching fill grid data:", error);
    addToast("Failed to fetch grid details", "error");
  }
};

// Update handleUseFillGridData to use correct field mapping
// Enhanced handleUseFillGridData with better data mapping
const handleUseFillGridData = () => {
  if (selectedModalRows.length === 0) {
    addToast("Please select at least one record", "warning");
    return;
  }

  // Map modal data to table format with proper field mapping
  const enhancedRows = selectedModalRows.map((row, index) => {
    // Find the corresponding item in the original modal data to get all fields
    const originalRow = modalTableData.find(item => item.id === row.id) || row;
    
    return {
      id: Date.now() + index,
      partNo: originalRow.partNo || "",
      partDescription: originalRow.partDescription || originalRow.partDesc || "",
      grnNo: originalRow.grnNo || "",
      binType: originalRow.binType || "",
      batchNo: originalRow.batchNo || "",
      bin: originalRow.bin || "",
      qty: originalRow.totalQty || originalRow.qty || "", // Use totalQty if available
      actualQty: "",
      convertQty: "",
      cpartNo: "",
      cpartDesc: "",
      csku: "",
      cbin: "",
      remarks: "",
      rowGrnNoList: [],
      rowBinTypeList: [],
      rowBatchNoList: [],
      rowBinList: [],
    };
  });

  console.log("Adding rows to table:", enhancedRows); // Debug log
  
  setDetailTableData(prev => [...prev, ...enhancedRows]);
  
  setFillGridOpen(false);
  setModalFilters({ partNo: "", grnNo: "" });
  setSelectedModalRows([]);
  addToast(`Added ${enhancedRows.length} items successfully`, "success");
};


  const handleModalRowSelect = (e, record) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Add to selected rows if not already present
      setSelectedModalRows(prev => {
        if (!prev.some(row => row.id === record.id)) {
          return [...prev, record];
        }
        return prev;
      });
    } else {
      // Remove from selected rows
      setSelectedModalRows(prev => 
        prev.filter(row => row.id !== record.id)
      );
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Select all filtered rows
      setSelectedModalRows([...filteredModalData]);
    } else {
      // Clear all selections
      setSelectedModalRows([]);
    }
  };



  const handleCloseModal = () => {
    setFillGridOpen(false);
    setModalFilters({ partNo: "", grnNo: "" });
    setSelectedModalRows([]);
  };

  // Filter modal data when filters change
  useEffect(() => {
    let filteredData = modalTableData;

    if (modalFilters.partNo) {
      filteredData = filteredData.filter((item) =>
        item.partNo?.toLowerCase().includes(modalFilters.partNo.toLowerCase())
      );
    }

    if (modalFilters.grnNo) {
      filteredData = filteredData.filter((item) =>
        item.grnNo?.toLowerCase().includes(modalFilters.grnNo.toLowerCase())
      );
    }

    setFilteredModalData(filteredData);
  }, [modalTableData, modalFilters]);

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

  const FloatingCheckbox = ({ label, name, checked, onChange, error }) => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="text-sm text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              {editData ? "Edit Code Conversion" : "Create Code Conversion"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Convert part codes between different numbering systems
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
        {/* BASIC INFORMATION SECTION */}
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
              disabled={!!editId}
            />

            <FloatingInput
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />

            <div className="mt-6">
              <FloatingCheckbox
                label="Freeze"
                name="freeze"
                checked={formData.freeze}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* ITEMS TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Code Conversion Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {detailTableData.length}
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
                onClick={getFillGridDetails}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
              >
                <Grid className="h-3 w-3" />
                Fill Grid
              </button>
              <button
                onClick={() => setDetailTableData([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

          {/* Items Table */}
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
                    Part No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    Part Description
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    GRN No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Bin Type *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Batch No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Bin *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Actual Qty *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Convert Qty *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    C Part No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    C Part Desc
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    C SKU
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    C Bin *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {detailTableData.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  detailTableData.map((item, index) => (
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
      console.log(`Part No changed for row ${item.id}:`, e.target.value);
      handlePartNoChange(item.id, e.target.value);
    }}
    onClick={() => {
      console.log(`Part No dropdown clicked for row ${item.id}`);
      getPartNoDetails();
    }}
    onFocus={() => {
      console.log(`Part No dropdown focused for row ${item.id}`);
      getPartNoDetails();
    }}
    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    disabled={loadingPartNo}
  >
    <option value="">Select Part No</option>
    {loadingPartNo ? (
      <option value="" disabled>Loading part numbers...</option>
    ) : (
      partNoList.map((part, index) => {
        console.log(`Rendering part option ${index}:`, part);
        return (
          <option key={part.id || part.partNo || index} value={part.partNo}>
            {part.partNo}
          </option>
        );
      })
    )}
  </select>
                      </td>

                      {/* Part Description */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.partDescription}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* GRN No */}
                      <td className="px-3 py-2">
                         <select
    value={item.grnNo}
    onChange={(e) => {
      console.log(`GRN No changed for row ${item.id}:`, e.target.value);
      handleGrnNoChange(item.id, e.target.value);
    }}
    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    disabled={!item.partNo}
  >
    <option value="">Select GRN No</option>
    {item.rowGrnNoList && item.rowGrnNoList.length > 0 ? (
      item.rowGrnNoList.map((grn, index) => (
        <option key={grn.id || grn.grnNo || index} value={grn.grnNo}>
          {grn.grnNo}
        </option>
      ))
    ) : (
      <option value="" disabled>
        {!item.partNo ? "Select Part No first" : "No GRN numbers available"}
      </option>
    )}
  </select>
                      </td>

                      {/* Bin Type */}
                      <td className="px-3 py-2">
                        <select
                          value={item.binType}
                          onChange={(e) => handleBinTypeChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!item.grnNo}
                        >
                          <option value="">Select Bin Type</option>
                          {item.rowBinTypeList?.map((binType) => (
                            <option key={binType.binType} value={binType.binType}>
                              {binType.binType}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Batch No */}
                      <td className="px-3 py-2">
                        <select
                          value={item.batchNo}
                          onChange={(e) => handleBatchNoChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!item.binType}
                        >
                          <option value="">Select Batch No</option>
                          {item.rowBatchNoList?.map((batch) => (
                            <option key={batch.batchNo} value={batch.batchNo}>
                              {batch.batchNo}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Bin */}
                      <td className="px-3 py-2">
                        <select
                          value={item.bin}
                          onChange={(e) => handleBinChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!item.batchNo}
                        >
                          <option value="">Select Bin</option>
                          {item.rowBinList?.map((bin) => (
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
                          value={item.qty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Actual Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.actualQty}
                          onChange={(e) => handleItemChange(item.id, "actualQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </td>

                      {/* Convert Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.convertQty}
                          onChange={(e) => handleItemChange(item.id, "convertQty", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </td>

                      {/* C Part No */}
                      <td className="px-3 py-2">
                        <select
                          value={item.cpartNo}
                          onChange={(e) => handleCPartNoChange(item.id, e.target.value)}
                          onClick={() => getCPartNoDetails()} // Load on click
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loadingCPartNo}
                        >
                          <option value="">Select C Part No</option>
                          {loadingCPartNo ? (
                            <option value="" disabled>Loading...</option>
                          ) : (
                            cPartNoList.map((part) => (
                              <option key={part.partno} value={part.partno}>
                                {part.partno}
                              </option>
                            ))
                          )}
                        </select>
                      </td>

                      {/* C Part Desc */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.cpartDesc}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* C SKU */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.csku}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* C Bin */}
                      <td className="px-3 py-2">
                        <select
                          value={item.cbin}
                          onChange={(e) => handleCBinChange(item.id, e.target.value)}
                          onClick={() => getCBinDetails()} // Load on click
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loadingCBin}
                        >
                          <option value="">Select C Bin</option>
                          {loadingCBin ? (
                            <option value="" disabled>Loading...</option>
                          ) : (
                            cBinList.map((bin) => (
                              <option key={bin.bin} value={bin.bin}>
                                {bin.bin}
                              </option>
                            ))
                          )}
                        </select>
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
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

      {/* Fill Grid Modal */}
      {fillGridOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fill Grid Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto flex-1">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Part No Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by part number..."
                      value={modalFilters.partNo}
                      onChange={(e) => setModalFilters({...modalFilters, partNo: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GRN No Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by GRN number..."
                      value={modalFilters.grnNo}
                      onChange={(e) => setModalFilters({...modalFilters, grnNo: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => setModalFilters({ partNo: "", grnNo: "" })}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Selection Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={filteredModalData.length > 0 && selectedModalRows.length === filteredModalData.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Select All
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedModalRows.length} selected of {filteredModalData.length} items
                  </span>
                </div>
              </div>

              {/* Modal Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                        Select
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                        S.No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Part No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                        Part Description
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        GRN No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Bin Type
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Batch No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Bin
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredModalData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      filteredModalData.map((row, index) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedModalRows.some(r => r.id === row.id)}
                              onChange={(e) => handleModalRowSelect(e, row)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 text-center text-gray-900 dark:text-white">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.partNo || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.partDescription || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.grnNo || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.binType || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.batchNo || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.bin || "-"}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                            {row.qty || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredModalData.length} items
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUseFillGridData}
                  disabled={selectedModalRows.length === 0}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use Selected ({selectedModalRows.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeConversionForm;