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
  Table as TableIcon,
  Package,
  Box,
  Layers,
  Barcode,
  Hash,
  Calendar,
  FileText,
  RefreshCw,
  Grid,
  CheckSquare,
  Move,
  Warehouse,
  MapPin,
  Tag,
  FileDigit,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import dayjs from "dayjs";
import { locationmovementAPI } from "../../../api/locationmovementAPI";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import FillGridModal from "./FillGridModal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const LocationMovementForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fillGridModalOpen, setFillGridModalOpen] = useState(false);
  const [fillGridData, setFillGridData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
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

  const [fromBinList, setFromBinList] = useState([]);
  const [toBinList, setToBinList] = useState([]);
  const [editId, setEditId] = useState("");
  const [locationMovementDocId, setLocationMovementDocId] = useState("");

  const [formData, setFormData] = useState({
    docDate: dayjs().format("YYYY-MM-DD"),
    entryNo: "",
    movedQty: "0",
  });

  const [locationMovementItems, setLocationMovementItems] = useState([
    {
      id: Date.now(),
      fromBin: "",
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      batchNo: "",
      avlQty: "",
      toBin: "",
      toBinType: "",
      toQty: "",
      remainQty: "",
      rowPartNoList: [],
      rowGrnNoList: [],
      rowBatchNoList: [],
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize data
  useEffect(() => {
    fetchDocId();
    fetchFromBins();
    fetchToBins();

    if (editData) {
      handleEditLocationMovement(editData);
    }
  }, [editData]);

  // Calculate moved quantity when items change
  useEffect(() => {
    const totalToQty = locationMovementItems.reduce((sum, item) => {
      return sum + (parseFloat(item.toQty) || 0);
    }, 0);
    
    setFormData(prev => ({ 
      ...prev, 
      movedQty: totalToQty.toString()
    }));
  }, [locationMovementItems]);

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

      const response = await locationmovementAPI.getLocationMovementDocId(params);
      
      if (response?.status === true) {
        setLocationMovementDocId(response.paramObjectsMap.locationMovementDocId);
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const fetchFromBins = async () => {
    try {
      const params = {
        orgId,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient
      };

      const response = await locationmovementAPI.getAllFromBin(params);
      
      if (response?.status === true) {
        setFromBinList(response.paramObjectsMap.locationMovementDetailsVO || []);
      }
    } catch (error) {
      console.error("Error fetching from bins:", error);
      addToast("Failed to fetch from bins", "error");
    }
  };

  const fetchToBins = async () => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        orgId,
        warehouse: loginWarehouse
      };

      const response = await locationmovementAPI.getToBinDetails(params);
      
      if (response?.status === true) {
        setToBinList(response.paramObjectsMap.locationMovementDetailsVO || []);
      }
    } catch (error) {
      console.error("Error fetching to bins:", error);
      addToast("Failed to fetch to bins", "error");
    }
  };

  const fetchFillGridData = async () => {
    if (!formData.entryNo) {
      addToast("Please enter Entry No first", "warning");
      return;
    }

    try {
      const params = {
        orgId,
        branchCode: loginBranchCode,
        branch: loginBranch,
        client: loginClient,
        entryNo: formData.entryNo
      };

      const response = await locationmovementAPI.getAllFillGrid(params);
      
      if (response?.status === true) {
        setFillGridData(response.paramObjectsMap.locationMovementDetailsVO || []);
        setFillGridModalOpen(true);
      } else {
        addToast("No fill grid data found", "info");
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
      addToast("Failed to fetch fill grid data", "error");
    }
  };

// const handleSave = async () => {
//   if (isSubmitting) return;
  
//   const errors = {};

//   // Validate main form fields
//   if (!formData.entryNo) errors.entryNo = "Entry No is required";

//   // Validate table data
//   if (locationMovementItems.length === 0) {
//     addToast("Please add at least one item", "error");
//     return;
//   }

//   // Validate each item
//   let itemsValid = true;
//   locationMovementItems.forEach((item, index) => {
//     if (!item.fromBin) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: From Bin is required`, "error");
//     }
//     if (!item.partNo) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: Part No is required`, "error");
//     }
//     if (!item.grnNo) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: GRN No is required`, "error");
//     }
//     if (!item.batchNo) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: Batch No is required`, "error");
//     }
//     if (!item.toBin) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: To Bin is required`, "error");
//     }
//     if (!item.toQty || parseFloat(item.toQty) <= 0) {
//       itemsValid = false;
//       addToast(`Item ${index + 1}: To Qty must be greater than 0`, "error");
//     }
//   });

//   if (!itemsValid) {
//     return;
//   }

//   setFieldErrors(errors);

//   if (Object.keys(errors).length > 0) {
//     return;
//   }

//   setIsSubmitting(true);

//   try {
//     const saveData = {
//       ...(editId && { id: editId }),
//       docId: locationMovementDocId,
//       docDate: formData.docDate,
//       entryNo: formData.entryNo,
//       movedQty: parseFloat(formData.movedQty) || 0,
//       orgId: parseInt(orgId),
//       branch: loginBranch,
//       branchCode: loginBranchCode,
//       client: loginClient,
//       customer: loginCustomer,
//       warehouse: loginWarehouse,
//       finYear: loginFinYear,
//       createdBy: loginUserName,
//       updatedBy: editId ? loginUserName : undefined,
//       active: true,
//       cancel: false,
//       freeze: true,
//       screenName: "LOCATION MOVEMENT",
//       screenCode: "LM",
//       locationMovementDetailsDTO: locationMovementItems.map((item) => {
//         const toQty = parseFloat(item.toQty) || 0;
//         const avlQty = parseFloat(item.avlQty) || 0;
        
//         return {
//           ...(item.id && { id: item.id }),
//           bin: item.fromBin, // This maps to 'bin' in your API
//           partNo: item.partNo,
//           partDesc: item.partDesc,
//           sku: item.sku,
//           grnNo: item.grnNo,
//           grnDate: item.grnDate,
//           batchNo: item.batchNo,
//           fromQty: avlQty, // Total available before movement
//           toBin: item.toBin,
//           toBinType: item.toBinType,
//           toQty: toQty,
//           remainingQty: avlQty - toQty, // Calculate remaining
//         };
//       }),
//     };

//     console.log("Sending save data:", saveData); // Debug log

//     const response = await locationmovementAPI.createUpdateLocationMovement(saveData);

//     if (response.status === true) {
//       handleClear();
//       onSaveSuccess && onSaveSuccess();
//       addToast(
//         editId 
//           ? "Location movement updated successfully" 
//           : "Location movement created successfully", 
//         "success"
//       );
//       onBack();
//     } else {
//       const errorMessage = response.message || "Location movement creation failed";
//       addToast(errorMessage, "error");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     const errorMessage = error.response?.data?.message || "Location movement creation failed";
//     addToast(errorMessage, "error");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

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

const handleEditLocationMovement = async (record) => {
  console.log("Editing record:", record); // Debug log
  
  setEditId(record.id);
  
  try {
    // If record already has locationMovementDetailsVO, use it directly
    if (record.locationMovementDetailsVO && record.locationMovementDetailsVO.length > 0) {
      console.log("Using direct record data:", record); // Debug log
      
      setLocationMovementDocId(record.docId || "");
      
      setFormData({
        docDate: record.docDate || dayjs().format("YYYY-MM-DD"),
        entryNo: record.entryNo || "",
        movedQty: record.movedQty?.toString() || "0",
      });

      // Map the locationMovementDetailsVO to your form items
      const details = record.locationMovementDetailsVO || [];
      console.log("Details from record:", details); // Debug log
      
      // Create an array to hold mapped items
      const mappedItems = [];
      
      // Process each detail item
      for (const [index, item] of details.entries()) {
        const toQty = parseFloat(item.toQty) || 0;
        const fromQty = parseFloat(item.fromQty) || 0;
        const remainingQty = parseFloat(item.remainingQty) || 0;
        
        // Calculate available quantity
        const avlQty = Math.max(toQty, fromQty - remainingQty);
        
        // Get dropdown lists for this item
        let rowPartNoList = [];
        let rowGrnNoList = [];
        let rowBatchNoList = [];
        
        // Fetch part number list for this bin
        if (item.bin) {
          try {
            const partResponse = await locationmovementAPI.getPartNoList({
              orgId,
              branch: loginBranch,
              branchCode: loginBranchCode,
              client: loginClient,
              bin: item.bin
            });
            rowPartNoList = partResponse?.paramObjectsMap?.locationMovementDetailsVO || [];
          } catch (error) {
            console.error("Error fetching part numbers:", error);
          }
        }
        
        // Fetch GRN list for this bin and part
        if (item.bin && item.partNo) {
          try {
            const grnResponse = await locationmovementAPI.getGrnNoList({
              bin: item.bin,
              branch: loginBranch,
              branchCode: loginBranchCode,
              client: loginClient,
              orgId,
              partNo: item.partNo
            });
            rowGrnNoList = grnResponse?.paramObjectsMap?.grnDetails || [];
          } catch (error) {
            console.error("Error fetching GRN numbers:", error);
          }
        }
        
        // Fetch batch list for this bin, part and grn
        if (item.bin && item.partNo && item.grnNo) {
          try {
            const batchResponse = await locationmovementAPI.getBatchNoList({
              bin: item.bin,
              branch: loginBranch,
              branchCode: loginBranchCode,
              client: loginClient,
              grnNo: item.grnNo,
              orgId,
              partNo: item.partNo
            });
            rowBatchNoList = batchResponse?.paramObjectsMap?.batchDetails || [];
          } catch (error) {
            console.error("Error fetching batch numbers:", error);
          }
        }
        
        const mappedItem = {
          id: item.id || Date.now() + index,
          fromBin: item.bin || "", // Use 'bin' from API
          partNo: item.partNo || "",
          partDesc: item.partDesc || "",
          sku: item.sku || "",
          grnNo: item.grnNo || "",
          grnDate: item.grnDate ? dayjs(item.grnDate).format("YYYY-MM-DD") : "",
          batchNo: item.batchNo || "",
          avlQty: avlQty.toString(),
          toBin: item.toBin || "",
          toBinType: item.toBinType || "",
          toQty: toQty.toString(),
          remainQty: Math.max(remainingQty, 0).toString(), // Use positive value
          rowPartNoList: rowPartNoList,
          rowGrnNoList: rowGrnNoList,
          rowBatchNoList: rowBatchNoList,
        };
        
        mappedItems.push(mappedItem);
      }

      console.log("Mapped items for table:", mappedItems); // Debug log
      setLocationMovementItems(mappedItems);
      
      addToast("Location movement data loaded successfully", "success");
      return;
    }
    
    // If not, fetch from API
    console.log("Fetching from API..."); // Debug log
    const response = await locationmovementAPI.getAllLocationMovements({
      orgId,
      branchCode: loginBranchCode,
      branch: loginBranch,
      client: loginClient,
      customer: loginCustomer,
      warehouse: loginWarehouse,
      finYear: loginFinYear
    });
    
    console.log("Full API Response:", response); // Debug log
    
    if (!response || !response.data) {
      addToast("No response from server", "error");
      return;
    }
    
    // Find the specific record
    const allRecords = response.data?.paramObjectsMap?.locationMovementVO || [];
    console.log("All records from API:", allRecords); // Debug log
    
    const locationMovementData = allRecords.find(item => item.id === record.id);
    console.log("Found record in API:", locationMovementData); // Debug log
    
    if (!locationMovementData) {
      addToast("Record not found in API response", "error");
      return;
    }
    
    setLocationMovementDocId(locationMovementData.docId || "");

    setFormData({
      docDate: locationMovementData.docDate || dayjs().format("YYYY-MM-DD"),
      entryNo: locationMovementData.entryNo || "",
      movedQty: locationMovementData.movedQty?.toString() || "0",
    });

    // Map the locationMovementDetailsVO to your form items
    const details = locationMovementData.locationMovementDetailsVO || [];
    console.log("Details to map:", details); // Debug log
    
    // Create an array to hold mapped items
    const mappedItems = [];
    
    // Process each detail item
    for (const [index, item] of details.entries()) {
      const toQty = parseFloat(item.toQty) || 0;
      const fromQty = parseFloat(item.fromQty) || 0;
      const remainingQty = parseFloat(item.remainingQty) || 0;
      
      // Calculate available quantity
      const avlQty = Math.max(toQty, fromQty - remainingQty);
      
      // Get dropdown lists for this item
      let rowPartNoList = [];
      let rowGrnNoList = [];
      let rowBatchNoList = [];
      
      // Fetch part number list for this bin
      if (item.bin) {
        try {
          const partResponse = await locationmovementAPI.getPartNoList({
            orgId,
            branch: loginBranch,
            branchCode: loginBranchCode,
            client: loginClient,
            bin: item.bin
          });
          rowPartNoList = partResponse?.paramObjectsMap?.locationMovementDetailsVO || [];
        } catch (error) {
          console.error("Error fetching part numbers:", error);
        }
      }
      
      // Fetch GRN list for this bin and part
      if (item.bin && item.partNo) {
        try {
          const grnResponse = await locationmovementAPI.getGrnNoList({
            bin: item.bin,
            branch: loginBranch,
            branchCode: loginBranchCode,
            client: loginClient,
            orgId,
            partNo: item.partNo
          });
          rowGrnNoList = grnResponse?.paramObjectsMap?.grnDetails || [];
        } catch (error) {
          console.error("Error fetching GRN numbers:", error);
        }
      }
      
      // Fetch batch list for this bin, part and grn
      if (item.bin && item.partNo && item.grnNo) {
        try {
          const batchResponse = await locationmovementAPI.getBatchNoList({
            bin: item.bin,
            branch: loginBranch,
            branchCode: loginBranchCode,
            client: loginClient,
            grnNo: item.grnNo,
            orgId,
            partNo: item.partNo
          });
          rowBatchNoList = batchResponse?.paramObjectsMap?.batchDetails || [];
        } catch (error) {
          console.error("Error fetching batch numbers:", error);
        }
      }
      
      const mappedItem = {
        id: item.id || Date.now() + index,
        fromBin: item.bin || "", // Use 'bin' from API
        partNo: item.partNo || "",
        partDesc: item.partDesc || "",
        sku: item.sku || "",
        grnNo: item.grnNo || "",
        grnDate: item.grnDate ? dayjs(item.grnDate).format("YYYY-MM-DD") : "",
        batchNo: item.batchNo || "",
        avlQty: avlQty.toString(),
        toBin: item.toBin || "",
        toBinType: item.toBinType || "",
        toQty: toQty.toString(),
        remainQty: Math.max(remainingQty, 0).toString(), // Use positive value
        rowPartNoList: rowPartNoList,
        rowGrnNoList: rowGrnNoList,
        rowBatchNoList: rowBatchNoList,
      };
      
      mappedItems.push(mappedItem);
    }

    console.log("Mapped items for table:", mappedItems); // Debug log
    setLocationMovementItems(mappedItems);
    
    addToast("Location movement data loaded successfully", "success");
  } catch (error) {
    console.error("Error loading location movement details:", error);
    addToast("Failed to load location movement details", "error");
  }
};

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      fromBin: "",
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      batchNo: "",
      avlQty: "",
      toBin: "",
      toBinType: "",
      toQty: "",
      remainQty: "",
      rowPartNoList: [],
      rowGrnNoList: [],
      rowBatchNoList: [],
    };
    setLocationMovementItems([...locationMovementItems, newItem]);
  };

  const handleItemChange = (id, field, value) => {
    setLocationMovementItems(prev =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (id) => {
    setLocationMovementItems(locationMovementItems.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs().format("YYYY-MM-DD"),
      entryNo: "",
      movedQty: "0",
    });
    setLocationMovementItems([
      {
        id: Date.now(),
        fromBin: "",
        partNo: "",
        partDesc: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        batchNo: "",
        avlQty: "",
        toBin: "",
        toBinType: "",
        toQty: "",
        remainQty: "",
        rowPartNoList: [],
        rowGrnNoList: [],
        rowBatchNoList: [],
      },
    ]);
    setEditId("");
    setFieldErrors({});
    fetchDocId();
  };

  const handleClearItems = () => {
    setLocationMovementItems([
      {
        id: Date.now(),
        fromBin: "",
        partNo: "",
        partDesc: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        batchNo: "",
        avlQty: "",
        toBin: "",
        toBinType: "",
        toQty: "",
        remainQty: "",
        rowPartNoList: [],
        rowGrnNoList: [],
        rowBatchNoList: [],
      },
    ]);
  };

  // Item field handlers
  const handleFromBinChange = async (id, value) => {
    const selectedFromBin = fromBinList.find((bin) => bin.fromBin === value);
    
    // Reset all dependent fields
    setLocationMovementItems(prev =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              fromBin: selectedFromBin?.fromBin || "",
              partNo: "",
              partDesc: "",
              sku: "",
              grnNo: "",
              grnDate: "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowPartNoList: [],
              rowGrnNoList: [],
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      await getPartNoList(id, value);
    }
  };

  const getPartNoList = async (id, fromBin) => {
    try {
      const params = {
        orgId,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        bin: fromBin
      };

      const response = await locationmovementAPI.getPartNoList(params);
      
      if (response?.status === true) {
        setLocationMovementItems(prev =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowPartNoList: response.paramObjectsMap.locationMovementDetailsVO || [],
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      addToast("Failed to fetch part numbers", "error");
    }
  };

  const handlePartNoChange = async (id, value) => {
    const selectedPart = locationMovementItems
      .find((item) => item.id === id)
      ?.rowPartNoList.find((part) => part.partNo === value);
    
    setLocationMovementItems(prev =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              grnNo: "",
              grnDate: "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowGrnNoList: [],
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      const item = locationMovementItems.find((item) => item.id === id);
      if (item && item.fromBin) {
        await getGrnNoList(id, item.fromBin, value);
      }
    }
  };

  const getGrnNoList = async (id, fromBin, partNo) => {
    try {
      const params = {
        bin: fromBin,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        orgId,
        partNo
      };

      const response = await locationmovementAPI.getGrnNoList(params);
      
      if (response?.status === true) {
        const grnDetails = response.paramObjectsMap.grnDetails || [];
        
        setLocationMovementItems(prev =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowGrnNoList: grnDetails,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
      addToast("Failed to fetch GRN numbers", "error");
    }
  };

  const handleGrnNoChange = async (id, value) => {
    const selectedGrn = locationMovementItems
      .find((item) => item.id === id)
      ?.rowGrnNoList.find((grn) => grn.grnNo === value);

    setLocationMovementItems(prev =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              grnDate: selectedGrn?.grnDate ? dayjs(selectedGrn.grnDate).format("YYYY-MM-DD") : "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      const item = locationMovementItems.find((item) => item.id === id);
      if (item && item.fromBin && item.partNo) {
        await getBatchNoList(id, item.fromBin, item.partNo, value);
      }
    }
  };

  const getBatchNoList = async (id, fromBin, partNo, grnNo) => {
    try {
      const params = {
        bin: fromBin,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo,
        orgId,
        partNo
      };

      const response = await locationmovementAPI.getBatchNoList(params);
      
      if (response?.status === true) {
        setLocationMovementItems(prev =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBatchNoList: response.paramObjectsMap.batchDetails || [],
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching batch numbers:", error);
      addToast("Failed to fetch batch numbers", "error");
    }
  };

  const handleBatchNoChange = async (id, value) => {
    const selectedBatch = locationMovementItems
      .find((item) => item.id === id)
      ?.rowBatchNoList.find((batch) => batch.batchNo === value);
    
    setLocationMovementItems(prev =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batchNo || "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
            }
          : item
      )
    );

    if (value) {
      const item = locationMovementItems.find((item) => item.id === id);
      if (item && item.fromBin && item.partNo && item.grnNo) {
        await getAvlQty(id, value, item.fromBin, item.partNo, item.grnNo);
      }
    }
  };

  const getAvlQty = async (id, batchNo, fromBin, partNo, grnNo) => {
    try {
      const params = {
        batchNo,
        bin: fromBin,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        grnNo,
        orgId,
        partNo
      };

      const response = await locationmovementAPI.getAvlQty(params);
      
      if (response?.status === true) {
        setLocationMovementItems(prev =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  avlQty: response.paramObjectsMap?.fromQty || 0,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
      addToast("Failed to fetch available quantity", "error");
    }
  };

  const handleToBinChange = (id, value) => {
    const selectedToBin = toBinList.find((bin) => bin.toBin === value);
    setLocationMovementItems(prev =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              toBin: selectedToBin?.toBin || "",
              toBinType: selectedToBin?.toBinType || "",
            }
          : item
      )
    );
  };

  const handleToQtyChange = (id, value) => {
    const item = locationMovementItems.find((it) => it.id === id);
    if (!item) return;

    // Allow empty string or digits only
    const intPattern = /^\d*$/;
    if (!intPattern.test(String(value))) {
      return;
    }

    // Parse number for calculations (empty => 0)
    const parsedNewToQty = value === "" ? 0 : parseInt(value, 10);

    setLocationMovementItems((prev) => {
      // Overall available quantity for the whole group
      const overallAvlQty = isNaN(parseInt(item.avlQty, 10))
        ? 0
        : parseInt(item.avlQty, 10);

      // Cumulative sum while iterating in order
      let cumulative = 0;

      return prev.map((i) => {
        // Check same group: fromBin, partNo, grnNo, batchNo
        const sameGroup =
          i.fromBin === item.fromBin &&
          i.partNo === item.partNo &&
          i.grnNo === item.grnNo &&
          i.batchNo === item.batchNo;

        if (!sameGroup) {
          return i;
        }

        // Determine this row's toQty number
        const thisToQtyNum =
          i.id === id
            ? parsedNewToQty
            : isNaN(parseInt(i.toQty, 10))
            ? 0
            : parseInt(i.toQty, 10);

        cumulative += thisToQtyNum;

        const newRemainQty = Math.max(overallAvlQty - cumulative, 0);

        return {
          ...i,
          toQty:
            i.id === id
              ? value === ""
                ? ""
                : String(parsedNewToQty)
              : i.toQty,
          remainQty: newRemainQty,
        };
      });
    });
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => {
      const item = fillGridData[index];
      return {
        id: Date.now() + index,
        fromBin: item.bin || item.fromBin,
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        grnNo: item.grnNo,
        grnDate: item.grnDate,
        batchNo: item.batchNo,
        avlQty: item.avlQty,
        toBin: "",
        toBinType: "",
        toQty: "",
        remainQty: "",
        rowPartNoList: [],
        rowGrnNoList: [],
        rowBatchNoList: [],
      };
    });

    setLocationMovementItems([...locationMovementItems, ...selectedData]);
    setSelectedRows([]);
    setSelectAll(false);
    setFillGridModalOpen(false);
    
    addToast(`${selectedData.length} items added to grid`, "success");
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

const handleSave = async () => {
  if (isSubmitting) return;
  
  const errors = {};

  // Validate main form fields
  if (!formData.entryNo) errors.entryNo = "Entry No is required";

  // Validate table data
  if (locationMovementItems.length === 0) {
    addToast("Please add at least one item", "error");
    return;
  }

  // Validate each item
  let itemsValid = true;
  locationMovementItems.forEach((item, index) => {
    if (!item.fromBin) {
      itemsValid = false;
      addToast(`Item ${index + 1}: From Bin is required`, "error");
    }
    if (!item.partNo) {
      itemsValid = false;
      addToast(`Item ${index + 1}: Part No is required`, "error");
    }
    if (!item.grnNo) {
      itemsValid = false;
      addToast(`Item ${index + 1}: GRN No is required`, "error");
    }
    if (!item.batchNo) {
      itemsValid = false;
      addToast(`Item ${index + 1}: Batch No is required`, "error");
    }
    if (!item.toBin) {
      itemsValid = false;
      addToast(`Item ${index + 1}: To Bin is required`, "error");
    }
    if (!item.toQty || parseFloat(item.toQty) <= 0) {
      itemsValid = false;
      addToast(`Item ${index + 1}: To Qty must be greater than 0`, "error");
    }
  });

  if (!itemsValid) {
    return;
  }

  setFieldErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  setIsSubmitting(true);

  try {
    const saveData = {
      ...(editId && { id: editId }),
      docId: locationMovementDocId,
      docDate: formData.docDate,
      entryNo: formData.entryNo,
      movedQty: parseFloat(formData.movedQty) || 0,
      orgId: parseInt(orgId),
      branch: loginBranch,
      branchCode: loginBranchCode,
      client: loginClient,
      customer: loginCustomer,
      warehouse: loginWarehouse,
      finYear: loginFinYear,
      createdBy: loginUserName,
      updatedBy: editId ? loginUserName : undefined,
      active: true,
      cancel: false,
      freeze: true,
      screenName: "LOCATION MOVEMENT",
      screenCode: "LM",
      locationMovementDetailsDTO: locationMovementItems.map((item) => {
        const toQty = parseFloat(item.toQty) || 0;
        const avlQty = parseFloat(item.avlQty) || 0;
        
        return {
          ...(item.id && { id: item.id }),
          fromBin: item.fromBin, // Map to 'bin' in API
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
          grnNo: item.grnNo,
          grnDate: item.grnDate,
          batchNo: item.batchNo,
          fromQty: avlQty, // Total available before movement
          toBin: item.toBin,
          toBinType: item.toBinType,
          toQty: toQty,
          remainingQty: avlQty - toQty, // Calculate remaining (can be negative)
        };
      }),
    };

    console.log("Sending save data:", saveData); // Debug log

    const response = await locationmovementAPI.createUpdateLocationMovement(saveData);

    if (response.status === true) {
      handleClear();
      onSaveSuccess && onSaveSuccess();
      addToast(
        editId 
          ? "Location movement updated successfully" 
          : "Location movement created successfully", 
        "success"
      );
      onBack();
    } else {
      const errorMessage = response.message || "Location movement creation failed";
      addToast(errorMessage, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error.response?.data?.message || "Location movement creation failed";
    addToast(errorMessage, "error");
  } finally {
    setIsSubmitting(false);
  }
};

useEffect(() => {
  console.log("Edit Data received in form:", editData);
  console.log("Current locationMovementItems:", locationMovementItems);
}, [editData, locationMovementItems]);
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
              {editData ? "Edit Location Movement" : "Create Location Movement"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage inventory location movements
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
            const sampleFile = "/sample-files/sample_location_movement.xlsx";
            const link = document.createElement("a");
            link.href = sampleFile;
            link.download = "sample_location_movement.xlsx";
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
      </div>

      {/* MAIN FORM CONTENT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* Basic Information */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <FloatingInput
              label="Document No"
              name="docId"
              value={locationMovementDocId}
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

            <FloatingInput
              label="Entry No *"
              name="entryNo"
              value={formData.entryNo}
              onChange={handleInputChange}
              error={fieldErrors.entryNo}
              required
              icon={Hash}
            />

            <FloatingInput
              label="Moved Qty"
              name="movedQty"
              value={formData.movedQty}
              disabled
              icon={Box}
            />
          </div>
        </div>
      </div>

      {/* LOCATION MOVEMENT ITEMS TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Location Movement Items</h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {locationMovementItems.length} items
            </span>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              Total Moved: {formData.movedQty}
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
              onClick={fetchFillGridData}
              disabled={!formData.entryNo}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
              <Grid className="h-3 w-3" />
              Fill Grid
            </button>
            <button
              onClick={handleClearItems}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear Items
            </button>
          </div>
        </div>

        {/* Location Movement Items Table */}
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
                  Part No *
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                  Part Description
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  SKU
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  GRN No *
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Batch No *
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Avl Qty
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  To Bin *
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  To Bin Type
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
              {locationMovementItems.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items added. Click "Add Item" or "Fill Grid" to start.
                  </td>
                </tr>
              ) : (
                locationMovementItems.map((item, index) => (
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
                        <option value="">--Select--</option>
                        {fromBinList.map((bin) => (
                          <option key={bin.fromBin} value={bin.fromBin}>
                            {bin.fromBin}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Part No */}
                  <td className="px-3 py-2">
  <select
    value={item.partNo}
    onChange={(e) => handlePartNoChange(item.id, e.target.value)}
    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    disabled={!item.fromBin}
  >
    <option value="">--Select--</option>
    {item.rowPartNoList?.map((part) => (
      <option key={part.partNo} value={part.partNo}>
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
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* SKU */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.sku}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
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
    <option value="">--Select--</option>
    {item.rowGrnNoList?.map((grn) => (
      <option key={grn.grnNo} value={grn.grnNo}>
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
    <option value="">--Select--</option>
    {item.rowBatchNoList?.map((batch) => (
      <option key={batch.batchNo} value={batch.batchNo}>
        {batch.batchNo}
      </option>
    ))}
  </select>
</td>

                    {/* Avl Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.avlQty}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>

                    {/* To Bin */}
                    <td className="px-3 py-2">
                      <select
                        value={item.toBin}
                        onChange={(e) => handleToBinChange(item.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!item.batchNo}
                      >
                        <option value="">--Select--</option>
                        {toBinList.map((bin) => (
                          <option key={bin.toBin} value={bin.toBin}>
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
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
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
                        disabled={!item.toBin}
                      />
                    </td>

                    {/* Remain Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.remainQty}
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        readOnly
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fill Grid Modal */}
      <FillGridModal
        open={fillGridModalOpen}
        onClose={() => {
          setFillGridModalOpen(false);
          setSelectedRows([]);
          setSelectAll(false);
        }}
        fillGridData={fillGridData}
        selectedRows={selectedRows}
        selectAll={selectAll}
        onSelectAll={handleSelectAll}
        onRowSelect={(index, checked) => {
          if (checked) {
            setSelectedRows([...selectedRows, index]);
          } else {
            setSelectedRows(selectedRows.filter(i => i !== index));
          }
        }}
        onSave={handleSaveSelectedRows}
      />

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Location Movement Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload="/sample-files/sample_location_movement.xlsx"
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/locationMovement/upload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Location Movement"
      />
    </div>
  );
};

export default LocationMovementForm;