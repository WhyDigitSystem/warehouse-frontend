import { ArrowLeft, Save, X, Building, List, Upload, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { masterAPI } from "../../../api/carrierAPI";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import * as XLSX from "xlsx";

const CarrierMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadOpen, setUploadOpen] = useState(false);
  const { addToast } = useToast();

  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

  const loginBranchCode =
    globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch =
    globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse =
    globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer =
    globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient =
    globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [form, setForm] = useState({
    id: editData?.id || 0,
    carrier: editData?.carrier || "",
    carrierShortName: editData?.carrierShortName || "",
    shipmentMode: editData?.shipmentMode || "",
    cbranch: editData?.cbranch || loginBranchCode,
    active: editData?.active === "Active" ? true : false,

    branch: editData?.branch || loginBranch,
    branchCode: editData?.branchCode || loginBranchCode,
    warehouse: editData?.warehouse || loginWarehouse,
    customer: editData?.customer || loginCustomer,
    client: editData?.client || loginClient,
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Bulk Upload Handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };

  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
    addToast("Carriers uploaded successfully!", "success");
  };

  const handleDownloadSample = () => {
    try {
      // Create sample data for Excel
      const sampleData = [
        {
          "Carrier Name": "SAMPLE_CARRIER",
          "Short Name": "SAMPLE_SHORT",
          "Shipment Mode": "ROAD",
          "Control Branch": loginBranchCode,
          "Active": "Yes"
        }
      ];

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Carriers");

      // Generate file name
      const fileName = `Sample_Carrier_Upload_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      addToast("Sample file downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      addToast("Failed to download sample file", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.carrier.trim()) errors.carrier = "Carrier Name is required";
    if (!form.carrierShortName.trim())
      errors.carrierShortName = "Short Name is required";
    if (!form.shipmentMode) errors.shipmentMode = "Shipment Mode is required";
    if (!form.cbranch) errors.cbranch = "Control Branch is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      id: form.id,
      carrier: form.carrier,
      carrierShortName: form.carrierShortName,
      shipmentMode: form.shipmentMode,
      cbranch: form.cbranch,
      active: form.active,
      branch: form.branch,
      branchCode: form.branchCode,
      warehouse: form.warehouse,
      customer: form.customer,
      client: form.client,
      orgId: form.orgId,
      createdBy: form.createdBy,
    };

    console.log("📤 Sending Payload:", payload);

    try {
      const res = await masterAPI.saveCarrier(payload);
      console.log("📥 Save Response:", res);

      const status =
        res?.status === true || res?.statusFlag === "Ok" ? true : false;

      if (status) {
        const successMessage = res?.paramObjectsMap?.message || 
          (form.id ? "Carrier updated successfully!" : "Carrier created successfully!");
        
        addToast(successMessage, 'success');
        onSaveSuccess && onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = res?.paramObjectsMap?.message ||
          res?.message ||
          "Failed to save carrier";
        
        addToast(errorMessage, 'error');
      }
    } catch (err) {
      console.error("Save Error:", err);
      const errorMessage = err.response?.data?.paramObjectsMap?.message ||
        err.response?.data?.message ||
        "Save failed! Try again.";
      
      addToast(errorMessage, 'error');
    }

    setIsSubmitting(false);
  };

  const handleClear = () => {
    setForm({
      id: 0,
      carrier: "",
      carrierShortName: "",
      shipmentMode: "",
      cbranch: loginBranchCode,
      active: true,
      branch: loginBranch,
      branchCode: loginBranchCode,
      warehouse: loginWarehouse,
      customer: loginCustomer,
      client: loginClient,
      orgId: ORG_ID,
      createdBy: loginUserName,
    });
    setFieldErrors({});
  };

  const shipmentModeOptions = [
    { value: "AIR", label: "AIR" },
    { value: "SEA", label: "SEA" },
    { value: "ROAD", label: "ROAD" },
  ];

  const controlBranchOptions = [
    { value: loginBranchCode, label: loginBranchCode },
    { value: "ALL", label: "ALL" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER - Similar to BuyerMasterForm */}
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
              {editData ? "Edit Carrier" : "Create Carrier"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage carrier master entries
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

      {/* ACTION BUTTONS - Similar to BuyerMasterForm */}
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
          title="Upload Carriers"
          uploadText="Upload Excel File"
          downloadText="Download Sample"
          onSubmit={handleSubmitUpload}
          sampleFileDownload={null}
          handleFileUpload={handleFileUpload}
          apiUrl={`/api/warehousemastercontroller/CarrierUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&orgId=${ORG_ID}&warehouse=${loginWarehouse}`}
          screen="Carrier Master"
        />
      )}

      {/* MAIN FORM CONTENT */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* TABS NAVIGATION */}
   

        {/* BASIC INFO TAB */}
        
          <div className="space-y-4">
            {/* MAIN FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingInput
                label="Carrier Name *"  
                name="carrier"
                value={form.carrier}
                onChange={handleChange}
                error={fieldErrors.carrier}
                required
              />
              
              <FloatingInput
                label="Short Name *"
                name="carrierShortName"
                value={form.carrierShortName}
                onChange={handleChange}
                error={fieldErrors.carrierShortName}
                required
              />
              
              <FloatingSelect
                label="Shipment Mode *"
                name="shipmentMode"
                value={form.shipmentMode}
                onChange={(value) => handleSelectChange("shipmentMode", value)}
                options={shipmentModeOptions}
                error={fieldErrors.shipmentMode}
                required
              />
              
              <FloatingSelect
                label="Control Branch *"
                name="cbranch"
                value={form.cbranch}
                onChange={(value) => handleSelectChange("cbranch", value)}
                options={controlBranchOptions}
                error={fieldErrors.cbranch}
                required
              />

              {/* Active Checkbox */}
             <div className="flex items-center gap-2 p-1">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </span>
            </div>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default CarrierMasterForm;