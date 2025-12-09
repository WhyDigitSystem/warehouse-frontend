import { ArrowLeft, Save, X, List, Upload, Download } from "lucide-react";
import { useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import { unitAPI } from "../../../api/unitAPI";
import { useToast } from "../../Toast/ToastContext";

const UnitMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [form, setForm] = useState({
    id: editData?.id || 0,
    uom: editData?.uom || "",
    unitName: editData?.unitName || "",
    unitType: editData?.unitType || "",
    active: editData?.active === "Active" ? true : false,
    
    // Additional fields
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Field labels for toast messages
  const fieldLabels = {
    uom: "UOM",
    unitName: "Unit Name",
    unitType: "Unit Type",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "uom":
      case "unitName":
      case "unitType":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabetic characters are allowed";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = value.toUpperCase();
      setForm(prev => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleSave = async () => {
    // Validate form and show toast for first error
    const errors = {};

    if (!form.uom.trim()) errors.uom = "UOM is required";
    if (!form.unitName.trim()) errors.unitName = "Unit Name is required";
    if (!form.unitType.trim()) errors.unitType = "Unit Type is required";

    setFieldErrors(errors);

    // If there are errors, show the first one in toast and return
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];
      
      addToast(`${fieldLabel}: ${errorMessage}`, 'error');
      return;
    }

    setIsSubmitting(true);

    // Payload structure
    const payload = {
      id: form.id,
      uom: form.uom,
      unitName: form.unitName,
      unitType: form.unitType,
      active: form.active,
      orgId: form.orgId,
      createdBy: form.createdBy,
    };

    console.log("📤 Saving Unit Payload:", payload);

    try {
      const response = await unitAPI.saveUnit(payload);
      console.log("📥 Save Response:", response);

      // Check response status
      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Unit updated successfully!" : "Unit created successfully!");

        addToast(successMessage, 'success');

        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save unit";

        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-4 max-w-7xl mx-auto">
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
              {editData ? "Edit Unit" : "Create Unit"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage unit master entries
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

      {/* ACTION BUTTONS - With Upload and Download */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <FloatingInput
            label="UOM *"
            name="uom"
            value={form.uom}
            onChange={handleChange}
            error={fieldErrors.uom}
            required
          />
          
          <FloatingInput
            label="Unit Name *"
            name="unitName"
            value={form.unitName}
            onChange={handleChange}
            error={fieldErrors.unitName}
            required
          />
          
          <FloatingInput
            label="Unit Type *"
            name="unitType"
            value={form.unitType}
            onChange={handleChange}
            error={fieldErrors.unitType}
            required
          />

          {/* ACTIVE CHECKBOX */}
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
      </div>
    </div>
  );
};

export default UnitMasterForm;