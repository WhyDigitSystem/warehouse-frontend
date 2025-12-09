import { ArrowLeft, Save, X, Plus, List, Calendar, Upload, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { employeeAPI } from "../../../api/employeeAPI";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";

const EmployeeForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    id: editData?.id || 0,
    empCode: editData?.employeeCode || "",
    empName: editData?.employeeName || "",
    gender: editData?.gender || "",
    branch: editData?.branch || "",
    branchCode: editData?.branchCode || "",
    dept: editData?.department || "",
    designation: editData?.designation || "",
    dob: editData?.dateOfBirth ? new Date(editData.dateOfBirth) : null,
    doj: editData?.joiningDate ? new Date(editData.joiningDate) : null,
    active: editData?.active === "Active" || editData?.active === true || true,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Custom Floating Input Component (like GatePassInForm)
  const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", disabled = false, ...props }) => (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
        placeholder=" "
        {...props}
      />
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // Custom Floating Select Component (like GatePassInForm)
  const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, disabled = false, ...props }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""}`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options?.map((option) => (
          <option key={option.value || option} value={option.value || option} className="text-gray-900 dark:text-white">
            {option.label || option}
          </option>
        ))}
      </select>
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // Field labels for toast messages
  const fieldLabels = {
    empCode: "Employee Code",
    empName: "Employee Name",
    gender: "Gender",
    branch: "Branch",
    dept: "Department",
    designation: "Designation",
    dob: "Date of Birth",
    doj: "Date of Joining",
  };

  useEffect(() => {
    fetchInitialData();
    if (editData) {
      initializeForm();
    }
  }, [editData]);

  const fetchInitialData = async () => {
    try {
      console.log("🔄 Fetching initial data for org:", ORG_ID);
      
      const [branchesData, employeesData] = await Promise.all([
        employeeAPI.getBranches(ORG_ID),
        employeeAPI.getEmployees(ORG_ID)
      ]);

      setBranches(branchesData);
      setEmployees(employeesData);

    } catch (error) {
      console.error("❌ Error fetching initial data:", error);
      addToast("Failed to load initial data", 'error');
    }
  };

  const initializeForm = () => {
    if (!editData) return;

    console.log("🔄 Initializing form with editData:", editData);

    const selectedBranch = branches.find(br => br.branch === editData.branch);

    setForm({
      id: editData.id,
      empCode: editData.employeeCode,
      empName: editData.employeeName,
      gender: editData.gender,
      branch: editData.branch,
      branchCode: selectedBranch ? selectedBranch.branchCode : "",
      dept: editData.department,
      designation: editData.designation,
      dob: editData.dateOfBirth ? new Date(editData.dateOfBirth) : null,
      doj: editData.joiningDate ? new Date(editData.joiningDate) : null,
      active: editData.active === "Active" || editData.active === true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    let processedValue = value;
    
    // Handle uppercase for code and name fields
    if (name === "empCode" || name === "empName") {
      processedValue = value.toUpperCase();
    }

    // Handle branch selection to set branchCode
    if (name === "branch") {
      const selectedBranch = branches.find(br => br.branch === value);
      setForm(prev => ({
        ...prev,
        [name]: processedValue,
        branchCode: selectedBranch ? selectedBranch.branchCode : ""
      }));
      return;
    }

    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!form.empCode.trim()) errors.empCode = "Employee code is required";
    if (!form.empName.trim()) errors.empName = "Employee name is required";
    if (!form.gender.trim()) errors.gender = "Gender is required";
    if (!form.branch.trim()) errors.branch = "Branch is required";
    if (!form.dept.trim()) errors.dept = "Department is required";
    if (!form.designation.trim()) errors.designation = "Designation is required";
    if (!form.dob) errors.dob = "Date of birth is required";
    if (!form.doj) errors.doj = "Date of joining is required";

    // Validate age (at least 18 years)
    if (form.dob) {
      const today = new Date();
      const birthDate = new Date(form.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        errors.dob = "Employee must be at least 18 years old";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
        addToast(`${fieldLabel}: ${fieldErrors[firstErrorField]}`, 'error');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(form.id && { id: form.id }),
        employeeCode: form.empCode,
        employeeName: form.empName,
        gender: form.gender,
        branch: form.branch,
        branchCode: form.branchCode,
        department: form.dept,
        designation: form.designation,
        dateOfBirth: form.dob ? new Date(form.dob).toISOString().split('T')[0] : null,
        joiningDate: form.doj ? new Date(form.doj).toISOString().split('T')[0] : null,
        active: form.active,
        orgId: ORG_ID,
        createdBy: loginUserName,
      };

      console.log("📤 Saving Employee Payload:", payload);

      const response = await employeeAPI.saveEmployee(payload);

      console.log("📥 Save Response:", response);

      if (response.status) {
        const successMessage = form.id ? "Employee updated successfully!" : "Employee created successfully!";
        addToast(successMessage, 'success');

        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response.paramObjectsMap?.errorMessage || "Failed to save employee";
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.errorMessage ||
                          error.response?.data?.message ||
                          "Save failed! Try again.";
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({
      id: 0,
      empCode: "",
      empName: "",
      gender: "",
      branch: "",
      branchCode: "",
      dept: "",
      designation: "",
      dob: null,
      doj: null,
      active: true,
    });
    setFieldErrors({});
  };

  const handleEditEmployee = (employee) => {
    setForm({
      id: employee.id,
      empCode: employee.employeeCode,
      empName: employee.employeeName,
      gender: employee.gender,
      branch: employee.branch,
      branchCode: employee.branchCode || "",
      dept: employee.department,
      designation: employee.designation,
      dob: employee.dateOfBirth ? new Date(employee.dateOfBirth) : null,
      doj: employee.joiningDate ? new Date(employee.joiningDate) : null,
      active: employee.active === "Active" || employee.active === true,
    });
    setViewMode("form");
  };

  // Bulk upload handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);
  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };
  const handleSubmitUpload = async () => {
    try {
      // Handle bulk upload logic here
      addToast("Bulk upload functionality to be implemented", 'info');
      handleBulkUploadClose();
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Upload failed", 'error');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
    if (viewMode === "list") {
      handleClear();
    }
  };

  if (viewMode === "list") {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        {/* HEADER - Matching GatePassInForm Design */}
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
                Employee Master - List View
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage all employees
              </p>
            </div>
          </div>
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {/* EMPLOYEES TABLE */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Employee Code</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Employee Name</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Branch</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Department</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Designation</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Joining Date</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Active</th>
                  <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((employee, index) => (
                    <tr
                      key={employee.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.employeeCode}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.employeeName}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.branch}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.department}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.designation}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{employee.joiningDate}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">
                        <span className={`px-2 py-1 rounded text-xs ${
                          employee.active === "Active" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.active === "Active" ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="flex items-center gap-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          title="Edit employee"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, employees.length)} of {employees.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {Math.ceil(employees.length / pageSize)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(employees.length / pageSize)))}
                disabled={currentPage === Math.ceil(employees.length / pageSize)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="5" className="text-gray-900 dark:text-white">5 / page</option>
                <option value="10" className="text-gray-900 dark:text-white">10 / page</option>
                <option value="20" className="text-gray-900 dark:text-white">20 / page</option>
                <option value="50" className="text-gray-900 dark:text-white">50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER - Matching GatePassInForm Design */}
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
              {form.id ? "Edit Employee" : "Create Employee"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {form.id ? "Update employee information" : "Add new employee to the system"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <List className="h-4 w-4" />
          List View
        </button>
      </div>

      {/* ACTION BUTTONS - Matching GatePassInForm Design */}
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
          {isSubmitting ? "Saving..." : (form.id ? "Update" : "Save")}
        </button>
        
        <button
          onClick={handleBulkUploadOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* TABS NAVIGATION - Like GatePassInForm */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
          {['Basic Information'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index === 0 ? "basic" : "additional")}
              className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === (index === 0 ? "basic" : "additional")
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* BASIC INFORMATION TAB */}
        {activeTab === "basic" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Employee Code *"
                name="empCode"
                value={form.empCode}
                onChange={handleChange}
                error={fieldErrors.empCode}
                required
              />
              
              <FloatingInput
                label="Employee Name *"
                name="empName"
                value={form.empName}
                onChange={handleChange}
                error={fieldErrors.empName}
                required
              />

              <FloatingSelect
                label="Gender *"
                name="gender"
                value={form.gender}
                onChange={handleSelectChange}
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" }
                ]}
                error={fieldErrors.gender}
                required
              />

              <FloatingSelect
                label="Branch *"
                name="branch"
                value={form.branch}
                onChange={handleSelectChange}
                options={branches.map(branch => ({ value: branch.branch, label: branch.branch }))}
                error={fieldErrors.branch}
                required
              />

              <FloatingSelect
                label="Department *"
                name="dept"
                value={form.dept}
                onChange={handleSelectChange}
                options={[
                  { value: "HR", label: "HR" },
                  { value: "IT", label: "IT" },
                  { value: "OPERATIONS", label: "Operations" },
                  { value: "LOGISTICS", label: "Logistics" },
                  { value: "FINANCE", label: "Finance" },
                  { value: "SALES", label: "Sales" },
                  { value: "MARKETING", label: "Marketing" }
                ]}
                error={fieldErrors.dept}
                required
              />

              <FloatingSelect
                label="Designation *"
                name="designation"
                value={form.designation}
                onChange={handleSelectChange}
                options={[
                  { value: "MANAGER", label: "Manager" },
                  { value: "SUPERVISOR", label: "Supervisor" },
                  { value: "EXECUTIVE", label: "Executive" },
                  { value: "ASSOCIATE", label: "Associate" },
                  { value: "TRAINEE", label: "Trainee" },
                  { value: "DIRECTOR", label: "Director" },
                  { value: "TEAM_LEAD", label: "Team Lead" }
                ]}
                error={fieldErrors.designation}
                required
              />

              <FloatingInput
                label="Date of Birth *"
                name="dob"
                value={formatDateForInput(form.dob)}
                onChange={(e) => handleDateChange("dob", e.target.value ? new Date(e.target.value) : null)}
                type="date"
                error={fieldErrors.dob}
                required
              />

              <FloatingInput
                label="Date of Joining *"
                name="doj"
                value={formatDateForInput(form.doj)}
                onChange={(e) => handleDateChange("doj", e.target.value ? new Date(e.target.value) : null)}
                type="date"
                error={fieldErrors.doj}
                required
              />
            </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Employee
                </span>
              </div>
            </div>
          </div>
          
        )}

 

        {/* BULK UPLOAD MODAL */}
        {uploadOpen && (
          <CommonBulkUpload
            open={uploadOpen}
            handleClose={handleBulkUploadClose}
            title="Upload Employee Files"
            uploadText="Upload employee file"
            onSubmit={handleSubmitUpload}
            handleFileUpload={handleFileUpload}
            apiUrl={`warehousemastercontroller/EmployeeUpload?orgId=${ORG_ID}&createdBy=${loginUserName}`}
            screen="Employee"
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;