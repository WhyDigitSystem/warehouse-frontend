import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Save,
  Trash2,
  X,
  List,
  Grid,
  FileText,
  Search,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { cyclecountAPI } from "../../../api/cyclecountAPI";
import dayjs from "dayjs";

const CycleCountForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fill Grid Modal States
  const [fillGridOpen, setFillGridOpen] = useState(false);
  const [selectedModalRows, setSelectedModalRows] = useState([]);
  const [modalFilters, setModalFilters] = useState({
    partNo: "",
    bin: "",
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

  // Data lists
  const [partNoList, setPartNoList] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs().format("YYYY-MM-DD"),
    stockStatus: "",
    stockStatusFlag: "",
    statusFlag: "",
    remarks: "",
  });

  const [cycleCountItems, setCycleCountItems] = useState([]);
  const [editId, setEditId] = useState("");

  // Fixed FloatingInput Component
  const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", disabled = false, ...props }) => {
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    
    useEffect(() => {
      // Update focus state based on value
      if (value) {
        setIsFocused(true);
      }
    }, [value]);
    
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(value ? true : false)}
          disabled={disabled}
          className={`peer w-full px-3 py-3 pt-5 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
          } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
          placeholder=" "
          {...props}
        />
        <label 
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            value || isFocused 
              ? "top-1 text-xs text-blue-600 dark:text-blue-400" 
              : "top-3 text-sm text-gray-500 dark:text-gray-400"
          } bg-white dark:bg-gray-700 px-1`}
          onClick={() => inputRef.current?.focus()}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  // Fixed FloatingSelect Component
  const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, disabled = false, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef(null);
    
    useEffect(() => {
      if (value) {
        setIsFocused(true);
      }
    }, [value]);
    
    return (
      <div className="relative">
        <select
          ref={selectRef}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(value ? true : false)}
          disabled={disabled}
          className={`peer w-full px-3 py-3 pt-5 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
          } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
          {...props}
        >
          <option value="" className="text-gray-400">Select {label}</option>
          {options?.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        <label 
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            value || isFocused 
              ? "top-1 text-xs text-blue-600 dark:text-blue-400" 
              : "top-3 text-sm text-gray-500 dark:text-gray-400"
          } bg-white dark:bg-gray-700 px-1`}
          onClick={() => selectRef.current?.focus()}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await getDocId();
        if (editData) {
          await loadEditData(editData);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [editData]);

  // ========== API Functions ==========
  const getDocId = async () => {
    try {
      const params = {
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await cyclecountAPI.getCycleCountDocId(params);
      
      if (response?.paramObjectsMap?.CycleCountInDocId) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.CycleCountInDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
    }
  };

const getPartNoList = async (stockStatusFlag) => {
  try {
    // Show loading state for part numbers
    setPartNoList([]);
    
    const response = await cyclecountAPI.getPartNoByCycleCount({
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
      status: stockStatusFlag,
      warehouse: loginWarehouse
    });
    
    console.log("API Response for Part Numbers:", response); // Debug log
    
    if (response?.paramObjectsMap?.cycleCountPartNo) {
      console.log("Part No List Data:", response.paramObjectsMap.cycleCountPartNo); // Debug log
      setPartNoList(response.paramObjectsMap.cycleCountPartNo);
    }
  } catch (error) {
    console.error("Error fetching part numbers:", error);
  }
};

  // Optimized API calls with Promise.all
  const getGrnNoList = async (id, partNo) => {
    try {
      // Update the row immediately with loading state
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, rowGrnNoList: [], isLoadingGrn: true }
            : item
        )
      );

      const response = await cyclecountAPI.getGrnNoByCycleCount({
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        partNo: partNo,
        status: formData.stockStatusFlag,
        warehouse: loginWarehouse
      });
      
      if (response?.paramObjectsMap?.cycleCountGrnNo) {
        setCycleCountItems(prev =>
          prev.map(item =>
            item.id === id
              ? { 
                  ...item, 
                  rowGrnNoList: response.paramObjectsMap.cycleCountGrnNo,
                  isLoadingGrn: false 
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, isLoadingGrn: false }
            : item
        )
      );
    }
  };

  const getBatchNoList = async (id, grnNo, partNo) => {
    try {
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, rowBatchNoList: [], isLoadingBatch: true }
            : item
        )
      );

      const response = await cyclecountAPI.getBatchByCycleCount({
        branchCode: loginBranchCode,
        client: loginClient,
        grnNO: grnNo,
        orgId: orgId,
        partNo: partNo,
        status: formData.stockStatusFlag,
        warehouse: loginWarehouse
      });
      
      if (response?.paramObjectsMap?.cycleCountBatch) {
        setCycleCountItems(prev =>
          prev.map(item =>
            item.id === id
              ? { 
                  ...item, 
                  rowBatchNoList: response.paramObjectsMap.cycleCountBatch,
                  isLoadingBatch: false 
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching batch numbers:", error);
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, isLoadingBatch: false }
            : item
        )
      );
    }
  };

  const getBinList = async (id, batchNo, grnNo, partNo) => {
    try {
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, rowBinList: [], isLoadingBin: true }
            : item
        )
      );

      const response = await cyclecountAPI.getBinDetailsByCycleCount({
        batch: batchNo,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNO: grnNo,
        orgId: orgId,
        partNo: partNo,
        status: formData.stockStatusFlag,
        warehouse: loginWarehouse
      });
      
      if (response?.paramObjectsMap?.cycleBinDetails) {
        setCycleCountItems(prev =>
          prev.map(item =>
            item.id === id
              ? { 
                  ...item, 
                  rowBinList: response.paramObjectsMap.cycleBinDetails,
                  isLoadingBin: false 
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
      setCycleCountItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, isLoadingBin: false }
            : item
        )
      );
    }
  };

  const getAvlQty = async (id, bin, batchNo, grnNo, partNo) => {
    try {
      const response = await cyclecountAPI.getAvlQtyByCycleCount({
        batch: batchNo,
        bin: bin,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNO: grnNo,
        orgId: orgId,
        partNo: partNo,
        status: formData.stockStatusFlag,
        warehouse: loginWarehouse
      });
      
      if (response?.paramObjectsMap?.avlQty) {
        setCycleCountItems(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  avlQty: response.paramObjectsMap.avlQty[0]?.avlQty || 0,
                  status: response.paramObjectsMap.avlQty[0]?.status || "",
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }
  };

  // ========== Fill Grid Functions ==========
  const getFillGridDetails = async () => {
    try {
      if (!formData.stockStatusFlag) {
        alert("Please select Stock Status first");
        return;
      }

      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        status: formData.stockStatusFlag,
        warehouse: loginWarehouse
      };

      const response = await cyclecountAPI.getCycleCountGridDetails(params);

      if (response?.paramObjectsMap?.cycleCountGrid) {
        const gridDetails = response.paramObjectsMap.cycleCountGrid || [];

        // Format modal data similar to Stock Restate
        const modalData = gridDetails.map((row, index) => ({
          id: row.id || Date.now() + index,
          bin: row.bin || "",
          partNo: row.partNo || "",
          partDesc: row.partDesc || "",
          batchNo: row.batchNo || "",
          systemQty: row.systemQty || 0,
          countedQty: row.countedQty || 0,
          variance: row.variance || 0,
          rowPartNoList: [],
          rowGrnNoList: [],
          rowBatchNoList: [],
          rowBinList: [],
        }));

        setModalTableData(modalData);
        setFilteredModalData(modalData);
        setFillGridOpen(true);
      } else {
        alert("No grid details found");
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
      alert("Failed to fetch grid details");
    }
  };

  // ========== Modal Handlers ==========
  const handleModalRowSelect = (e, record) => {
    if (e.target.checked) {
      setSelectedModalRows([...selectedModalRows, record]);
    } else {
      setSelectedModalRows(
        selectedModalRows.filter((row) => row.id !== record.id)
      );
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedModalRows([...filteredModalData]);
    } else {
      setSelectedModalRows([]);
    }
  };

  const handleUseFillGridData = async () => {
    if (selectedModalRows.length === 0) {
      alert("Please select at least one record");
      return;
    }

    // Create new items with unique IDs
    const enhancedRows = selectedModalRows.map((row, index) => ({
      id: Date.now() + index,
      partNo: row.partNo || "",
      partDesc: row.partDesc || "",
      sku: "",
      grnNo: "",
      batchNo: row.batchNo || "",
      bin: row.bin || "",
      binType: "",
      core: "",
      avlQty: row.systemQty || 0,
      actualQty: "",
      isLoadingGrn: false,
      isLoadingBatch: false,
      isLoadingBin: false,
      rowGrnNoList: [],
      rowBatchNoList: [],
      rowBinList: [],
    }));

    // Add all rows first
    setCycleCountItems(prev => [...prev, ...enhancedRows]);
    
    // Then fetch dropdown lists sequentially to avoid blocking
    for (const row of enhancedRows) {
      if (row.partNo) {
        await getGrnNoList(row.id, row.partNo);
      }
    }

    setFillGridOpen(false);
    setModalFilters({ partNo: "", bin: "" });
    setSelectedModalRows([]);
  };

  const handleCloseModal = () => {
    setFillGridOpen(false);
    setModalFilters({ partNo: "", bin: "" });
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

    if (modalFilters.bin) {
      filteredData = filteredData.filter((item) =>
        item.bin?.toLowerCase().includes(modalFilters.bin.toLowerCase())
      );
    }

    setFilteredModalData(filteredData);
  }, [modalTableData, modalFilters]);

  // ========== Form Handlers ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockStatusChange = async (value) => {
    const flag =
      value === "DEFECTIVE" ? "D" :
      value === "HOLD" ? "H" :
      value === "RELEASE" ? "R" :
      value === "VAS" ? "V" : "";
    
    setFormData(prev => ({
      ...prev,
      stockStatus: value,
      stockStatusFlag: flag,
      statusFlag: flag,
    }));
    
    // Clear existing items when status changes
    setCycleCountItems([]);
    
    // Load part numbers asynchronously
    if (flag) {
      await getPartNoList(flag);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      batchNo: "",
      bin: "",
      binType: "",
      core: "",
      avlQty: "",
      actualQty: "",
      isLoadingGrn: false,
      isLoadingBatch: false,
      isLoadingBin: false,
      rowGrnNoList: [],
      rowBatchNoList: [],
      rowBinList: [],
    };
    setCycleCountItems([...cycleCountItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setCycleCountItems(cycleCountItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setCycleCountItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePartNoChange = async (id, value) => {
    const selectedPart = partNoList.find(part => part.partNo === value);
    
    setCycleCountItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              rowGrnNoList: [],
              grnNo: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
              binClass: "Fixed",
              isLoadingGrn: true,
              isLoadingBatch: false,
              isLoadingBin: false,
            }
          : item
      )
    );

    if (value) {
      await getGrnNoList(id, value);
    }
  };

  const handleGrnNoChange = async (id, value) => {
    const selectedGrn = cycleCountItems
      .find(item => item.id === id)
      ?.rowGrnNoList.find(grn => grn.grnNo === value);
    
    setCycleCountItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
              isLoadingBatch: true,
              isLoadingBin: false,
            }
          : item
      )
    );

    if (value) {
      const item = cycleCountItems.find(item => item.id === id);
      if (item?.partNo) {
        await getBatchNoList(id, value, item.partNo);
      }
    }
  };

  const handleBatchNoChange = async (id, value) => {
    const selectedBatch = cycleCountItems
      .find(item => item.id === id)
      ?.rowBatchNoList.find(batch => batch.batch === value);
    
    setCycleCountItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batch || "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
              isLoadingBin: true,
            }
          : item
      )
    );

    if (value) {
      const item = cycleCountItems.find(item => item.id === id);
      if (item && item.grnNo && item.partNo) {
        await getBinList(id, value, item.grnNo, item.partNo);
      }
    }
  };

  const handleBinChange = async (id, value) => {
    const selectedBin = cycleCountItems
      .find(item => item.id === id)
      ?.rowBinList.find(bin => bin.bin === value);
    
    setCycleCountItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              bin: selectedBin?.bin || "",
              binType: selectedBin?.binType || "",
              core: selectedBin?.core || "",
            }
          : item
      )
    );

    if (value) {
      const item = cycleCountItems.find(item => item.id === id);
      if (item && item.batchNo && item.grnNo && item.partNo) {
        await getAvlQty(id, value, item.batchNo, item.grnNo, item.partNo);
      }
    }
  };

const loadEditData = async (record) => {
  setEditId(record.id);
  try {
    setFormData({
      docId: record.docId || "",
      docDate: record.docDate ? dayjs(record.docDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      stockStatus: record.stockStatus || "",
      stockStatusFlag: record.stockStatusFlag || "",
      statusFlag: record.stockStatusFlag || "",
      remarks: record.remarks || "",
    });

    if (record.cycleCountDetailsVO?.length > 0) {
      const mappedTableData = record.cycleCountDetailsVO.map((detail, index) => ({
        id: detail.id || Date.now() + index,
        partNo: detail.partNo || "",
        partDesc: detail.partDescription || "", // Make sure this is set
        sku: detail.sku || "",
        grnNo: detail.grnNo || "",
        grnDate: detail.grnDate || "",
        batchNo: detail.batchNo || "",
        batchDate: detail.batchDate || "",
        bin: detail.bin || "",
        binType: detail.binType || "",
        binClass: detail.binClass || "",
        cellType: detail.cellType || "",
        expDate: detail.expDate || "",
        qcFlag: detail.qcFlag || "",
        core: detail.core || "",
        avlQty: detail.avlQty || "",
        actualQty: detail.actualQty || "",
        isLoadingGrn: false,
        isLoadingBatch: false,
        isLoadingBin: false,
        rowGrnNoList: [],
        rowBatchNoList: [],
        rowBinList: [],
      }));

      console.log("Loaded edit data:", mappedTableData); // Debug log
      setCycleCountItems(mappedTableData);
      
      // Fetch part numbers for dropdown
      if (record.stockStatusFlag) {
        await getPartNoList(record.stockStatusFlag);
      }
      
      // Fetch dropdown lists for each item in edit mode
      for (const item of mappedTableData) {
        if (item.partNo) {
          await getGrnNoList(item.id, item.partNo);
        }
      }
    }
  } catch (error) {
    console.error("Error loading edit data:", error);
  }
};

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs().format("YYYY-MM-DD"),
      stockStatus: "",
      stockStatusFlag: "",
      statusFlag: "",
      remarks: "",
    });
    setCycleCountItems([]);
    setEditId("");
    getDocId();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.stockStatus) {
        alert("Please select Stock Status");
        setIsSubmitting(false);
        return;
      }

      if (cycleCountItems.length === 0) {
        alert("Please add at least one item");
        setIsSubmitting(false);
        return;
      }

      // Validate all items have required fields
      const invalidItems = cycleCountItems.filter(item => 
        !item.partNo || !item.grnNo || !item.batchNo || !item.bin || !item.actualQty
      );
      
      if (invalidItems.length > 0) {
        alert("Please fill all required fields (*) in the table");
        setIsSubmitting(false);
        return;
      }

      // Format the date correctly
      const formattedDocDate = formData.docDate;

      const saveData = {
        ...(editId && { id: parseInt(editId) }),
        ...formData,
        docDate: formattedDocDate,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        orgId: parseInt(orgId),
        createdBy: loginUserName,
        cycleCountDetailsDTO: cycleCountItems.map((item) => {
          // Find the selected bin details
          const selectedBin = item.rowBinList?.find(
            (bin) => bin.bin === item.bin
          );

          // Find the selected GRN details
          const selectedGrn = item.rowGrnNoList?.find(
            (grn) => grn.grnNo === item.grnNo
          );

          // Find the selected batch details
          const selectedBatch = item.rowBatchNoList?.find(
            (batch) => batch.batch === item.batchNo
          );

          // Format dates
          let formattedGrnDate = "";
          if (selectedGrn?.grnDate) {
            formattedGrnDate = selectedGrn.grnDate.split(" ")[0];
          }

          let formattedBatchDate = "";
          if (selectedBatch?.batchDate) {
            formattedBatchDate = selectedBatch.batchDate.split(" ")[0];
          }

          let formattedExpDate = "";
          if (selectedBatch?.expDate) {
            formattedExpDate = selectedBatch.expDate.split(" ")[0];
          }

          return {
            ...(editId && { id: item.id }),
            partNo: item.partNo,
            partDescription: item.partDesc,
            sku: item.sku,
            grnNo: item.grnNo,
            grnDate: formattedGrnDate,
            binClass: selectedBin?.binClass || "Fixed",
            cellType: selectedBin?.cellType || "",
            expDate: formattedExpDate,
            qcFlag: selectedBin?.qcFlag || "",
            batchNo: item.batchNo,
            batchDate: formattedBatchDate,
            bin: item.bin,
            binType: selectedBin?.binType || "",
            core: selectedBin?.core || "",
            avlQty: parseFloat(item.avlQty) || 0,
            actualQty: parseFloat(item.actualQty) || 0,
          };
        }),
      };

      const response = await cyclecountAPI.saveCycleCount(saveData);

      if (response.status === true) {
        alert(editId ? "Cycle Count updated successfully" : "Cycle Count created successfully");
        handleClear();
        onSaveSuccess && onSaveSuccess();
        onBack();
      } else {
        const errorMessage = response.message || "Failed to save Cycle Count";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving Cycle Count:", error);
      alert("Failed to save Cycle Count");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading indicator component for dropdowns
  const LoadingSpinner = ({ size = "small" }) => (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${
      size === "small" ? "h-3 w-3" : "h-4 w-4"
    }`}></div>
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
              {editData ? "Edit Cycle Count" : "Create Cycle Count"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage inventory cycle counts
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
          {isSubmitting ? (
            <>
              <LoadingSpinner size="small" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3" />
              {editData ? "Update" : "Save"}
            </>
          )}
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

            <FloatingSelect
              label="Stock Status *"
              name="stockStatus"
              value={formData.stockStatus}
              onChange={(name, value) => handleStockStatusChange(value)}
              options={[
                { value: "DEFECTIVE", label: "DEFECTIVE" },
                { value: "HOLD", label: "HOLD" },
                { value: "RELEASE", label: "RELEASE" },
                { value: "VAS", label: "VAS" }
              ]}
              required
            />

            <FloatingInput
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* ITEMS TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cycle Count Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {cycleCountItems.length}
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
                disabled={!formData.stockStatusFlag}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50"
              >
                <Grid className="h-3 w-3" />
                Fill Grid
              </button>
              <button
                onClick={() => setCycleCountItems([])}
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
                    Bin Type
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Core
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Avl Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Actual Qty *
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cycleCountItems.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  cycleCountItems.map((item, index) => (
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
                    {/* Part No */}
<td className="px-3 py-2">
  <div className="relative">
    <select
      value={item.partNo}
      onChange={(e) => handlePartNoChange(item.id, e.target.value)}
      className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      disabled={!formData.stockStatusFlag}
    >
      <option value="">Select Part No</option>
      {/* Debug: Log current options */}
      {console.log("Rendering part options:", partNoList)}
      
      {/* Always show the current value as an option */}
      {item.partNo && !partNoList?.some(p => p.partNo === item.partNo) && (
        <option value={item.partNo} style={{ color: '#666' }}>
          {item.partNo} (Current)
        </option>
      )}
      {partNoList.map((part) => (
        <option key={part.partNo} value={part.partNo}>
          {part.partNo}
        </option>
      ))}
    </select>
    {item.isLoadingGrn && (
      <div className="absolute right-2 top-1.5">
        <LoadingSpinner size="small" />
      </div>
    )}
  </div>
</td>

{/* Part Description - Make sure this field exists and is read-only */}
<td className="px-3 py-2">
  <input
    type="text"
    value={item.partDesc}
    readOnly
    className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
  />
</td>

                      {/* SKU */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.sku}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* GRN No */}
                      <td className="px-3 py-2">
                        <div className="relative">
                          <select
                            value={item.grnNo}
                            onChange={(e) => handleGrnNoChange(item.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!item.partNo || item.isLoadingGrn}
                          >
                            <option value="">Select GRN No</option>
                            {/* Always show the current value as an option */}
                            {item.grnNo && !item.rowGrnNoList?.some(g => g.grnNo === item.grnNo) && (
                              <option value={item.grnNo} style={{ color: '#666' }}>
                                {item.grnNo} (Current)
                              </option>
                            )}
                            {item.rowGrnNoList?.map((grn) => (
                              <option key={grn.grnNo} value={grn.grnNo}>
                                {grn.grnNo}
                              </option>
                            ))}
                          </select>
                          {item.isLoadingBatch && (
                            <div className="absolute right-2 top-1.5">
                              <LoadingSpinner size="small" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Batch No */}
                      <td className="px-3 py-2">
                        <div className="relative">
                          <select
                            value={item.batchNo}
                            onChange={(e) => handleBatchNoChange(item.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!item.grnNo || item.isLoadingBatch}
                          >
                            <option value="">Select Batch No</option>
                            {/* Always show the current value as an option */}
                            {item.batchNo && !item.rowBatchNoList?.some(b => b.batch === item.batchNo) && (
                              <option value={item.batchNo} style={{ color: '#666' }}>
                                {item.batchNo} (Current)
                              </option>
                            )}
                            {item.rowBatchNoList?.map((batch) => (
                              <option key={batch.batch} value={batch.batch}>
                                {batch.batch}
                              </option>
                            ))}
                          </select>
                          {item.isLoadingBin && (
                            <div className="absolute right-2 top-1.5">
                              <LoadingSpinner size="small" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Bin */}
                      <td className="px-3 py-2">
                        <div className="relative">
                          <select
                            value={item.bin}
                            onChange={(e) => handleBinChange(item.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!item.batchNo || item.isLoadingBin}
                          >
                            <option value="">Select Bin</option>
                            {/* Always show the current value as an option */}
                            {item.bin && !item.rowBinList?.some(b => b.bin === item.bin) && (
                              <option value={item.bin} style={{ color: '#666' }}>
                                {item.bin} (Current)
                              </option>
                            )}
                            {item.rowBinList?.map((bin) => (
                              <option key={bin.bin} value={bin.bin}>
                                {bin.bin}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Bin Type */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.binType}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Core */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.core}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Avl Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.avlQty}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Actual Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.actualQty}
                          onChange={(e) => {
                            const value = e.target.value;
                            const intPattern = /^\d*$/;
                            if (intPattern.test(value) || value === "") {
                              handleItemChange(item.id, "actualQty", value);
                            }
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
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
                    Bin Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by bin..."
                      value={modalFilters.bin}
                      onChange={(e) => setModalFilters({...modalFilters, bin: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => setModalFilters({ partNo: "", bin: "" })}
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
                        Bin
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Part No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                        Part Description
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Batch No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        System Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Counted Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                        Variance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredModalData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedModalRows.some(r => r.id === row.id)}
                            onChange={(e) => handleModalRowSelect(e, row)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">{index + 1}</td>
                        <td className="px-3 py-2">{row.bin}</td>
                        <td className="px-3 py-2">{row.partNo}</td>
                        <td className="px-3 py-2">{row.partDesc}</td>
                        <td className="px-3 py-2">{row.batchNo}</td>
                        <td className="px-3 py-2 text-right">{row.systemQty || 0}</td>
                        <td className="px-3 py-2 text-right">{row.countedQty || 0}</td>
                        <td className="px-3 py-2 text-right">{row.variance || 0}</td>
                      </tr>
                    ))}
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

export default CycleCountForm;