import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { masterAPI } from "../../../api/customerAPI"; // Adjust path as needed
import { useToast } from "../../Toast/ToastContext"; // Add toast for notifications

const CustomerMasterForm = ({ editData, onBack }) => {
  const [activeTab, setActiveTab] = useState("client");
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const { addToast } = useToast();

  // State for API data
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [isLoading, setIsLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [form, setForm] = useState({
    customerName: "",
    customerShortName: "",
    contactPerson: "",
    mobileNumber: "",
    emailId: "",
    groupOf: "",
    panNo: "",
    tanNo: "",
    address1: "",
    address2: "",
    gstRegistration: "NO",
    gstNo: "",
    city: "",
    state: "",
    country: "",
    active: true,
  });

  const [clientRows, setClientRows] = useState([
    { client: "", clientCode: "", clientType: "", fifofife: "" }
  ]);

  const [branchRows, setBranchRows] = useState([
    { branch: "", branchCode: "" }
  ]);

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
      console.log("🌍 [CustomerForm] Fetching countries for orgId:", ORG_ID);
      
      const response = await masterAPI.getCountries(ORG_ID);
      console.log("🌍 [CustomerForm] Countries API Response:", response);

      if (Array.isArray(response) && response.length > 0) {
        const sortedCountries = response
          .filter(country => country.countryName)
          .sort((a, b) => (a.countryName || "").localeCompare(b.countryName || ""));
        
        setCountryList(sortedCountries);
        console.log("✅ [CustomerForm] Countries loaded:", sortedCountries.length);
        
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
        console.warn("❌ [CustomerForm] No countries found in response");
        setCountryList([]);
      }
    } catch (error) {
      console.error("❌ [CustomerForm] Error fetching countries:", error);
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
      console.log("🌍 [CustomerForm] Fetching states for country:", countryName);
      
      const response = await masterAPI.getState(ORG_ID, countryName);
      console.log("🌍 [CustomerForm] States API Response:", response);

      if (Array.isArray(response) && response.length > 0) {
        const sortedStates = response
          .filter(state => state.stateName)
          .sort((a, b) => (a.stateName || "").localeCompare(b.stateName || ""));
        
        setStateList(sortedStates);
        console.log("✅ [CustomerForm] States loaded:", sortedStates.length);
      } else {
        console.warn("❌ [CustomerForm] No states found for country:", countryName);
        setStateList([]);
      }
    } catch (error) {
      console.error("❌ [CustomerForm] Error fetching states:", error);
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
      
      const response = await masterAPI.getCity(ORG_ID, stateName);
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
      LOAD EDIT DATA
  ============================================================ */
  useEffect(() => {
    if (editData) {
      const editFormData = {
        customerName: editData.customerName || "",
        customerShortName: editData.customerShortName || "",
        contactPerson: editData.contactPerson || "",
        mobileNumber: editData.mobileNumber || "",
        emailId: editData.emailId || "",
        groupOf: editData.groupOf || "",
        panNo: editData.panNo || "",
        tanNo: editData.tanNo || "",
        address1: editData.address1 || "",
        address2: editData.address2 || "",
        gstRegistration: editData.gstRegistration || "NO",
        gstNo: editData.gstNo || "",
        city: editData.city || "",
        state: editData.state || "",
        country: editData.country || "",
        active: editData.active === "Active",
      };

      setForm(editFormData);

      // Load states and cities for edit data
      if (editData.country) {
        getAllStates(editData.country).then(() => {
          if (editData.state) {
            getAllCities(editData.state);
          }
        });
      }

      if (editData.clientVO?.length) {
        setClientRows(
          editData.clientVO.map((row) => ({
            id: row.id,
            client: row.client,
            clientCode: row.clientCode,
            clientType: row.clientType,
            fifofife: row.fifofife,
            active: row.active === "Active"
          }))
        );
      }

      if (editData.clientBranchVO?.length) {
        setBranchRows(
          editData.clientBranchVO.map((row) => ({
            id: row.id,
            branch: row.branch,
            branchCode: row.branchCode
          }))
        );
      }
    }
  }, [editData]);

  /* ============================================================
      HANDLERS
  ============================================================ */

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle cascading for country and state
    if (name === "country") {
      setForm(prev => ({
        ...prev,
        country: value,
        state: "",
        city: ""
      }));
    } else if (name === "state") {
      setForm(prev => ({
        ...prev,
        state: value,
        city: ""
      }));
    } else if (name === "gstRegistration" && value === "NO") {
      setForm(prev => ({
        ...prev,
        gstRegistration: value,
        gstNo: ""
      }));
    } else {
      const updatedValue = type === "checkbox" ? checked : value;
      setForm(prev => ({
        ...prev,
        [name]: updatedValue
      }));
    }
  };

  const handleClientRowChange = (index, field, value) => {
    const updated = [...clientRows];
    updated[index][field] = value;
    setClientRows(updated);
  };

  const handleBranchRowChange = (index, field, value) => {
    const updated = [...branchRows];
    updated[index][field] = value;
    setBranchRows(updated);
  };

  /* ============================================================
      FLOATING LABEL INPUT
  ============================================================ */

  const FloatingInput = ({ label, name, value, type = "text", onChange, error, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            outline-none transition-all duration-200
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isFocused || value 
              ? "border-indigo-500 ring-2 ring-indigo-500/20" 
              : "border-gray-300 dark:border-gray-700"
            }
            ${error ? "border-red-500 ring-2 ring-red-500/20" : ""}
          `}
        />

        <label
          className={`
            absolute left-3 px-1 transition-all duration-200
            bg-white dark:bg-gray-800 
            pointer-events-none
            ${isFocused || value 
              ? "-top-2 text-xs text-indigo-600 dark:text-indigo-400" 
              : "top-2 text-sm text-gray-500 dark:text-gray-400"
            }
            ${error ? "text-red-600 dark:text-red-400" : ""}
          `}
        >
          {label}
        </label>
        
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  };

  const FloatingSelect = ({ label, name, value, onChange, options, disabled, error }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            outline-none transition-all duration-200 appearance-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isFocused || value 
              ? "border-indigo-500 ring-2 ring-indigo-500/20" 
              : "border-gray-300 dark:border-gray-700"
            }
            ${error ? "border-red-500 ring-2 ring-red-500/20" : ""}
          `}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label
          className={`
            absolute left-3 px-1 transition-all duration-200
            bg-white dark:bg-gray-800 
            pointer-events-none
            ${isFocused || value 
              ? "-top-2 text-xs text-indigo-600 dark:text-indigo-400" 
              : "top-2 text-sm text-gray-500 dark:text-gray-400"
            }
            ${error ? "text-red-600 dark:text-red-400" : ""}
          `}
        >
          {label}
        </label>
        
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  };

  /* ============================================================
      TABLE FLOATING INPUT (unchanged)
  ============================================================ */

  const TableFloatingInput = ({ label, value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        <input
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-2 py-1 text-xs border rounded
            bg-white dark:bg-gray-800 outline-none transition-all duration-200
            ${isFocused || value 
              ? "border-indigo-500 ring-1 ring-indigo-500/20" 
              : "border-gray-300 dark:border-gray-600"
            }
          `}
        />
        <label
          className={`
            absolute left-2 px-1 bg-white dark:bg-gray-800 
            transition-all duration-200 pointer-events-none
            ${isFocused || value 
              ? "-top-2 text-[10px] text-indigo-600 dark:text-indigo-400" 
              : "top-1 text-[11px] text-gray-500 dark:text-gray-400"
            }
          `}
        >
          {label}
        </label>
      </div>
    );
  };

  const TableFloatingSelect = ({ label, value, onChange, options }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-2 py-1 text-xs border rounded
            bg-white dark:bg-gray-800 outline-none transition-all duration-200
            ${isFocused || value 
              ? "border-indigo-500 ring-1 ring-indigo-500/20" 
              : "border-gray-300 dark:border-gray-600"
            }
          `}
        >
          <option value="" disabled hidden>
            Select
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label
          className={`
            absolute left-2 px-1 bg-white dark:bg-gray-800
            transition-all duration-200 pointer-events-none
            ${isFocused || value 
              ? "-top-2 text-[10px] text-indigo-600 dark:text-indigo-400" 
              : "top-1 text-[11px] text-gray-500 dark:text-gray-400"
            }
          `}
        >
          {label}
        </label>
      </div>
    );
  };

  /* ============================================================
      SAVE FUNCTION
  ============================================================ */

  const handleSave = async () => {
    try {
      const payload = {
        ...(editData?.id && { id: editData.id }),
        ...form,
        active: form.active ? "Active" : "Inactive",
        clientVO: clientRows,
        clientBranchVO: branchRows,
        orgId: ORG_ID,
        createdBy: localStorage.getItem("userName") || "SYSTEM",
        branch: localStorage.getItem("branch") || "",
        branchCode: localStorage.getItem("branchcode") || "",
        warehouse: localStorage.getItem("warehouse") || "",
        customer: localStorage.getItem("customer") || "",
        client: localStorage.getItem("client") || "",
      };

      console.log("📤 Saving Customer Payload:", payload);

      const response = await masterAPI.saveCustomer(payload);
      console.log("📥 Save Response:", response);

      if (response.status === true) {
        const successMessage = response?.paramObjectsMap?.message || 
          (editData?.id ? "Customer updated successfully!" : "Customer created successfully!");
        
        addToast(successMessage, 'success');
        onBack(); // Go back to list view
      } else {
        const errorMessage = response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save customer";
        
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Please try again.";
      
      addToast(errorMessage, 'error');
    }
  };

  /* ============================================================
      OPTIONS FOR SELECTS
  ============================================================ */

  const gstOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
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

  /* ============================================================
      RENDER
  ============================================================ */

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <ArrowLeft onClick={onBack} className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Customer" : "Add Customer"}
        </h2>
      </div>

      {/* Loading Indicator for Countries */}
      {isLoading.countries && (
        <div className="flex justify-center items-center py-2 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading countries...</span>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FloatingInput label="Customer Name" name="customerName" value={form.customerName} onChange={handleFormChange} />
          <FloatingInput label="Short Name" name="customerShortName" value={form.customerShortName} onChange={handleFormChange} />
          <FloatingInput label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleFormChange} />
          <FloatingInput label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleFormChange} />
          <FloatingInput label="Email" name="emailId" value={form.emailId} onChange={handleFormChange} />

          <FloatingInput label="Group Of" name="groupOf" value={form.groupOf} onChange={handleFormChange} />
          <FloatingInput label="PAN No" name="panNo" value={form.panNo} onChange={handleFormChange} />
          <FloatingInput label="TAN No" name="tanNo" value={form.tanNo} onChange={handleFormChange} />

          <FloatingInput label="Address 1" name="address1" value={form.address1} onChange={handleFormChange} />
          <FloatingInput label="Address 2" name="address2" value={form.address2} onChange={handleFormChange} />

          {/* API-driven Country, State, City dropdowns */}
          <FloatingSelect 
            label="Country" 
            name="country" 
            value={form.country} 
            onChange={handleFormChange} 
            options={countryOptions}
            disabled={isLoading.countries}
          />
          
          <FloatingSelect 
            label="State" 
            name="state" 
            value={form.state} 
            onChange={handleFormChange} 
            options={stateOptions}
            disabled={!form.country || isLoading.states}
          />
          
          <FloatingSelect 
            label="City" 
            name="city" 
            value={form.city} 
            onChange={handleFormChange} 
            options={cityOptions}
            disabled={!form.state || isLoading.cities}
          />
          
          <FloatingSelect label="GST Registration" name="gstRegistration" value={form.gstRegistration} onChange={handleFormChange} options={gstOptions} />
          
          {form.gstRegistration === "YES" && (
            <FloatingInput label="GST No" name="gstNo" value={form.gstNo} onChange={handleFormChange} />
          )}

          <label className="flex items-center gap-2 mt-2 text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              name="active" 
              checked={form.active} 
              onChange={handleFormChange} 
              className="h-4 w-4"
            />
            Active
          </label>
        </div>
      </div>

      {/* TABS (unchanged) */}
      <div className="bg-white dark:bg-gray-800 p-6 mt-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        {/* Tab Buttons */}
        <div className="flex gap-6 border-b dark:border-gray-700 pb-2 mb-4">
          {["client", "branch"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 capitalize ${
                activeTab === t
                  ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CLIENT TAB (unchanged) */}
        {activeTab === "client" && (
          <div>
            <button
              onClick={() =>
                setClientRows([...clientRows, { client: "", clientCode: "", clientType: "", fifofife: "" }])
              }
              className="px-3 py-1.5 mb-3 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Add Client
            </button>

            <div className="overflow-x-auto border dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-gray-700 dark:text-gray-300">Action</th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">S.No</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Client</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Client Code</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Client Type</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {clientRows.map((row, i) => (
                    <tr key={i} className="border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                      <td className="p-2 text-center">
                        <Trash2
                          className="w-4 h-4 text-red-500 cursor-pointer mx-auto"
                          onClick={() => setClientRows(clientRows.filter((_, x) => x !== i))}
                        />
                      </td>
                      <td className="p-2 text-center text-gray-700 dark:text-gray-300">{i + 1}</td>

                      <td className="p-2">
                        <TableFloatingInput
                          label="Client"
                          value={row.client}
                          onChange={(e) =>
                            handleClientRowChange(i, "client", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-2">
                        <TableFloatingInput
                          label="Code"
                          value={row.clientCode}
                          onChange={(e) =>
                            handleClientRowChange(i, "clientCode", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-2">
                        <TableFloatingSelect
                          label="Type"
                          value={row.clientType}
                          onChange={(e) =>
                            handleClientRowChange(i, "clientType", e.target.value)
                          }
                          options={["FIXED", "VARIABLE"]}
                        />
                      </td>

                      <td className="p-2">
                        <TableFloatingSelect
                          label="Strategy"
                          value={row.fifofife}
                          onChange={(e) =>
                            handleClientRowChange(i, "fifofife", e.target.value)
                          }
                          options={["FEFO", "FIFO", "LILO"]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BRANCH TAB (unchanged) */}
        {activeTab === "branch" && (
          <div>
            <button
              onClick={() =>
                setBranchRows([...branchRows, { branch: "", branchCode: "" }])
              }
              className="px-3 py-1.5 mb-3 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Add Branch
            </button>

            <div className="overflow-x-auto border dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-gray-700 dark:text-gray-300">Action</th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">S.No</th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">Branch</th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">Branch Code</th>
                  </tr>
                </thead>

                <tbody>
                  {branchRows.map((row, i) => (
                    <tr key={i} className="border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                      <td className="p-2 text-center">
                        <Trash2
                          className="w-4 h-4 text-red-500 cursor-pointer mx-auto"
                          onClick={() =>
                            setBranchRows(branchRows.filter((_, x) => x !== i))
                          }
                        />
                      </td>

                      <td className="p-2 text-center text-gray-700 dark:text-gray-300">{i + 1}</td>

                      <td className="p-2">
                        <TableFloatingInput
                          label="Branch"
                          value={row.branch}
                          onChange={(e) =>
                            handleBranchRowChange(i, "branch", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-2">
                        <TableFloatingInput
                          label="Code"
                          value={row.branchCode}
                          onChange={(e) =>
                            handleBranchRowChange(i, "branchCode", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <X className="h-4 w-4" /> Cancel
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
    </div>
  );
};

export default CustomerMasterForm;