import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  Upload,
  Download,
  List,
  Grid,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { stockrestateAPI } from "../../../api/stockrestateAPI";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import { useToast } from "../../Toast/ToastContext";
import sampleFile from "../../../assets/sample-files/sample_Stock_Restate_.xls";
import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const StockRestateForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fillGridOpen, setFillGridOpen] = useState(false);
  const [selectedModalRows, setSelectedModalRows] = useState([]);
  const [modalFilters, setModalFilters] = useState({
    partNo: "",
    fromBin: "",
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

  const [fromBinList, setFromBinList] = useState([]);
  const [toBinList, setToBinList] = useState([]);

  const [editId, setEditId] = useState("");

  const transferType = [
    { name: "HOLD", value: "HOLD" },
    { name: "DEFECTIVE", value: "DEFECTIVE" },
    { name: "RELEASE", value: "RELEASE" },
    { name: "VAS", value: "VAS" },
  ];

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs().format("YYYY-MM-DD"),
    transferFrom: "",
    transferTo: "",
    transferFromFlag: "",
    transferToFlag: "",
    entryNo: "",
  });

  const [detailTableData, setDetailTableData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize data
  useEffect(() => {
    getNewDocId();

    if (editData) {
      loadEditData(editData);
    }
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

      const response = await stockrestateAPI.getStockRestateDocId(params);
      
      if (response?.paramObjectsMap?.StockRestateDocId) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.StockRestateDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

// Update getGrnNo to accept transferFromFlag as a parameter
const getGrnNo = async (selectedRowPartNo, selectedRowFromBin) => {
  try {
    // Get flag from formData
    const currentTransferFromFlag = formData.transferFromFlag;
    
    if (!currentTransferFromFlag) {
      console.warn("Transfer From Flag is empty");
      return [];
    }

    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: selectedRowFromBin,
      orgId: orgId,
      partNo: selectedRowPartNo,
      tranferFromFlag: currentTransferFromFlag, // Use from formData
      warehouse: loginWarehouse
    };
    console.log("Fetching GRN with params:", params); // Debug log
    
    const response = await stockrestateAPI.getGrnNoDetails(params);
    
    return response?.paramObjectsMap?.grnNoDetails || [];
  } catch (error) {
    console.error("Error fetching GRN no list:", error);
    addToast("Failed to fetch GRN no list", "error");
    return [];
  }
};

// Update getBatchNo to accept transferFromFlag as a parameter
const getBatchNo = async (selectedFromBin, selectedPartNo, selectedGrnNo, transferFromFlag) => {
  try {
    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: selectedFromBin,
      grnNo: selectedGrnNo,
      orgId: orgId,
      partNo: selectedPartNo,
      tranferFromFlag: transferFromFlag,
      warehouse: loginWarehouse
    };

    console.log("Fetching Batch with params:", params); // Debug log
    
    const response = await stockrestateAPI.getBatchNoDetails(params);
    
    return response?.paramObjectsMap?.batchNoDetails || [];
  } catch (error) {
    console.error("Error fetching batch no list:", error);
    addToast("Failed to fetch batch no list", "error");
    return [];
  }
};

// Update handlePartNoChange to pass transferFromFlag
const handlePartNoChange = async (id, value) => {
  const row = detailTableData.find((item) => item.id === id);
  const selectedPart = row.rowPartNoList?.find(
    (part) => part.partNo === value
  );
  
  // Fetch GRN list for this specific row
  let grnList = [];
  if (value && row.fromBin) {
    grnList = await getGrnNo(value, row.fromBin, formData.transferFromFlag);
  }
  
  setDetailTableData((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            partNo: selectedPart?.partNo || "",
            partDesc: selectedPart?.partDesc || "",
            sku: selectedPart?.sku || "",
            // Store GRN list in row-specific data
            rowGrnNoList: grnList,
            // Clear dependent fields
            grnNo: "",
            grnDate: "",
            rowBatchNoList: [], // Clear batch list
            batchNo: "",
            batchDate: "",
            expDate: "",
            fromQty: "",
            toQty: "",
            remainQty: "",
          }
        : item
    )
  );
};

// Update handleGrnNoChange to pass transferFromFlag
const handleGrnNoChange = async (id, value) => {
  const row = detailTableData.find((item) => item.id === id);
  const selectedGrnNo = row.rowGrnNoList?.find((grn) => grn.grnNo === value);
  
  // Fetch batch list for this specific row
  let batchList = [];
  if (value && row.partNo && row.fromBin) {
    batchList = await getBatchNo(row.fromBin, row.partNo, value, formData.transferFromFlag);
  }
  
  setDetailTableData((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            grnNo: selectedGrnNo?.grnNo || "",
            grnDate: selectedGrnNo?.grnDate || "",
            // Store batch list in row-specific data
            rowBatchNoList: batchList,
            // Clear dependent fields
            batchNo: "",
            batchDate: "",
            expDate: "",
            fromQty: "",
            toQty: "",
            remainQty: "",
          }
        : item
    )
  );
};

const getPartNo = async (selectedFromBin, row) => {
  try {
    // Get the current transferFromFlag - check formData first
    const currentTransferFromFlag = formData.transferFromFlag || 
                                   (editData && editData.transferFromFlag) || 
                                   "";
    
    if (!currentTransferFromFlag) {
      console.warn("Transfer From Flag is empty, cannot fetch part numbers");
      return;
    }

    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: selectedFromBin,
      orgId: orgId,
      tranferFromFlag: currentTransferFromFlag, // Use the current flag
      warehouse: loginWarehouse
    };

    console.log("Fetching Part No with params:", params);
    
    const response = await stockrestateAPI.getPartNoDetails(params);
    
    if (response?.paramObjectsMap?.partNoDetails) {
      setDetailTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowPartNoList: response.paramObjectsMap.partNoDetails,
                // Clear dependent fields when part number changes
                partNo: "",
                partDesc: "",
                sku: "",
                grnNo: "",
                batchNo: "",
                fromQty: "",
                toQty: "",
                remainQty: "",
              }
            : r
        )
      );
    }
  } catch (error) {
    console.error("Error fetching part no list:", error);
    addToast("Failed to fetch part no list", "error");
  }
};
const handleSelectChange = (name, value) => {
  if (fieldErrors[name]) {
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
  }

  if (name === "transferFrom") {
    const transferFromFlag = getTransferFlag(value);
    
    // Ensure we have a valid flag before proceeding
    if (!transferFromFlag) {
      addToast("Invalid transfer type selected", "error");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      transferFrom: value,
      transferFromFlag: transferFromFlag,
    }));
    
    // Call getFromBin with the flag
    getFromBin(transferFromFlag);
    
    // Clear table data when transferFrom changes
    setDetailTableData([]);
    
  } else if (name === "transferTo") {
    const transferToFlag = getTransferFlag(value);
    
    // Only getToBinDetails if transferFromFlag is already set
    if (formData.transferFromFlag) {
      getToBinDetails(formData.transferFromFlag);
    }
    
    setFormData(prev => ({
      ...prev,
      transferTo: value,
      transferToFlag: transferToFlag,
    }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

useEffect(() => {
  // Fetch From Bin when transferFromFlag changes
  if (formData.transferFromFlag) {
    getFromBin(formData.transferFromFlag);
  }
}, [formData.transferFromFlag]);

// Also fetch To Bin when both flags are available
useEffect(() => {
  if (formData.transferFromFlag && formData.transferToFlag) {
    getToBinDetails(formData.transferFromFlag);
  }

}, [formData.transferFromFlag, formData.transferToFlag]);


// Update getFromQty to use correct transferFromFlag
const getFromQty = async (selectedBatchNo, selectedFromBin, selectedGrnNo, selectedPartNo, row) => {
  try {
    const params = {
      batchNo: selectedBatchNo,
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: selectedFromBin,
      grnNo: selectedGrnNo,
      orgId: orgId,
      partNo: selectedPartNo,
      tranferFromFlag: formData.transferFromFlag,
      warehouse: loginWarehouse
    };

    console.log("Fetching From Qty with params:", params); // Debug log
    
    const response = await stockrestateAPI.getFromQty(params);
    
    if (response?.paramObjectsMap?.fromQty) {
      setDetailTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                fromQty: response.paramObjectsMap.fromQty || r.fromQty,
              }
            : r
        )
      );
    }
  } catch (error) {
    console.error("Error fetching from quantity:", error);
    addToast("Failed to fetch from quantity", "error");
  }
};

// Update fetchAndSetGrnNoList
const fetchAndSetGrnNoList = async (row) => {
  try {
    const grnList = await getGrnNo(row.partNo, row.fromBin, formData.transferFromFlag);
    setDetailTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? { ...r, rowGrnNoList: grnList }
          : r
      )
    );
  } catch (error) {
    console.error("Error fetching GRN list for edit:", error);
  }
};

// Update fetchAndSetBatchNoList
const fetchAndSetBatchNoList = async (row) => {
  try {
    const batchList = await getBatchNo(row.fromBin, row.partNo, row.grnNo, formData.transferFromFlag);
    setDetailTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? { ...r, rowBatchNoList: batchList }
          : r
      )
    );
  } catch (error) {
    console.error("Error fetching batch list for edit:", error);
  }
};

const fetchAndSetPartNoList = async (row) => {
  try {
    // Use the current transferFromFlag from formData
    const currentTransferFromFlag = formData.transferFromFlag;
    
    if (!currentTransferFromFlag) {
      console.warn("Transfer From Flag is not set");
      return;
    }

    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: row.fromBin,
      orgId: orgId,
      tranferFromFlag: currentTransferFromFlag,
      warehouse: loginWarehouse
    };

    console.log("Fetching Part No with params:", params);

    const response = await stockrestateAPI.getPartNoDetails(params);
    
    if (response?.paramObjectsMap?.partNoDetails) {
      setDetailTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowPartNoList: response.paramObjectsMap.partNoDetails || [],
                // If we're editing and the partNo already exists, keep it
                partNo: r.partNo || "",
                partDesc: r.partDesc || "",
                sku: r.sku || "",
              }
            : r
        )
      );
    }
  } catch (error) {
    console.error("Error fetching part no list:", error);
  }
};

console.log("Current detailTableData:", detailTableData);
console.log("Current fromBinList:", fromBinList);
console.log("Current toBinList:", toBinList);

  // Update handleBatchNoChange to use row-specific batch list
  const handleBatchNoChange = (id, value) => {
    const row = detailTableData.find((item) => item.id === id);
    const selectedBatchNo = row.rowBatchNoList?.find(
      (batch) => batch.batchNo === value
    );
    
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatchNo?.batchNo || "",
              batchDate: selectedBatchNo?.batchDate || "",
              expDate: selectedBatchNo?.expDate || "",
            }
          : item
      )
    );
    
    // Fetch from quantity if all required fields are present
    if (value && row.partNo && row.fromBin && row.grnNo) {
      getFromQty(value, row.fromBin, row.grnNo, row.partNo, row);
    }
  };

  // Update handleAddItem to include row-specific list properties
const handleAddItem = () => {
  const newItem = {
    id: Date.now(),
    fromBin: "",
    fromBinClass: "",
    fromBinType: "",
    fromCellType: "",
    fromCore: "",
    partNo: "",
    partDesc: "",
    sku: "",
    grnNo: "",
    grnDate: "",
    batchNo: "",
    batchDate: "",
    expDate: "",
    toBin: "",
    toBinType: "",
    toBinClass: "",
    toCellType: "",
    toCore: "",
    fromQty: "",
    toQty: "",
    remainQty: "",
    qcFlag: "",
    rowPartNoList: [],
    rowGrnNoList: [],
    rowBatchNoList: [],
  };
  setDetailTableData([...detailTableData, newItem]);
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

const getTransferFlag = (value) => {
  if (!value) return "";
  
  switch (value.toUpperCase()) {
    case "DEFECTIVE": return "D";
    case "HOLD": return "H";
    case "RELEASE": return "R";
    case "VAS": return "V";
    default: return "";
  }
};

  const getAvailableTransferTo = (transferFrom) => {
    return transferType.filter((item) => !transferFrom.includes(item.value));
  };

  const handleDeleteItem = (id) => {
    setDetailTableData(detailTableData.filter((item) => item.id !== id));
  };

  // Update handleFromBinChange to pass transferFromFlag to getPartNo
  const handleFromBinChange = (id, value) => {
    const selectedFromBin = fromBinList.find((b) => b.fromBin === value);
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              fromBin: selectedFromBin?.fromBin || "",
              fromBinType: selectedFromBin?.fromBinType || "",
              fromBinClass: selectedFromBin?.fromBinClass || "",
              fromCellType: selectedFromBin?.fromCellType || "",
              fromCore: selectedFromBin?.fromCore || "",
              // Clear dependent fields when from bin changes
              partNo: "",
              partDesc: "",
              sku: "",
              grnNo: "",
              batchNo: "",
              fromQty: "",
              toQty: "",
              remainQty: "",
              rowPartNoList: [],
            }
          : item
      )
    );
    if (value) {
      // Pass the current transferFromFlag to getPartNo
      getPartNo(value, { id }, formData.transferFromFlag);
    }
  };

  // Initialize data
useEffect(() => {
  console.log("EditData in useEffect:", editData); // Debug line
  
  getNewDocId();

  if (editData) {
    console.log("Loading edit data..."); // Debug line
    loadEditData(editData);
  }
}, [editData]);



const loadEditData = async (record) => {
  console.log("loadEditData called with record:", record);
  
  if (!record) {
    console.error("No record provided to loadEditData");
    return;
  }

  setEditId(record.id);
  try {
    const transferFromFlag = record.transferFromFlag || getTransferFlag(record.transferFrom);
    const transferToFlag = record.transferToFlag || getTransferFlag(record.transferTo);
    
    // Set form data first
    setFormData({
      docId: record.docId || "",
      docDate: record.docDate ? dayjs(record.docDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      transferFrom: record.transferFrom || "",
      transferFromFlag: transferFromFlag,
      transferTo: record.transferTo || "",
      transferToFlag: transferToFlag,
      entryNo: record.entryNo || "",
    });

    // Check if details exist
    const hasDetails = record.stockRestateDetailsVO && 
                       Array.isArray(record.stockRestateDetailsVO) && 
                       record.stockRestateDetailsVO.length > 0;
    
    if (hasDetails) {
      // Map the details to table format
      const mappedTableData = record.stockRestateDetailsVO.map((detail, index) => ({
        id: detail.id || Date.now() + index,
        fromBin: detail.fromBin || "",
        fromBinClass: detail.fromBinClass || "",
        fromBinType: detail.fromBinType || "",
        fromCellType: detail.fromCellType || "",
        fromCore: detail.fromCore || "",
        partNo: detail.partNo || "",
        partDesc: detail.partDesc || "",
        sku: detail.sku || "",
        grnNo: detail.grnNo || "",
        grnDate: detail.grnDate || "",
        batchNo: detail.batch || detail.batchNo || "",
        batchDate: detail.batchDate || "",
        expDate: detail.expDate || "",
        toBin: detail.toBin || "",
        toBinType: detail.toBinType || "",
        toBinClass: detail.toBinClass || "",
        toCellType: detail.toCellType || "",
        toCore: detail.toCore || "",
        fromQty: detail.fromQty || 0,
        toQty: detail.toQty || 0,
        remainQty: detail.remainQty || 0,
        qcFlag: detail.qcFlag || "",
        // Initialize empty lists - they will be populated
        rowPartNoList: [],
        rowGrnNoList: [],
        rowBatchNoList: [],
      }));
      
      console.log("Setting table data:", mappedTableData);
      setDetailTableData(mappedTableData);
      
      // IMPORTANT: Fetch dropdown lists for each row after a short delay
      // This ensures the formData.transferFromFlag is set first
      setTimeout(() => {
        mappedTableData.forEach(async (row) => {
          if (row.fromBin) {
            await fetchAndSetPartNoListForEdit(row);
          }
        });
      }, 500);
      
    } else {
      console.warn("No detail data found in the record");
      setDetailTableData([]);
    }

    // Fetch bins
    if (transferFromFlag) {
      await getFromBin(transferFromFlag);
    }
    
    if (transferFromFlag && transferToFlag) {
      await getToBinDetails(transferFromFlag);
    }

  } catch (error) {
    console.error("Error loading edit data:", error);
    addToast("Failed to load edit data", "error");
  }
};
// Add this useEffect to fetch dropdown lists when table data is loaded
useEffect(() => {
  if (detailTableData.length > 0 && formData.transferFromFlag) {
    console.log("Table data loaded, fetching dropdowns...");
    
    detailTableData.forEach(async (row) => {
      // Only fetch if we have fromBin and the lists are empty
      if (row.fromBin && row.rowPartNoList.length === 0) {
        await fetchAndSetPartNoListForEdit(row);
      }
    });
  }
}, [detailTableData, formData.transferFromFlag]);


const fetchAndSetPartNoListForEdit = async (row) => {
  try {
    console.log("Fetching part no list for edit row:", row);
    
    if (!formData.transferFromFlag) {
      console.warn("Transfer From Flag not available yet");
      return;
    }

    const params = {
      branchCode: loginBranchCode,
      client: loginClient,
      fromBin: row.fromBin,
      orgId: orgId,
      tranferFromFlag: formData.transferFromFlag,
      warehouse: loginWarehouse
    };

    console.log("Fetching Part No with params:", params);
    
    const response = await stockrestateAPI.getPartNoDetails(params);
    
    if (response?.paramObjectsMap?.partNoDetails) {
      // Update the row with part no list
      setDetailTableData(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                rowPartNoList: response.paramObjectsMap.partNoDetails || [],
              }
            : r
        )
      );
      
      // After setting part no list, fetch GRN list if we have partNo
      if (row.partNo) {
        await fetchAndSetGrnNoListForEdit(row);
      }
    }
  } catch (error) {
    console.error("Error fetching part no list for edit:", error);
  }
};

const fetchAndSetGrnNoListForEdit = async (row) => {
  try {
    console.log("Fetching GRN list for edit row:", row);
    
    const grnList = await getGrnNo(row.partNo, row.fromBin, formData.transferFromFlag);
    
    setDetailTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              rowGrnNoList: grnList || [],
            }
          : r
      )
    );
    
    // After setting GRN list, fetch batch list if we have grnNo
    if (row.grnNo) {
      await fetchAndSetBatchNoListForEdit(row);
    }
  } catch (error) {
    console.error("Error fetching GRN list for edit:", error);
  }
};

const fetchAndSetBatchNoListForEdit = async (row) => {
  try {
    console.log("Fetching batch list for edit row:", row);
    
    const batchList = await getBatchNo(row.fromBin, row.partNo, row.grnNo, formData.transferFromFlag);
    
    setDetailTableData(prev =>
      prev.map(r =>
        r.id === row.id
          ? {
              ...r,
              rowBatchNoList: batchList || [],
            }
          : r
      )
    );
  } catch (error) {
    console.error("Error fetching batch list for edit:", error);
  }
};

  const handleToBinChange = (id, value) => {
    const selectedToBin = toBinList.find((bin) => bin.toBin === value);
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              toBin: selectedToBin?.toBin || "",
              toBinType: selectedToBin?.tobinType || "",
              toBinClass: selectedToBin?.toBinClass || "",
              toCellType: selectedToBin?.toCellType || "",
              toCore: selectedToBin?.toCore || "",
            }
          : item
      )
    );
  };

  const handleToQtyChange = (id, value) => {
    const numericValue = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    const row = detailTableData.find((item) => item.id === id);
    const numericFromQty = isNaN(parseInt(row.fromQty, 10))
      ? 0
      : parseInt(row.fromQty, 10);

    if (value === "") {
      setDetailTableData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                toQty: "",
                remainQty: "",
              }
            : item
        )
      );
    } else if (/^\d*$/.test(value)) {
      setDetailTableData((prev) => {
        let cumulativeToQty = 0;
        let maxAllowedToQty = numericFromQty;
        let shouldClearSubsequentRows = false;

        return prev.map((item) => {
          if (
            item.fromBin === row.fromBin &&
            item.partNo === row.partNo &&
            item.grnNo === row.grnNo &&
            item.batchNo === row.batchNo
          ) {
            if (item.id === id) {
              maxAllowedToQty = numericFromQty - cumulativeToQty;

              if (numericValue > maxAllowedToQty) {
                addToast(`Cannot exceed ${maxAllowedToQty}`, "error");
                return item;
              }

              cumulativeToQty += numericValue;
            } else {
              cumulativeToQty += isNaN(parseInt(item.toQty, 10))
                ? 0
                : parseInt(item.toQty, 10);
            }

            const newRemainQty = Math.max(numericFromQty - cumulativeToQty, 0);

            if (newRemainQty <= 0) {
              shouldClearSubsequentRows = true;
            }

            if (shouldClearSubsequentRows && item.id > id) {
              return {
                ...item,
                toQty: "",
                remainQty: "",
              };
            }

            return {
              ...item,
              toQty: item.id === id ? value : item.toQty,
              remainQty: newRemainQty,
            };
          }
          return item;
        });
      });
    } else {
      addToast("Only numbers are allowed", "error");
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs().format("YYYY-MM-DD"),
      transferFrom: "",
      transferTo: "",
      transferFromFlag: "",
      transferToFlag: "",
      entryNo: "",
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
    if (!formData.transferFrom || !formData.transferTo) {
      addToast("Please select Transfer From and Transfer To", "error");
      return;
    }

    if (detailTableData.length === 0) {
      addToast("Please add at least one item", "error");
      return;
    }

    // Validate table data
    let tableDataValid = true;
    detailTableData.forEach((row) => {
      if (!row.fromBin || !row.partNo || !row.grnNo || !row.batchNo || !row.toBin || !row.toQty || row.toQty <= 0) {
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
        stockRestateDetailsDTO: detailTableData.map((item) => ({
          ...(editId && { id: item.id }),
          fromBin: item.fromBin,
          fromBinClass: item.fromBinClass,
          fromBinType: item.fromBinType,
          fromCellType: item.fromCellType,
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
          grnNo: item.grnNo,
          grnDate: item.grnDate ? dayjs(item.grnDate).format("YYYY-MM-DD") : null,
          batch: item.batchNo,
          batchDate: item.batchDate ? dayjs(item.batchDate).format("YYYY-MM-DD") : null,
          expDate: item.expDate ? dayjs(item.expDate).format("YYYY-MM-DD") : null,
          toBin: item.toBin,
          toBinType: item.toBinType,
          toBinClass: item.toBinClass,
          toCellType: item.toCellType,
          fromQty: item.fromQty,
          toQty: parseInt(item.toQty) || 0,
          fromCore: item.fromCore,
          toCore: item.toCore,
          qcFlag: item.qcFlag,
        })),
      };

      console.log("Saving data:", saveData);

      const response = await stockrestateAPI.saveStockRestate(saveData);

      if (response.status === true) {
        handleClear();
        onSaveSuccess && onSaveSuccess();
        addToast(editId ? "Stock Restate Updated Successfully" : "Stock Restate created successfully", "success");
        onBack();
      } else {
        const errorMessage = response.message || "Stock Restate creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Stock Restate creation failed";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal Handlers
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

  const handleUseFillGridData = () => {
    if (selectedModalRows.length === 0) {
      addToast("Please select at least one record", "warning");
      return;
    }

    // Add rowPartNoList to each selected row
    const enhancedRows = selectedModalRows.map(row => ({
      ...row,
      rowPartNoList: [], // Initialize empty, will be populated
    }));

    setDetailTableData(enhancedRows);
    
    // Fetch part no list for each row - pass transferFromFlag
    enhancedRows.forEach(async (row) => {
      if (row.fromBin) {
        await fetchAndSetPartNoList(row, formData.transferFromFlag);
      }
    });

    setFillGridOpen(false);
    setModalFilters({ partNo: "", fromBin: "" });
    setSelectedModalRows([]);
    addToast("Selected data applied successfully", "success");
  };

  const handleCloseModal = () => {
    setFillGridOpen(false);
    setModalFilters({ partNo: "", fromBin: "" });
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

    if (modalFilters.fromBin) {
      filteredData = filteredData.filter((item) =>
        item.fromBin?.toLowerCase().includes(modalFilters.fromBin.toLowerCase())
      );
    }

    setFilteredModalData(filteredData);
  }, [modalTableData, modalFilters]);

  // Helper function to get unique from bin list (fix for duplicate keys)
  const getUniqueFromBinList = () => {
    const seen = new Set();
    const uniqueList = [];
    
    fromBinList.forEach((bin, index) => {
      const key = bin.fromBin;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push({ ...bin, uniqueId: `${key}-${index}` });
      }
    });
    
    return uniqueList;
  };

  // Helper function to get unique to bin list (fix for duplicate keys)
  const getUniqueToBinList = () => {
    const seen = new Set();
    const uniqueList = [];
    
    toBinList.forEach((bin, index) => {
      const key = bin.toBin;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push({ ...bin, uniqueId: `${key}-${index}` });
      }
    });
    
    return uniqueList;
  };

  // ADD THE MISSING FUNCTIONS:

  const getFromBin = async (selectedTransferFromFlag) => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        tranferFromFlag: selectedTransferFromFlag || "",
        warehouse: loginWarehouse
      };

      const response = await stockrestateAPI.getFromBinDetails(params);
      
      if (response?.paramObjectsMap?.fromBinDetails) {
        setFromBinList(response.paramObjectsMap.fromBinDetails);
      }
    } catch (error) {
      console.error("Error fetching from bin list:", error);
      addToast("Failed to fetch from bin list", "error");
    }
  };

  const getToBinDetails = async (selectedTransferFromFlag) => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        tranferFromFlag: selectedTransferFromFlag,
        warehouse: loginWarehouse
      };

      const response = await stockrestateAPI.getToBinDetails(params);
      
      if (response?.paramObjectsMap?.toBinDetails) {
        setToBinList(response.paramObjectsMap.toBinDetails);
      }
    } catch (error) {
      console.error("Error fetching to bin list:", error);
      addToast("Failed to fetch to bin list", "error");
    }
  };

  const getFillGridDetails = async () => {
    try {
      if (!formData.transferFromFlag || !formData.transferToFlag) {
        addToast("Please select Transfer From and Transfer To first", "error");
        return;
      }

      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId: orgId,
        tranferFromFlag: formData.transferFromFlag,
        tranferToFlag: formData.transferToFlag,
        warehouse: loginWarehouse,
        entryNo: formData.entryNo
      };

      const response = await stockrestateAPI.getFillGridDetails(params);

      if (response?.paramObjectsMap?.fillGridDetails) {
        const gridDetails = response.paramObjectsMap.fillGridDetails || [];

        const modalData = gridDetails.map((row, index) => ({
          id: row.id || index,
          fromBin: row.fromBin || "",
          fromBinClass: row.fromBinClass || "",
          fromBinType: row.fromBinType || "",
          fromCellType: row.fromCellType || "",
          partNo: row.partNo || "",
          partDesc: row.partDesc || "",
          sku: row.sku || "",
          grnNo: row.grnNo || "",
          grnDate: row.grnDate || "",
          batchNo: row.batchNo || "",
          batchDate: row.batchDate || "",
          expDate: row.expDate || "",
          toBin: row.toBin || "",
          toBinType: row.ToBinType || "",
          toBinClass: row.ToBinClass || "",
          toCellType: row.ToCellType || "",
          fromQty: row.fromQty || 0,
          toQty: row.toQty || 0,
          remainQty: (row.fromQty || 0) - (row.toQty || 0),
          fromCore: row.fromCore || "",
          toCore: row.ToCore || "",
          qcFlag: row.qcFlag || "",
        }));

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
              {editData ? "Edit Stock Restate" : "Create Stock Restate"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage stock restate entries
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
            const link = document.createElement("a");
            link.href = sampleFile;
            link.download = "sample_Stock_Restate.xls";
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
              label="Transfer From *"
              name="transferFrom"
              value={formData.transferFrom}
              onChange={handleSelectChange}
              options={transferType.map(item => ({ 
                value: item.value, 
                label: item.value 
              }))}
              required
            />

            <FloatingSelect
              label="Transfer To *"
              name="transferTo"
              value={formData.transferTo}
              onChange={handleSelectChange}
              options={getAvailableTransferTo(formData.transferFrom).map(item => ({ 
                value: item.value, 
                label: item.value 
              }))}
              required
            />

            <FloatingInput
              label="Entry No"
              name="entryNo"
              value={formData.entryNo}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* ITEMS TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stock Restate Details</h3>
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
                disabled={!formData.transferFromFlag || !formData.transferToFlag}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50"
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
                    From Bin *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    From Bin Type
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    Part No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                    Part Description
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    GRN No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Batch No *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    To Bin *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                    To Bin Type
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    From Qty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    To Qty *
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Remain Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {detailTableData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
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

                      {/* From Bin */}
                      <td className="px-3 py-2">
                        <select
                          value={item.fromBin}
                          onChange={(e) => handleFromBinChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select From Bin</option>
                          {getUniqueFromBinList().map((bin) => (
                            <option key={bin.uniqueId} value={bin.fromBin}>
                              {bin.fromBin}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* From Bin Type */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.fromBinType}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* Part No */}
                      <td className="px-3 py-2">
                        <select
    value={item.partNo}
    onChange={(e) => handlePartNoChange(item.id, e.target.value)}
    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    disabled={!item.fromBin}
  >
    <option value="">Select Part No</option>
    {/* Always show the current value as an option */}
    {item.partNo && !item.rowPartNoList?.some(p => p.partNo === item.partNo) && (
      <option value={item.partNo} style={{ color: '#666' }}>
        {item.partNo} (Current)
      </option>
    )}
    {item.rowPartNoList?.map((part, index) => (
      <option key={`${part.partNo}-${index}`} value={part.partNo}>
        {part.partNo}
      </option>
    ))}
  </select>
                      </td>

                      {/* Part Description */}
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
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* GRN No */}
                      <td className="px-3 py-2">
                      <select
    value={item.grnNo}
    onChange={(e) => handleGrnNoChange(item.id, e.target.value)}
    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    disabled={!item.partNo}
  >
    <option value="">Select GRN No</option>
    {/* Always show the current value as an option */}
    {item.grnNo && !item.rowGrnNoList?.some(g => g.grnNo === item.grnNo) && (
      <option value={item.grnNo} style={{ color: '#666' }}>
        {item.grnNo} (Current)
      </option>
    )}
    {item.rowGrnNoList?.map((grn, index) => (
      <option key={`${grn.grnNo}-${index}`} value={grn.grnNo}>
        {grn.grnNo}
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
    disabled={!item.grnNo}
  >
    <option value="">Select Batch No</option>
    {/* Always show the current value as an option */}
    {item.batchNo && !item.rowBatchNoList?.some(b => b.batchNo === item.batchNo) && (
      <option value={item.batchNo} style={{ color: '#666' }}>
        {item.batchNo} (Current)
      </option>
    )}
    {item.rowBatchNoList?.map((batch, index) => (
      <option key={`${batch.batchNo}-${index}`} value={batch.batchNo}>
        {batch.batchNo}
      </option>
    ))}
  </select>
                      </td>

                      {/* To Bin */}
                      <td className="px-3 py-2">
                        <select
                          value={item.toBin}
                          onChange={(e) => handleToBinChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select To Bin</option>
                          {getUniqueToBinList().map((bin) => (
                            <option key={bin.uniqueId} value={bin.toBin}>
                              {bin.toBin}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* To Bin Type */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.toBinType}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* From Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.fromQty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                      </td>

                      {/* To Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.toQty}
                          onChange={(e) => handleToQtyChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </td>

                      {/* Remain Qty */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.remainQty}
                          readOnly
                          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              From Bin Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by from bin..."
                value={modalFilters.fromBin}
                onChange={(e) => setModalFilters({...modalFilters, fromBin: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setModalFilters({ partNo: "", fromBin: "" })}
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
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={filteredModalData.length > 0 && selectedModalRows.length === filteredModalData.length}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Select All
            </label>
            <span className="text-sm text-gray-600 dark:text-white">
              {selectedModalRows.length} selected of {filteredModalData.length} items
            </span>
          </div>
        </div>

        {/* Modal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider w-12">
                  Select
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider w-12">
                  S.No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[120px]">
                  From Bin
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[120px]">
                  Part No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[200px]">
                  Part Description
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                  GRN No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                  Batch No
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[120px]">
                  To Bin
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                  From Qty
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                  To Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredModalData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      checked={selectedModalRows.some(r => r.id === row.id)}
                      onChange={(e) => handleModalRowSelect(e, row)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white text-center">{index + 1}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.fromBin}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.partNo}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.partDesc}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.grnNo}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.batchNo}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.toBin}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white text-right">{row.fromQty || 0}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white text-right">{row.toQty || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-white">
          Total: {filteredModalData.length} items
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Stock Restate Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload={sampleFile}
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/stockRestate/uploadStockRestate?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Stock Restate"
      />
    </div>
  );
};

export default StockRestateForm;