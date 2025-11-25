import { ArrowLeft, Save, X, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { masterAPI } from "../../../api/carrierAPI";
import { useToast } from "../../Toast/ToastContext";

const CarrierMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { addToast } = useToast(); // Get the toast function

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
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const [fieldErrors, setFieldErrors] = useState({});

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

  // ---------------------------
  //       SAVE FUNCTION
  // ---------------------------
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
        
        // Show success toast
        addToast(successMessage, 'success');
        
        onSaveSuccess && onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = res?.paramObjectsMap?.message ||
          res?.message ||
          "Failed to save carrier";
        
        // Show error toast
        addToast(errorMessage, 'error');
      }
    } catch (err) {
      console.error("Save Error:", err);
      const errorMessage = err.response?.data?.paramObjectsMap?.message ||
        err.response?.data?.message ||
        "Save failed! Try again.";
      
      // Show error toast
      addToast(errorMessage, 'error');
    }

    setIsSubmitting(false);
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
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Carrier" : "Add Carrier"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* TABS NAVIGATION */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              activeTab === "basic"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Building className="h-3 w-3" />
            Basic Info
          </button>
        </div>

        {/* BASIC INFO TAB */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            {/* MAIN FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <div className="flex items-center gap-2 p-1 md:col-span-2 lg:col-span-3">
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
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" /> 
            {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarrierMasterForm;