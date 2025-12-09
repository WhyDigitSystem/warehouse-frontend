import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  List,
  Upload,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { warehouseLocationAPI } from "../../../api/warehouseLocationAPI";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import * as XLSX from "xlsx";

const WarehouseLocationForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  
    // Use globalParams similar to CarrierForm
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

  console.log("globalParam",globalParam);
  const loginBranchCode = globalParam?.branchcode ;
  const loginBranch = globalParam?.branch ;
  const loginWarehouse = globalParam?.warehouse ;
  const loginCustomer = globalParam?.customer ;
  const loginClient = globalParam?.client ;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const [warehouseLocations, setWarehouseLocations] = useState([]);


  const [warehouseList, setWarehouseList] = useState([]);
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [binCategoryList, setBinCategoryList] = useState([]);
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState({
    warehouses: false,
    locationTypes: false,
    binCategories: false,
    warehouseLocations: false
  });

  const [form, setForm] = useState({
    id: editData?.id || 0,
    branch: editData?.branch || loginBranch,
    warehouse: editData?.warehouse || "",
    locationType: editData?.binType || "",
    rowNo: editData?.rowNo || "",
    levelIdentity: editData?.level || "",
    cellFrom: editData?.cellFrom || "",
    cellTo: editData?.cellTo || "",
    active: editData?.active === "Active" || editData?.active === true ? true : false,
  });

  const [binTableData, setBinTableData] = useState([
    {
      id: 1,
      bin: "",
      binCategory: "",
      status: "",
      core: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [binTableErrors, setBinTableErrors] = useState([]);
  const [commonCore, setCommonCore] = useState("");

  // Initialize data on component mount
  useEffect(() => {
    fetchInitialData();
    
    if (editData && editData.warehouseLocationDetailsVO) {
      setBinTableData(
        editData.warehouseLocationDetailsVO.map((loc, index) => ({
          id: loc.id || index + 1,
          bin: loc.bin || "",
          binCategory: loc.binCategory || "",
          status: loc.status || "",
          core: loc.core || "",
        }))
      );
    }
  }, [editData]);

  // Fetch all initial data
  const fetchInitialData = async () => {
    try {
      await Promise.all([
        getAllWarehousesByLoginBranch(),
        getAllLocationTypes(),
        getAllCellCategories(),
        getAllWarehouseLocations() 
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

// FIXED: Get all warehouse locations with ALL required parameters
const getAllWarehouseLocations = async () => {
  try {
    setIsLoading(prev => ({ ...prev, warehouseLocations: true }));
    
    console.log("🔄 Fetching warehouse locations with:", {
      branch: loginBranch,
      orgId: ORG_ID,
      warehouse: loginWarehouse // This was missing!
    });

    // Pass ALL THREE required parameters
    const response = await warehouseLocationAPI.getAllWarehouseLocations(
      loginBranch, 
      ORG_ID, 
      loginWarehouse // Add this parameter
    );
    
    console.log("📥 Warehouse Locations API Response:", response);

    // Handle response based on the consistent pattern
    if (response?.status === true) {
      const locations = response.paramObjectsMap?.warehouseLocationVO || [];
      setWarehouseLocations(locations);
      addToast(`Loaded ${locations.length} warehouse locations`, "success");
    } else {
      console.warn("Unexpected warehouse locations response structure:", response);
      setWarehouseLocations([]);
      addToast("No warehouse locations found", "info");
    }
  } catch (error) {
    console.error("❌ Error fetching warehouse locations:", error);
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    };
    console.error("Error details:", errorDetails);
    
    addToast(`Failed to load warehouse locations: ${error.message}`, "error");
    setWarehouseLocations([]);
  } finally {
    setIsLoading(prev => ({ ...prev, warehouseLocations: false }));
  }
};

// FIXED: Get all warehouses with proper error handling
const getAllWarehousesByLoginBranch = async () => {
  try {
    setIsLoading(prev => ({ ...prev, warehouses: true }));
    
    console.log("🔄 Fetching warehouses with:", {
      branchCode: loginBranchCode,
      orgId: ORG_ID
    });

    const response = await warehouseLocationAPI.getWarehousesByBranch(loginBranchCode, ORG_ID);
    
    console.log("📥 Warehouses API Response:", response);

    // Check for successful status in your API's response structure
    if (response?.status === true) {
      setWarehouseList(response.paramObjectsMap?.Warehouse || []);
    } else {
      console.warn("API returned false status or no data:", response);
      setWarehouseList([]);
      addToast("No warehouses found for this branch", "warning");
    }
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    addToast(`Failed to load warehouses: ${error.message}`, "error");
    setWarehouseList([]);
  } finally {
    setIsLoading(prev => ({ ...prev, warehouses: false }));
  }
};

// FIXED: Get all location types with fallback
const getAllLocationTypes = async () => {
  try {
    setIsLoading(prev => ({ ...prev, locationTypes: true }));
    
    console.log("🔄 Fetching location types with orgId:", ORG_ID);
    
    const response = await warehouseLocationAPI.getAllLocationTypes(ORG_ID);
    
    console.log("📥 Location Types API Response:", response);

    if (response?.status === true) {
      const locationTypes = response.paramObjectsMap?.binTypeVO || [];
      setLocationTypeList(locationTypes);
      console.log(`✅ Loaded ${locationTypes.length} location types`);
    } else {
      console.warn("No location types found in response");
      setLocationTypeList([]);
    }
  } catch (error) {
    console.error("Error fetching location types:", error);
    addToast("Failed to fetch location types", "error");
    setLocationTypeList([]);
  } finally {
    setIsLoading(prev => ({ ...prev, locationTypes: false }));
  }
};

// FIXED: Get all cell categories with fallback
const getAllCellCategories = async () => {
  try {
    setIsLoading(prev => ({ ...prev, binCategories: true }));
    
    console.log("🔄 Fetching cell categories with orgId:", ORG_ID);
    
    const response = await warehouseLocationAPI.getAllCellCategories(ORG_ID);
    
    console.log("📥 Cell Categories API Response:", response);

    if (response?.status === true) {
      const cellCategories = response.paramObjectsMap?.cellTypeVO || [];
      setBinCategoryList(cellCategories);
      console.log(`✅ Loaded ${cellCategories.length} cell categories`);
    } else {
      console.warn("No cell categories found in response");
      setBinCategoryList([]);
    }
  } catch (error) {
    console.error("Error fetching cell categories:", error);
    addToast("Failed to fetch cell categories", "error");
    setBinCategoryList([]);
  } finally {
    setIsLoading(prev => ({ ...prev, binCategories: false }));
  }
};
  // Get bin details
  const getAllBinDetails = async () => {
    const errors = {};
    if (!form.warehouse) errors.warehouse = "Warehouse is required";
    if (!form.levelIdentity) errors.levelIdentity = "Level Identity is required";
    if (!form.cellTo) errors.cellTo = "Cell To is required";
    if (!form.rowNo) errors.rowNo = "Row is required";

    if (Object.keys(errors).length === 0) {
      try {
        const response = await warehouseLocationAPI.getBinDetails(
          form.cellTo,
          form.levelIdentity,
          form.rowNo,
          form.cellFrom
        );

        if (response.status === true) {
          const palletDetails = response.paramObjectsMap?.pallet || [];
          const updatedBinTableData = palletDetails.map((plt, index) => ({
            id: plt.id || index + 1,
            bin: plt.bin || "",
            binCategory: plt.bincategory || "",
            status: plt.status === "T" ? "True" : "False",
            core: commonCore,
          }));

          setBinTableData(updatedBinTableData);
          addToast("Bin details loaded successfully!", "success");
        }
      } catch (error) {
        console.error("Error fetching bin details:", error);
        addToast("Failed to fetch bin details", "error");
      }
    } else {
      setFieldErrors(errors);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9 ]*$/;
    const specialCharsRegex = /^[A-Za-z0-9#_\-/\\]*$/;

    let errorMessage = "";

    switch (name) {
      case "cellFrom":
      case "cellTo":
        if (!numericRegex.test(value)) errorMessage = "Only Numbers are allowed";
        break;
      case "rowNo":
        if (!specialCharsRegex.test(value)) errorMessage = "Only alphanumeric and /, -, _, \\ characters are allowed";
        break;
      case "levelIdentity":
        if (!alphanumericRegex.test(value)) errorMessage = "Only alphanumeric characters are allowed";
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value.toUpperCase(),
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "locationType") {
      const selectedLocationType = locationTypeList.find(
        (loc) => loc.binType === value
      );
      if (selectedLocationType) {
        setCommonCore(selectedLocationType.core);
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Table row handlers
  const handleAddRow = () => {
    if (isLastRowEmpty()) {
      displayRowError();
      return;
    }
    const newRow = {
      id: Date.now(),
      bin: "",
      binCategory: "",
      status: "",
      core: "",
    };
    setBinTableData([...binTableData, newRow]);
  };

  const handleDeleteRow = (id) => {
    if (binTableData.length > 1) {
      setBinTableData(binTableData.filter((row) => row.id !== id));
    }
  };

  const isLastRowEmpty = () => {
    const lastRow = binTableData[binTableData.length - 1];
    return !lastRow.bin || !lastRow.binCategory || !lastRow.status || !lastRow.core;
  };

  const displayRowError = () => {
    const lastIndex = binTableData.length - 1;
    setBinTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[lastIndex] = {
        bin: !binTableData[lastIndex].bin ? "Bin is required" : "",
        binCategory: !binTableData[lastIndex].binCategory ? "Bin Category is required" : "",
        status: !binTableData[lastIndex].status ? "Status is required" : "",
        core: !binTableData[lastIndex].core ? "Core is required" : "",
      };
      return newErrors;
    });
  };

  const handleTableDataChange = (index, field, value) => {
    setBinTableData(prev => 
      prev.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    );

    // Clear error when user starts typing
    if (binTableErrors[index]?.[field]) {
      setBinTableErrors(prev => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          [field]: ""
        };
        return newErrors;
      });
    }
  };

  // Bulk Upload Handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };

  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
    addToast("Warehouse locations uploaded successfully!", "success");
  };

  const handleDownloadSample = () => {
    try {
      const sampleData = [
        {
          "Warehouse": "MAIN_WAREHOUSE",
          "Location Type": "PALLET",
          "Row No": "A01",
          "Level Identity": "1",
          "Cell From": "1",
          "Cell To": "10",
          "Active": "Yes"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Locations");
      const fileName = `Sample_Warehouse_Location_Upload_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      addToast("Sample file downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      addToast("Failed to download sample file", "error");
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!form.warehouse) errors.warehouse = "Warehouse is required";
    if (!form.locationType) errors.locationType = "Location Type is required";
    if (!form.rowNo) errors.rowNo = "Row Number is required";
    if (!form.levelIdentity) errors.levelIdentity = "Level Identity is required";
    if (!form.cellFrom) errors.cellFrom = "Cell From is required";
    if (!form.cellTo) errors.cellTo = "Cell To is required";

    let binTableDataValid = true;
    const newTableErrors = binTableData.map((row, index) => {
      const rowErrors = {};
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        binTableDataValid = false;
      }
      if (!row.binCategory) {
        rowErrors.binCategory = "Bin Category is required";
        binTableDataValid = false;
      }
      if (!row.status) {
        rowErrors.status = "Status is required";
        binTableDataValid = false;
      }
      if (!row.core) {
        rowErrors.core = "Core is required";
        binTableDataValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setBinTableErrors(newTableErrors);

    return Object.keys(errors).length === 0 && binTableDataValid;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const binVo = binTableData.map((row) => ({
        ...(form.id && { id: row.id }),
        bin: row.bin,
        binCategory: row.binCategory,
        status: row.status,
        core: row.core,
      }));

      const payload = {
        ...(form.id && { id: form.id }),
        branch: form.branch,
        branchCode: loginBranchCode,
        warehouse: form.warehouse,
        binType: form.locationType,
        rowNo: form.rowNo,
        level: form.levelIdentity,
        cellFrom: form.cellFrom,
        cellTo: form.cellTo,
        warehouseLocationDetailsDTO: binVo,
        active: form.active,
        orgId: ORG_ID,
        createdBy: loginUserName,
      };

      console.log("📤 Saving Warehouse Location Payload:", payload);

      const response = await warehouseLocationAPI.saveWarehouseLocation(payload);

      console.log("📥 Save Response:", response);

      if (response.status === true) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Warehouse location updated successfully!" : "Warehouse location created successfully!");
        
        addToast(successMessage, 'success');
        onSaveSuccess && onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save warehouse location";
        
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Please try again.";
      
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({
      id: 0,
      branch: loginBranch,
      warehouse: "",
      locationType: "",
      rowNo: "",
      levelIdentity: "",
      cellFrom: "",
      cellTo: "",
      active: true,
    });
    setBinTableData([
      {
        id: 1,
        bin: "",
        binCategory: "",
        status: "",
        core: "",
      },
    ]);
    setFieldErrors({});
    setBinTableErrors([]);
  };

  /* -------------------------- OPTIONS -------------------------- */
  const warehouseOptions = warehouseList.map(warehouse => ({
    value: warehouse.Warehouse,
    label: warehouse.Warehouse
  }));

  const locationTypeOptions = locationTypeList.map(type => ({
    value: type.binType,
    label: type.binType
  }));

  const binCategoryOptions = binCategoryList.map(category => ({
    value: category.cellType,
    label: category.cellType
  }));

  const statusOptions = [
    { value: "True", label: "True" },
    { value: "False", label: "False" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Warehouse Location" : "Create Warehouse Location"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage warehouse location entries
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
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
        </button>
        
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
        
        <button
          onClick={handleBulkUploadOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download Sample
        </button>
      </div>

      {/* Bulk Upload Modal */}
      {uploadOpen && (
        <CommonBulkUpload
          open={uploadOpen}
          handleClose={handleBulkUploadClose}
          title="Upload Warehouse Locations"
          uploadText="Upload Excel File"
          downloadText="Download Sample"
          onSubmit={handleSubmitUpload}
          sampleFileDownload={null}
          handleFileUpload={handleFileUpload}
          apiUrl={`/api/warehousemastercontroller/WarehouseLocationUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&orgId=${ORG_ID}&warehouse=${loginWarehouse}`}
          screen="Warehouse Location"
        />
      )}

      {/* MAIN FORM CONTENT */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* Loading States */}
        {(isLoading.warehouses || isLoading.locationTypes || isLoading.binCategories) && (
          <div className="flex justify-center items-center py-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading data...</span>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <FloatingInput
            label="Branch"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            disabled
          />

          <FloatingSelect
            label="Warehouse *"
            name="warehouse"
            value={form.warehouse}
            onChange={(value) => handleSelectChange("warehouse", value)}
            options={warehouseOptions}
            error={fieldErrors.warehouse}
            disabled={isLoading.warehouses || !!editData}
            required
          />

          <FloatingSelect
            label="Location Type *"
            name="locationType"
            value={form.locationType}
            onChange={(value) => handleSelectChange("locationType", value)}
            options={locationTypeOptions}
            error={fieldErrors.locationType}
            disabled={isLoading.locationTypes || !!editData}
            required
          />

          <FloatingInput
            label="Row No *"
            name="rowNo"
            value={form.rowNo}
            onChange={handleChange}
            error={fieldErrors.rowNo}
            disabled={!!editData}
            required
          />

          <FloatingInput
            label="Level Identity *"
            name="levelIdentity"
            value={form.levelIdentity}
            onChange={handleChange}
            error={fieldErrors.levelIdentity}
            disabled={!!editData}
            required
          />

          <FloatingInput
            label="Cell From *"
            name="cellFrom"
            value={form.cellFrom}
            onChange={handleChange}
            error={fieldErrors.cellFrom}
            disabled={!!editData}
            required
          />

          <FloatingInput
            label="Cell To *"
            name="cellTo"
            value={form.cellTo}
            onChange={handleChange}
            error={fieldErrors.cellTo}
            disabled={!!editData}
            required
          />

          {/* Active Checkbox */}
          <div className="flex items-center gap-2 p-1">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </span>
          </div>
        </div>

        {/* Bin Details Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bin Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage warehouse bin details
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={getAllBinDetails}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Fill Grid
              </button>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Bin
              </button>
            </div>
          </div>

          {/* Bin Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white w-12">Action</th>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white w-12">S.No</th>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white">Bin *</th>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white">Bin Category *</th>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white">Status *</th>
                  <th className="p-2 text-left font-medium text-gray-900 dark:text-white">Core *</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {binTableData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        disabled={binTableData.length === 1}
                        className={`p-1 rounded ${
                          binTableData.length === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <FloatingInput
                        value={row.bin}
                        onChange={(e) => handleTableDataChange(index, "bin", e.target.value)}
                        error={binTableErrors[index]?.bin}
                        className="w-full"
                      />
                    </td>
                    <td className="p-2">
                      <FloatingSelect
                        value={row.binCategory}
                        onChange={(value) => handleTableDataChange(index, "binCategory", value)}
                        options={binCategoryOptions}
                        error={binTableErrors[index]?.binCategory}
                        disabled={isLoading.binCategories}
                        className="w-full"
                      />
                    </td>
                    <td className="p-2">
                      <FloatingSelect
                        value={row.status}
                        onChange={(value) => handleTableDataChange(index, "status", value)}
                        options={statusOptions}
                        error={binTableErrors[index]?.status}
                        className="w-full"
                      />
                    </td>
                    <td className="p-2">
                      <FloatingInput
                        value={row.core}
                        onChange={(e) => handleTableDataChange(index, "core", e.target.value)}
                        error={binTableErrors[index]?.core}
                        className="w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseLocationForm;