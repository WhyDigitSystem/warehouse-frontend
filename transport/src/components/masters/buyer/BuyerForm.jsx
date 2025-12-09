// BuyerMasterForm.jsx - SIMPLIFIED VERSION
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
import { buyerAPI } from "../../../api/buyerAPI";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import * as XLSX from "xlsx";

const BuyerMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  
  const loginBranchCode = localStorage.getItem("branchcode") || "";
  const loginBranch = localStorage.getItem("branch") || "";
  const loginWarehouse = localStorage.getItem("warehouse") || "";
  const loginCustomer = localStorage.getItem("customer") || "";
  const loginClient = localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [form, setForm] = useState({
    id: editData?.id || 0,
    buyerName: editData?.buyer || "",
    shortName: editData?.buyerShortName || "",
    buyerType: editData?.buyerType || "",
    pan: editData?.panNo || "",
    tanNo: editData?.tanNo || "",
    contactPerson: editData?.contactPerson || "",
    mobile: editData?.mobileNo || "",
    addressLine1: editData?.addressLine1 || "",
    country: editData?.country || "",
    state: editData?.state || "",
    city: editData?.city || "",
    controlBranch: editData?.cbranch || loginBranchCode,
    pincode: editData?.zipCode || "",
    email: editData?.email || "",
    gst: editData?.gst || "YES",
    gstNo: editData?.gstNo || "",
    eccNo: editData?.eccNo || "",
    active: editData?.active === "Active" || editData?.active === true ? true : false,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  /* ============================================================
      API FUNCTIONS - COUNTRY, STATE, CITY
  ============================================================ */

  // Fetch countries on component mount
  useEffect(() => {
    getAllCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (form.country) {
      getAllStates(form.country);
    } else {
      setStateList([]);
      setCityList([]);
      setForm(prev => ({ ...prev, state: "", city: "" }));
    }
  }, [form.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (form.state) {
      getAllCities(form.state);
    } else {
      setCityList([]);
      setForm(prev => ({ ...prev, city: "" }));
    }
  }, [form.state]);

  // Get all countries from API
  const getAllCountries = async () => {
    try {
      setIsLoading(prev => ({ ...prev, countries: true }));
      console.log("🌍 [BuyerForm] Fetching countries for orgId:", ORG_ID);
      
      const response = await buyerAPI.getCountries(ORG_ID);
      console.log("🌍 [BuyerForm] Countries API Response:", response);

      if (Array.isArray(response) && response.length > 0) {
        const sortedCountries = response
          .filter(country => country.countryName)
          .sort((a, b) => (a.countryName || "").localeCompare(b.countryName || ""));
        
        setCountryList(sortedCountries);
        console.log("✅ [BuyerForm] Countries loaded:", sortedCountries.length);
        
        // Set default country if not already set and we have edit data
        if (!form.country && sortedCountries.length > 0) {
          const india = sortedCountries.find(country => 
            (country.countryName || "").toUpperCase() === "INDIA"
          );
          if (india) {
            setForm(prev => ({ ...prev, country: india.countryName }));
          }
        }
      } else {
        console.warn("❌ [BuyerForm] No countries found in response");
        setCountryList([]);
      }
    } catch (error) {
      console.error("❌ [BuyerForm] Error fetching countries:", error);
      addToast("Failed to fetch countries", "error");
      setCountryList([]);
    } finally {
      setIsLoading(prev => ({ ...prev, countries: false }));
    }
  };

  // Get states based on country
  const getAllStates = async (countryName) => {
    try {
      if (!countryName) {
        setStateList([]);
        return;
      }
      
      setIsLoading(prev => ({ ...prev, states: true }));
      console.log("🌍 [BuyerForm] Fetching states for country:", countryName);
      
      const response = await buyerAPI.getStates(ORG_ID, countryName);
      console.log("🌍 [BuyerForm] States API Response:", response);

      let states = [];
      
      // Handle different API response structures
      if (Array.isArray(response)) {
        states = response;
      } else if (response?.data?.paramObjectsMap?.stateVO) {
        states = response.data.paramObjectsMap.stateVO;
      } else if (response?.stateVO) {
        states = response.stateVO;
      } else if (response?.data) {
        states = Array.isArray(response.data) ? response.data : [];
      }

      if (states && states.length > 0) {
        const sortedStates = states
          .filter(state => state.stateName)
          .sort((a, b) => (a.stateName || "").localeCompare(b.stateName || ""));
        
        setStateList(sortedStates);
        console.log("✅ [BuyerForm] States loaded:", sortedStates.length);
      } else {
        console.warn("❌ [BuyerForm] No states found for country:", countryName);
        setStateList([]);
      }
    } catch (error) {
      console.error("❌ [BuyerForm] Error fetching states:", error);
      addToast("Failed to fetch states", "error");
      setStateList([]);
    } finally {
      setIsLoading(prev => ({ ...prev, states: false }));
    }
  };

    // Get cities based on state
    const getAllCities = async (stateName) => {
      try {
        if (!stateName) {
          setCityList([]);
          return;
        }
        
        setIsLoading(prev => ({ ...prev, cities: true }));
        console.log("🌍 [CustomerForm] Fetching cities for state:", stateName);
        
        const response = await buyerAPI.getCity(ORG_ID, stateName);
        console.log("🌍 [CustomerForm] Cities API Response:", response);
  
        if (Array.isArray(response) && response.length > 0) {
          const sortedCities = response
            .filter(city => city.cityName)
            .sort((a, b) => (a.cityName || "").localeCompare(b.cityName || ""));
          
          setCityList(sortedCities);
          console.log("✅ [CustomerForm] Cities loaded:", sortedCities.length);
        } else {
          console.warn("❌ [CustomerForm] No cities found for state:", stateName);
          setCityList([]);
        }
      } catch (error) {
        console.error("❌ [CustomerForm] Error fetching cities:", error);
        addToast("Failed to fetch cities", "error");
        setCityList([]);
      } finally {
        setIsLoading(prev => ({ ...prev, cities: false }));
      }
    };
 

  /* ============================================================
      HANDLERS
  ============================================================ */

  // Simple change handler like CustomerMasterForm
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Handle special cases
    if (name === "gst" && value === "NO") {
      setForm(prev => ({
        ...prev,
        gst: value,
        gstNo: ""
      }));
    } else {
      const updatedValue = type === "checkbox" ? checked : 
                          name === "email" ? value.toLowerCase() : value.toUpperCase();
      
      setForm(prev => ({
        ...prev,
        [name]: updatedValue
      }));
    }
  };

  // Handle select changes (for select components that might return objects)
  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Extract string value from select object if needed
    let stringValue = value;
    if (value && typeof value === 'object') {
      stringValue = value.value || value.label || String(value);
    }

    setForm(prev => ({
      ...prev,
      [name]: stringValue
    }));
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
    addToast("Buyers uploaded successfully!", "success");
  };

  const handleDownloadSample = () => {
    try {
      const sampleData = [
        {
          "Buyer Name": "SAMPLE_BUYER",
          "Short Name": "SAMPLE_SHORT",
          "Buyer Type": "LOCAL",
          "Contact Person": "JOHN DOE",
          "Mobile": "9876543210",
          "Email": "sample@email.com",
          "PAN": "ABCDE1234F",
          "TAN": "TAN123456789",
          "Address": "Sample Address Line",
          "Country": "INDIA",
          "State": "TAMIL NADU",
          "City": "CHENNAI",
          "Pincode": "600001",
          "GST Registration": "YES",
          "GST No": "GST123456789",
          "ECC No": "ECC123456789",
          "Control Branch": loginBranchCode,
          "Active": "Yes"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Buyers");
      const fileName = `Sample_Buyer_Upload_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      addToast("Sample file downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      addToast("Failed to download sample file", "error");
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.buyerName.trim()) errors.buyerName = "Buyer Name is required";
    if (!form.shortName.trim()) errors.shortName = "Short Name is required";
    if (!form.contactPerson.trim()) errors.contactPerson = "Contact Person is required";
    if (!form.mobile.trim()) errors.mobile = "Mobile is required";
    if (form.mobile.length !== 10) errors.mobile = "Mobile must be 10 digits";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!emailRegex.test(form.email)) errors.email = "Invalid email format";
    if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!form.country.trim()) errors.country = "Country is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (form.pan && form.pan.length !== 10) errors.pan = "PAN must be 10 characters";
    if (form.gst === "YES" && !form.gstNo.trim()) errors.gstNo = "GST No is required";
    if (form.gst === "YES" && form.gstNo.length !== 15) errors.gstNo = "GST must be 15 characters";
    if (form.pincode && form.pincode.length !== 6) errors.pincode = "Pincode must be 6 digits";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...(form.id && { id: form.id }),
        buyer: form.buyerName,
        buyerShortName: form.shortName,
        buyerType: form.buyerType,
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
        gst: form.gst,
        gstNo: form.gstNo,
        eccNo: form.eccNo,
        active: form.active,

        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        warehouse: loginWarehouse,
        customer: loginCustomer,
        client: loginClient,
        orgId: ORG_ID,
      };

      console.log("📤 Saving Buyer Payload:", payload);

      const response = await buyerAPI.saveBuyer(payload);
      console.log("📥 Save Response:", response);

      if (response.status === true) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Buyer updated successfully!" : "Buyer created successfully!");
        
        addToast(successMessage, 'success');
        onSaveSuccess && onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save buyer";
        
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
      buyerName: "",
      shortName: "",
      buyerType: "",
      pan: "",
      tanNo: "",
      contactPerson: "",
      mobile: "",
      addressLine1: "",
      country: "",
      state: "",
      city: "",
      controlBranch: loginBranchCode,
      pincode: "",
      email: "",
      gst: "YES",
      gstNo: "",
      eccNo: "",
      active: true,
    });
    setFieldErrors({});
  };

  /* -------------------------- OPTIONS -------------------------- */
  const buyerTypeOptions = [
    { value: "LOCAL", label: "LOCAL" },
    { value: "EXPORT", label: "EXPORT" },
    { value: "STOCK TRANSFER", label: "STOCK TRANSFER" },
  ];

  const gstOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];

  const controlBranchOptions = [
    { value: loginBranchCode, label: loginBranchCode },
    { value: "ALL", label: "ALL" },
  ];

  const countryOptions = countryList.map(country => ({
    value: country.countryName,
    label: country.countryName
  }));

  const stateOptions = stateList.map(state => ({
    value: state.stateName,
    label: state.stateName
  }));

  const cityOptions = cityList.map(city => ({
    value: city.cityName,
    label: city.cityName
  }));

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
              {editData ? "Edit Buyer" : "Create Buyer"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage buyer master entries
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
          title="Upload Buyers"
          uploadText="Upload Excel File"
          downloadText="Download Sample"
          onSubmit={handleSubmitUpload}
          sampleFileDownload={null}
          handleFileUpload={handleFileUpload}
          apiUrl={`/api/warehousemastercontroller/BuyerUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&orgId=${ORG_ID}&warehouse=${loginWarehouse}`}
          screen="Buyer Master"
        />
      )}

      {/* MAIN FORM CONTENT */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* Loading States */}
        {isLoading.countries && (
          <div className="flex justify-center items-center py-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading countries...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Buyer Information */}
          <FloatingInput
            label="Buyer Name *"
            name="buyerName"
            value={form.buyerName}
            onChange={handleChange}
            error={fieldErrors.buyerName}
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
  label="Buyer Type *"
  name="buyerType"
  value={form.buyerType}
  onChange={(value) => handleSelectChange("buyerType", value)}
  options={buyerTypeOptions}
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
            required
          />

          <FloatingInput
            label="Email *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
          />

          <FloatingInput
            label="PAN"
            name="pan"
            value={form.pan}
            onChange={handleChange}
            error={fieldErrors.pan}
          />

          <FloatingInput
            label="TAN"
            name="tanNo"
            value={form.tanNo}
            onChange={handleChange}
            error={fieldErrors.tanNo}
          />

          {/* Address Information */}
          <div className="md:col-span-2 lg:col-span-4">
            <FloatingInput
              label="Address *"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              error={fieldErrors.addressLine1}
              required
            />
          </div>

          {/* API-driven Country, State, City dropdowns */}
   <FloatingSelect
  label="Country *"
  name="country"
  value={form.country}
  onChange={(value) => handleSelectChange("country", value)} // ✅ Correct
  options={countryOptions}
  error={fieldErrors.country}
  disabled={isLoading.countries}
  required
/>

       <FloatingSelect
  label="State *"
  name="state"
  value={form.state}
  onChange={(value) => handleSelectChange("state", value)} // ✅ Correct
  options={stateOptions}
  error={fieldErrors.state}
  disabled={!form.country || isLoading.states}
  required
/>

        <FloatingSelect
  label="City *"
  name="city"
  value={form.city}
  onChange={(value) => handleSelectChange("city", value)} // ✅ Correct
  options={cityOptions}
  error={fieldErrors.city}
  disabled={!form.state || isLoading.cities}
  required
/>

          <FloatingInput
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
          />

          {/* GST Information */}
          <FloatingSelect
            label="GST Registration *"
            name="gst"
            value={form.gst}
            onChange={handleChange}
            options={gstOptions}
            required
          />

          {form.gst === "YES" && (
            <FloatingInput
              label="GST No *"
              name="gstNo"
              value={form.gstNo}
              onChange={handleChange}
              error={fieldErrors.gstNo}
              required
            />
          )}

          <FloatingInput
            label="ECC No"
            name="eccNo"
            value={form.eccNo}
            onChange={handleChange}
            error={fieldErrors.eccNo}
          />

         <FloatingSelect
  label="Control Branch *"
  name="controlBranch"
  value={form.controlBranch}
  onChange={(value) => handleSelectChange("controlBranch", value)} // ✅ Already correct
  options={controlBranchOptions}
  required
/>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2 p-1 md:col-span-2 lg:col-span-4">
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

export default BuyerMasterForm;