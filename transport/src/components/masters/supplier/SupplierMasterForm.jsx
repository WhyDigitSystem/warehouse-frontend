import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { supplierAPI } from "../../../api/supplierAPI";
import { useToast } from "../../Toast/ToastContext";

const SupplierMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Use globalParams similar to CarrierForm
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    id: editData?.id || 0,
    supplierName: editData?.supplier || "",
    shortName: editData?.supplierShortName || "",
    supplierType: editData?.supplierType || "",
    pan: editData?.panNo || "",
    tanNo: editData?.tanNo || "",
    contactPerson: editData?.contactPerson || "",
    mobile: editData?.mobileNo || "",
    addressLine1: editData?.addressLine1 || "",
    country: editData?.country || "INDIA",
    state: editData?.state || "",
    city: editData?.city || "",
    controlBranch: editData?.cbranch || loginBranchCode,
    pincode: editData?.zipCode || "",
    email: editData?.email || "",
    eccNo: editData?.eccNo || "",
    active: editData?.active === "Active" ? true : false,
    
    // Additional fields similar to CarrierForm
    branch: editData?.branch || loginBranch,
    branchCode: editData?.branchCode || loginBranchCode,
    warehouse: editData?.warehouse || loginWarehouse,
    customer: editData?.customer || loginCustomer,
    client: editData?.client || loginClient,
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Field labels for toast messages
  const fieldLabels = {
    supplierName: "Supplier Name",
    shortName: "Short Name",
    supplierType: "Supplier Type",
    contactPerson: "Contact Person",
    mobile: "Mobile",
    email: "Email",
    addressLine1: "Address",
    country: "Country",
    state: "State",
    city: "City",
    pan: "PAN",
    tanNo: "TAN",
    pincode: "Pincode",
    eccNo: "ECC No",
    controlBranch: "Control Branch",
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchCountries();
    
    if (form.country) {
      fetchStates(form.country);
    }
    if (form.state) {
      fetchCities(form.state);
    }
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (form.country) {
      fetchStates(form.country);
    }
  }, [form.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (form.state) {
      fetchCities(form.state);
    }
  }, [form.state]);

  const fetchCountries = async () => {
    try {
      const countriesData = await supplierAPI.getCountries(ORG_ID);
      const sortedCountries = countriesData.sort((a, b) => 
        a.countryName.localeCompare(b.countryName)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      addToast("Failed to load countries", 'error');
    }
  };

  const fetchStates = async (country) => {
    try {
      if (!country) return;
      
      const statesData = await supplierAPI.getStates(ORG_ID, country);
      const sortedStates = statesData.sort((a, b) => 
        a.stateName.localeCompare(b.stateName)
      );
      setStates(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      addToast("Failed to load states", 'error');
    }
  };

  const fetchCities = async (state) => {
    try {
      if (!state) return;
      
      const citiesData = await supplierAPI.getCities(ORG_ID, state);
      const sortedCities = citiesData.sort((a, b) => 
        a.cityName.localeCompare(b.cityName)
      );
      setCities(sortedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      addToast("Failed to load cities", 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "supplierName":
      case "contactPerson":
        if (!nameRegex.test(value)) {
          errorMessage = "Only Alphabet are allowed";
        }
        break;
      case "mobile":
        if (!numericRegex.test(value)) {
          errorMessage = "Only Numbers are allowed";
        } else if (value.length > 10) {
          errorMessage = "Mobile No must be ten digit";
        }
        break;
      case "pan":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only AlphaNumeric are allowed";
        } else if (value.length > 10) {
          errorMessage = "PAN must be ten digit";
        }
        break;
      case "tanNo":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 15) {
          errorMessage = "TAN must be fifteen digit";
        }
        break;
      case "pincode":
        if (!numericRegex.test(value)) {
          errorMessage = "Only Numbers are allowed";
        } else if (value.length > 6) {
          errorMessage = "Pincode must be six digit";
        }
        break;
      case "eccNo":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only AlphaNumeric are allowed";
        } else if (value.length > 15) {
          errorMessage = "ECC No must be fifteen digit";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = 
        name === "email" ? value.toLowerCase() : value.toUpperCase();
      
      setForm(prev => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "country") {
      setForm(prev => ({ ...prev, [name]: value, state: "", city: "" }));
    } else if (name === "state") {
      setForm(prev => ({ ...prev, [name]: value, city: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    // Validate form and show toast for first error
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.supplierName.trim()) errors.supplierName = "Supplier Name is required";
    if (!form.shortName.trim()) errors.shortName = "Short Name is required";
    if (!form.supplierType) errors.supplierType = "Supplier Type is required";
    if (!form.contactPerson.trim()) errors.contactPerson = "Contact Person is required";
    if (!form.mobile.trim()) errors.mobile = "Mobile is required";
    if (form.mobile.length !== 10) errors.mobile = "Mobile must be ten digit";
    if (!form.email) {
      errors.email = "Email ID is Required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Invalid MailID Format";
    }
    if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!form.country) errors.country = "Country is required";
    if (!form.state) errors.state = "State is required";
    if (!form.city) errors.city = "City is required";
    if (form.pan && form.pan.length !== 10) errors.pan = "PAN must be ten digit";
    if (form.pincode && form.pincode.length !== 6) errors.pincode = "Pincode must be six digit";
    if (!form.eccNo) errors.eccNo = "ECC No is required";
    if (!form.controlBranch) errors.controlBranch = "Control Branch is required";

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

    // Payload structure similar to CarrierForm
    const payload = {
      id: form.id,
      supplier: form.supplierName,
      supplierShortName: form.shortName,
      supplierType: form.supplierType,
      panNo: form.pan,
      tanNo: form.tanNo,
      contactPerson: form.contactPerson,
      mobileNo: form.mobile,
      addressLine1: form.addressLine1,
      country: form.country,
      state: form.state,
      city: form.city,
      cbranch: form.controlBranch,
      zipCode: form.pincode,
      email: form.email,
      eccNo: form.eccNo,
      active: form.active,
      
      // Additional fields similar to CarrierForm
      branch: form.branch,
      branchCode: form.branchCode,
      warehouse: form.warehouse,
      customer: form.customer,
      client: form.client,
      orgId: form.orgId,
      createdBy: form.createdBy,
      
      // Optional fields
      addressLine2: "",
    };

    console.log("📤 Saving Supplier Payload:", payload);

    try {
      const response = await supplierAPI.saveSupplier(payload);
      console.log("📥 Save Response:", response);

      // Check response status - similar to CarrierForm
      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Supplier updated successfully!" : "Supplier created successfully!");

        addToast(successMessage, 'success');

        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save supplier";

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

  // Options
  const supplierTypeOptions = [
    { value: "VENDOR", label: "VENDOR" },
    { value: "SUB CONTRACTOR", label: "SUB CONTRACTOR" },
  ];

  const controlBranchOptions = [
    { value: loginBranchCode, label: loginBranchCode },
    { value: "ALL", label: "ALL" },
  ];

  const countryOptions = countries.map(country => ({
    value: country.countryName,
    label: country.countryName
  }));

  const stateOptions = states.map(state => ({
    value: state.stateName,
    label: state.stateName
  }));

  const cityOptions = cities.map(city => ({
    value: city.cityName,
    label: city.cityName
  }));

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
          {editData ? "Edit Supplier" : "Add Supplier"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <FloatingInput
            label="Supplier Name *"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            error={fieldErrors.supplierName}
            required
          />
          
          <FloatingInput
            label="Short Name *"
            name="shortName"
            value={form.shortName}
            onChange={handleChange}
            error={fieldErrors.shortName}
            required
          />
          
          <FloatingSelect
            label="Supplier Type *"
            name="supplierType"
            value={form.supplierType}
            onChange={(value) => handleSelectChange("supplierType", value)}
            options={supplierTypeOptions}
            error={fieldErrors.supplierType}
            required
          />
          
          <FloatingInput
            label="PAN *"
            name="pan"
            value={form.pan}
            onChange={handleChange}
            error={fieldErrors.pan}
            required
          />

          <FloatingInput
            label="TAN *"
            name="tanNo"
            value={form.tanNo}
            onChange={handleChange}
            error={fieldErrors.tanNo}
            required
          />
          
          <FloatingInput
            label="Contact Person *"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            error={fieldErrors.contactPerson}
            required
          />
          
          <FloatingInput
            label="Mobile *"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            error={fieldErrors.mobile}
            type="tel"
            required
          />

          <FloatingInput
            label="Email *"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            type="email"
            required
          />

          <div className="md:col-span-4">
            <FloatingInput
              label="Address *"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              error={fieldErrors.addressLine1}
              required
            />
          </div>

          <FloatingSelect
            label="Country *"
            name="country"
            value={form.country}
            onChange={(value) => handleSelectChange("country", value)}
            options={countryOptions}
            error={fieldErrors.country}
            required
          />
          
          <FloatingSelect
            label="State *"
            name="state"
            value={form.state}
            onChange={(value) => handleSelectChange("state", value)}
            options={stateOptions}
            error={fieldErrors.state}
            required
            disabled={!form.country}
          />
          
          <FloatingSelect
            label="City *"
            name="city"
            value={form.city}
            onChange={(value) => handleSelectChange("city", value)}
            options={cityOptions}
            error={fieldErrors.city}
            required
            disabled={!form.state}
          />
          
          <FloatingInput
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
            type="number"
          />

          <FloatingInput
            label="ECC No *"
            name="eccNo"
            value={form.eccNo}
            onChange={handleChange}
            error={fieldErrors.eccNo}
            required
          />

          <FloatingSelect
            label="Control Branch *"
            name="controlBranch"
            value={form.controlBranch}
            onChange={(value) => handleSelectChange("controlBranch", value)}
            options={controlBranchOptions}
            error={fieldErrors.controlBranch}
            required
          />

          {/* ACTIVE CHECKBOX */}
          <div className="flex items-center gap-2 p-1 md:col-span-4">
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

export default SupplierMasterForm;