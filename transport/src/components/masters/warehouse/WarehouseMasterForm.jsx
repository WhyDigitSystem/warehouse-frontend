import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import { warehouseAPI } from "../../../api/warehouseAPI"; // Import from the new file
import { useToast } from "../../Toast/ToastContext";

const WarehouseMasterForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const branch = localStorage.getItem("branch") || "";
  const branchCode = localStorage.getItem("branchcode") || "";

  const [clients, setClients] = useState([]);
  const [clientTableData, setClientTableData] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [form, setForm] = useState({
    id: editData?.id || 0,
    warehouse: editData?.warehouse || "",
    branch: branch,
    active: editData?.active === "Active" ? true : false,
    
    // Additional fields
    orgId: ORG_ID,
    createdBy: loginUserName,
    branchCode: branchCode,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [clientTableErrors, setClientTableErrors] = useState([]);

  // Field labels for toast messages
  const fieldLabels = {
    warehouse: "Warehouse",
    branch: "Branch",
  };

  useEffect(() => {
    console.log("🔄 WarehouseMasterForm mounted, editData:", editData);
    fetchClients();
    initializeForm();
  }, [editData]);

  const fetchClients = async () => {
    try {
      console.log("🔍 [Form] Starting client fetch via warehouseAPI...");
      setLoadingClients(true);
      setClients([]);
      
      const clientsData = await warehouseAPI.getClients(ORG_ID);
      
      console.log("✅ [Form] Clients data received:", clientsData);
      console.log("✅ [Form] Number of clients:", clientsData?.length);
      
      if (clientsData && Array.isArray(clientsData) && clientsData.length > 0) {
        const validatedClients = clientsData.map(client => ({
          clientCode: client.clientCode || '',
          client: client.client || '',
          id: client.clientCode || client.client
        }));
        
        console.log("✅ [Form] Setting clients to state:", validatedClients);
        setClients(validatedClients);
      } else {
        console.warn("⚠️ [Form] No clients received from API");
        addToast("No clients available to assign", 'warning');
      }
      
    } catch (error) {
      console.error("❌ [Form] Error fetching clients:", error);
      addToast("Failed to load clients", 'error');
    } finally {
      setLoadingClients(false);
    }
  };

  // Monitor clients state changes
  useEffect(() => {
    console.log("📈 [Form] Clients state updated:", clients.length, "clients");
  }, [clients]);

  const initializeForm = () => {
    if (editData) {
      setForm(prev => ({
        ...prev,
        id: editData.id,
        warehouse: editData.warehouse,
        branch: editData.branch,
        active: editData.active === "Active",
      }));

      // Initialize client table
      if (editData.warehouseClientVO && editData.warehouseClientVO.length > 0) {
        setClientTableData(
          editData.warehouseClientVO.map(item => ({
            id: item.id || Date.now() + Math.random(),
            client: item.client,
            clientCode: item.clientCode,
          }))
        );
        setClientTableErrors(
          editData.warehouseClientVO.map(() => ({ client: "", clientCode: "" }))
        );
      } else {
        setClientTableData([{ id: Date.now(), client: "", clientCode: "" }]);
        setClientTableErrors([{ client: "", clientCode: "" }]);
      }
    } else {
      setClientTableData([{ id: Date.now(), client: "", clientCode: "" }]);
      setClientTableErrors([{ client: "", clientCode: "" }]);
    }
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
      case "warehouse":
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

  const handleAddClientRow = () => {
    // Check if last row is empty
    const lastRow = clientTableData[clientTableData.length - 1];
    if (!lastRow.client || !lastRow.clientCode) {
      addToast("Please fill the current client row before adding new one", 'warning');
      return;
    }

    const newId = Date.now();
    setClientTableData([
      ...clientTableData,
      { id: newId, client: "", clientCode: "" },
    ]);
    setClientTableErrors([
      ...clientTableErrors,
      { client: "", clientCode: "" },
    ]);
  };

  const handleDeleteClientRow = (id) => {
    if (clientTableData.length === 1) {
      addToast("At least one client mapping is required", 'warning');
      return;
    }
    
    const index = clientTableData.findIndex(item => item.id === id);
    setClientTableData(clientTableData.filter(item => item.id !== id));
    setClientTableErrors(clientTableErrors.filter((_, i) => i !== index));
  };

  const handleClientChange = (id, field, value) => {
    const index = clientTableData.findIndex(item => item.id === id);
    
    if (clientTableErrors[index]?.[field]) {
      const newErrors = [...clientTableErrors];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setClientTableErrors(newErrors);
    }

    setClientTableData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "client" && {
                clientCode: clients.find(c => c.client === value)?.clientCode || "",
              }),
            }
          : item
      )
    );
  };

  const getAvailableClients = (currentId) => {
    const selectedClients = clientTableData
      .filter(item => item.id !== currentId && item.client)
      .map(item => item.client);
    
    return clients.filter(client => !selectedClients.includes(client.client));
  };

  const validateForm = () => {
    const errors = {};
    const newTableErrors = [];

    // Validate main form
    if (!form.warehouse.trim()) errors.warehouse = "Warehouse is required";

    // Validate client table
    let clientTableValid = true;
    
    clientTableData.forEach((row, index) => {
      const rowErrors = {};
      if (!row.client) {
        rowErrors.client = "Client is required";
        clientTableValid = false;
      }
      if (!row.clientCode) {
        rowErrors.clientCode = "Client Code is required";
        clientTableValid = false;
      }
      newTableErrors.push(rowErrors);
    });

    // Check for duplicate clients
    const clientNames = clientTableData.map(row => row.client).filter(Boolean);
    const uniqueClients = new Set(clientNames);
    if (uniqueClients.size !== clientNames.length) {
      addToast("Duplicate clients are not allowed", 'error');
      return false;
    }

    setFieldErrors(errors);
    setClientTableErrors(newTableErrors);

    return Object.keys(errors).length === 0 && clientTableValid;
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

    // Payload structure
    const payload = {
      id: form.id,
      branch: form.branch,
      branchCode: form.branchCode,
      warehouse: form.warehouse,
      active: form.active,
      warehouseClientDTO: clientTableData.map(row => ({
        client: row.client,
        clientCode: row.clientCode,
      })),
      orgId: form.orgId,
      createdBy: form.createdBy,
    };

    console.log("📤 Saving Warehouse Payload:", payload);

    try {
      const response = await warehouseAPI.saveWarehouse(payload);

      // Check response status
      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.paramObjectsMap?.message || 
          (form.id ? "Warehouse updated successfully!" : "Warehouse created successfully!");

        addToast(successMessage, 'success');

        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save warehouse";

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
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Warehouse" : "Add Warehouse"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        
      

        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <FloatingInput
            label="Branch"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            error={fieldErrors.branch}
            disabled
          />
          
          <FloatingInput
            label="Warehouse *"
            name="warehouse"
            value={form.warehouse}
            onChange={handleChange}
            error={fieldErrors.warehouse}
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

        {/* CLIENT MAPPINGS SECTION */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
              Client Mappings {loadingClients && "(Loading...)"}
            </h3>
            <button
              onClick={handleAddClientRow}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              disabled={loadingClients}
            >
              <Plus className="h-3 w-3" /> Add Client
            </button>
          </div>

          {/* CLIENT TABLE */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <th className="p-2 text-left w-14">S.No</th>
                  <th className="p-2 text-left font-medium">Client</th>
                  <th className="p-2 text-left font-medium">Client Code</th>
                  <th className="p-2 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {clientTableData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <select
                        value={row.client}
                        onChange={(e) => handleClientChange(row.id, "client", e.target.value)}
                        disabled={loadingClients}
                        className={`w-full bg-white dark:bg-gray-800 border ${
                          clientTableErrors[index]?.client 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                      >
                        <option value="">Select Client {loadingClients ? "(Loading...)" : ""}</option>
                        {getAvailableClients(row.id).map(client => (
                          <option key={client.clientCode} value={client.client}>
                            {client.client} ({client.clientCode})
                          </option>
                        ))}
                      </select>
                      {clientTableErrors[index]?.client && (
                        <div className="text-red-500 text-xs mt-1">
                          {clientTableErrors[index].client}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.clientCode}
                        readOnly
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 rounded px-2 py-1 text-sm text-gray-600 dark:text-gray-300"
                      />
                      {clientTableErrors[index]?.clientCode && (
                        <div className="text-red-500 text-xs mt-1">
                          {clientTableErrors[index].clientCode}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteClientRow(row.id)}
                        disabled={clientTableData.length === 1 || loadingClients}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default WarehouseMasterForm;