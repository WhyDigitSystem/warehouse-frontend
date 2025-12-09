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
    Grid,
    FileText,
    } from "lucide-react";
    import dayjs from "dayjs";
    import { getAllActiveGroups } from "../../../utils/CommonFunctions";
    import { useToast } from "../../Toast/ToastContext";
    import CommonBulkUpload from "../../../utils/CommonBulkUpload";
    import { reversePickAPI } from "../../../api/reversepickAPI";
    import { FloatingInput,FloatingSelect } from "../../../utils/InputFields";
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

    const ReversePickForm = ({ editData, onBack, onSaveSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [modalOpen, setModalOpen] = useState(false);
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

    const [buyerOrderNoList, setBuyerOrderNoList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [editId, setEditId] = useState("");

    const [formData, setFormData] = useState({
        docId: "",
        docDate: dayjs().format("YYYY-MM-DD"),
        buyerOrderNo: "",
        buyerRefNo: "",
        buyerRefDate: "",
        clientName: "",
        customerName: "",
        customerShortName: "",
        inTime: dayjs().format("HH:mm:ss"),
        clientAddress: "",
        customerAddress: "",
        status: "Edit",
        buyersReference: "",
        invoiceNo: "",
        clientShortName: "",
        pickRequestDocDate: "",
        boAmendment: "No",
        buyerOrderDate: "",
        pickRequestDocId: "",
        freeze: false,
        totalPickedQty: "",
        totalRevisedQty: "",
    });

    const [reversePickItems, setReversePickItems] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    // Initialize data
    useEffect(() => {
        fetchDocId();
        fetchPickRequestDetails();
        fetchAllGroups();

        if (editData) {
        handleEditReversePick(editData);
        }
    }, [editData]);

    // Calculate totals when items change
    useEffect(() => {
        const totalOrderQty = reversePickItems.reduce((sum, item) => {
        return sum + (parseFloat(item.orderQty) || 0);
        }, 0);
        
        const totalPickQty = reversePickItems.reduce((sum, item) => {
        return sum + (parseFloat(item.pickQty) || 0);
        }, 0);
        
        const totalRevisedQty = reversePickItems.reduce((sum, item) => {
        return sum + (parseFloat(item.revisedQty) || 0);
        }, 0);

        setFormData(prev => ({ 
        ...prev, 
        totalOrderQty,
        totalPickedQty: totalPickQty,
        totalRevisedQty 
        }));
    }, [reversePickItems]);

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

        const response = await reversePickAPI.getReversePickDocId(params);
        
        if (response?.status === true) {
            setFormData(prev => ({
            ...prev,
            docId: response.paramObjectsMap.reversePickDocId,
            }));
        }
        } catch (error) {
        console.error("Error fetching doc ID:", error);
        addToast("Failed to fetch document ID", "error");
        }
    };

    const fetchPickRequestDetails = async () => {
        try {
        const params = {
            orgId,
            branchCode: loginBranchCode,
            client: loginClient,
            finYear: loginFinYear,
            branch: loginBranch
        };

        const response = await reversePickAPI.getPickRequestDetails(params);
        
        if (response?.status === true) {
            setBuyerOrderNoList(response.paramObjectsMap.pickRequestVO || []);
        }
        } catch (error) {
        console.error("Error fetching pick requests:", error);
        addToast("Failed to fetch pick requests", "error");
        }
    };

    const fetchAllGroups = async () => {
        try {
        const groupData = await getAllActiveGroups(orgId);
        setGroupList(groupData);
        } catch (error) {
        console.error("Error fetching groups:", error);
        addToast("Failed to fetch groups", "error");
        }
    };

    const fetchFillGridData = async () => {
        if (!formData.pickRequestDocId) {
        addToast("Please select a Pick Request first", "warning");
        return;
        }

        try {
        const params = {
            orgId,
            branchCode: loginBranchCode,
            client: loginClient,
            pickRequestDocId: formData.pickRequestDocId
        };

        const response = await reversePickAPI.getFillGridDetails(params);
        
        if (response?.status === true) {
            setFillGridData(response.paramObjectsMap.fillGridDetails || []);
            setModalOpen(true);
        } else {
            addToast("No fill grid data found", "info");
        }
        } catch (error) {
        console.error("Error fetching fill grid data:", error);
        addToast("Failed to fetch fill grid data", "error");
        }
    };

    const handlePickRequestSelect = async (value) => {
        try {
        const selectedPickRequest = buyerOrderNoList.find(
            (order) => order.docId === value
        );

        if (selectedPickRequest) {
            setFormData({
            ...formData,
            pickRequestDocId: selectedPickRequest.docId,
            pickRequestDocDate: selectedPickRequest.docDate,
            buyerOrderNo: selectedPickRequest.buyerOrderNo,
            buyerOrderDate: selectedPickRequest.buyerOrderDate,
            buyerRefNo: selectedPickRequest.buyerRefNo,
            buyerRefDate: selectedPickRequest.buyerRefDate,
            clientName: selectedPickRequest.clientName,
            clientShortName: selectedPickRequest.clientShortName,
            clientAddress: selectedPickRequest.clientAddress,
            customerName: selectedPickRequest.customerName,
            customerShortName: selectedPickRequest.customerShortName,
            customerAddress: selectedPickRequest.customerAddress,
            buyersReference: selectedPickRequest.buyersReference,
            invoiceNo: selectedPickRequest.invoiceNo,
            totalPickedQty: selectedPickRequest.totalPickQty,
            totalRevisedQty: "0",
            });

            if (selectedPickRequest.pickRequestDetailsVO) {
            setReversePickItems(
                selectedPickRequest.pickRequestDetailsVO.map((item) => ({
                id: item.id || Date.now(),
                partNo: item.partNo,
                partDesc: item.partDesc,
                core: item.core,
                bin: item.bin,
                sku: item.sku,
                batchNo: item.batchNo,
                batchDate: item.batchDate,
                orderQty: item.orderQty,
                pickQty: item.pickQty,
                revisedQty: 0,
                grnNo: item.grnNo,
                grnDate: item.grnDate,
                status: item.status,
                }))
            );
            }
            addToast("Pick request details loaded successfully", "success");
        }
        } catch (error) {
        console.error("Error handling pick request selection:", error);
        addToast("Failed to load pick request details", "error");
        }
    };

    const handleEditReversePick = async (record) => {
        setEditId(record.id);
        
        try {
        // Fetch full reverse pick details by ID
        const response = await reversePickAPI.getReversePickById(record.id);
        
        if (response?.status === true && response.paramObjectsMap?.reversePickVO) {
            const reversePickData = response.paramObjectsMap.reversePickVO[0] || record;
            
            setFormData({
            docId: reversePickData.docId,
            docDate: reversePickData.docDate,
            buyerOrderNo: reversePickData.buyerOrderNo,
            buyerRefNo: reversePickData.buyerRefNo,
            buyerRefDate: reversePickData.buyerRefDate,
            clientName: reversePickData.clientName,
            customerName: reversePickData.customerName,
            customerShortName: reversePickData.customerShortName,
            inTime: reversePickData.inTime,
            clientAddress: reversePickData.clientAddress,
            customerAddress: reversePickData.customerAddress,
            status: reversePickData.status,
            buyersReference: reversePickData.buyersReference,
            invoiceNo: reversePickData.invoiceNo,
            clientShortName: reversePickData.clientShortName,
            pickRequestDocDate: reversePickData.pickRequestDocDate,
            boAmendment: reversePickData.boAmendment,
            buyerOrderDate: reversePickData.buyerOrderDate,
            pickRequestDocId: reversePickData.pickRequestDocId,
            freeze: reversePickData.freeze || false,
            totalPickedQty: reversePickData.totalPickQty,
            totalRevisedQty: reversePickData.totalRevisedQty,
            });

            setReversePickItems(
            reversePickData.reversePickDetailsVO?.map((item) => ({
                id: item.id || Date.now(),
                partNo: item.partNo,
                partDesc: item.partDesc,
                core: item.core,
                bin: item.bin,
                sku: item.sku,
                batchNo: item.batchNo,
                batchDate: item.batchDate,
                orderQty: item.orderQty,
                pickQty: item.pickQty,
                revisedQty: item.revisedQty,
                grnNo: item.grnNo,
                grnDate: item.grnDate,
                status: item.status,
            })) || []
            );
            
            addToast("Reverse pick data loaded successfully", "success");
        }
        } catch (error) {
        console.error("Error loading reverse pick details:", error);
        addToast("Failed to load reverse pick details", "error");
        }
    };

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

    const handleDateChange = (field, date) => {
        const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";
        setFormData(prev => ({ ...prev, [field]: formattedDate }));
    };

    const handleAddItem = () => {
        const newItem = {
        id: Date.now(),
        partNo: "",
        partDesc: "",
        core: "",
        bin: "",
        sku: "",
        batchNo: "",
        batchDate: "",
        orderQty: 0,
        pickQty: 0,
        revisedQty: 0,
        grnNo: "",
        grnDate: "",
        status: "PENDING",
        };
        setReversePickItems([...reversePickItems, newItem]);
    };

    const handleItemChange = (id, field, value) => {
        setReversePickItems(prev =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const handleDeleteItem = (id) => {
        setReversePickItems(reversePickItems.filter((item) => item.id !== id));
    };

    const handleClear = () => {
        setFormData({
        docId: "",
        docDate: dayjs().format("YYYY-MM-DD"),
        buyerOrderNo: "",
        buyerRefNo: "",
        buyerRefDate: "",
        clientName: "",
        customerName: "",
        customerShortName: "",
        inTime: dayjs().format("HH:mm:ss"),
        clientAddress: "",
        customerAddress: "",
        status: "Edit",
        buyersReference: "",
        invoiceNo: "",
        clientShortName: "",
        pickRequestDocDate: "",
        boAmendment: "No",
        buyerOrderDate: "",
        pickRequestDocId: "",
        freeze: false,
        totalPickedQty: "",
        totalRevisedQty: "",
        });
        setReversePickItems([]);
        setEditId("");
        setFieldErrors({});
        fetchDocId();
    };

    const handleClearItems = () => {
        setReversePickItems([]);
        setFormData(prev => ({ ...prev, totalRevisedQty: "" }));
    };

    const handleSelectAll = () => {
        if (selectAll) {
        setSelectedRows([]);
        } else {
        setSelectedRows(fillGridData.map((_, index) => index));
        }
        setSelectAll(!selectAll);
    };

    const handleSaveSelectedRows = () => {
        const selectedData = selectedRows.map((index) => fillGridData[index]);
        
        // Merge with existing items, avoid duplicates based on partNo and batchNo
        const existingItems = [...reversePickItems];
        selectedData.forEach(newItem => {
        const exists = existingItems.some(item => 
            item.partNo === newItem.partNo && item.batchNo === newItem.batchNo
        );
        if (!exists) {
            existingItems.push({
            id: Date.now() + Math.random(),
            partNo: newItem.partNo,
            partDesc: newItem.partDesc,
            core: newItem.core,
            bin: newItem.bin,
            sku: newItem.sku,
            batchNo: newItem.batchNo,
            batchDate: newItem.batchDate,
            orderQty: newItem.orderQty,
            pickQty: newItem.pickQty,
            revisedQty: 0,
            grnNo: newItem.grnNo,
            grnDate: newItem.grnDate,
            status: "PENDING",
            });
        }
        });
        
        setReversePickItems(existingItems);
        setSelectedRows([]);
        setSelectAll(false);
        setModalOpen(false);
        addToast(`${selectedData.length} items added to grid`, "success");
    };

    // Save Reverse Pick
    const handleSave = async () => {
        if (isSubmitting) return;
        
        const errors = {};

        // Validate main form fields
        if (!formData.pickRequestDocId) errors.pickRequestDocId = "Pick Request ID is required";
        if (!formData.status) errors.status = "Status is required";

        // Validate table data
        let itemsValid = true;
        reversePickItems.forEach((item) => {
        if (parseFloat(item.revisedQty) < 0) {
            itemsValid = false;
        }
        });

        if (!itemsValid) {
        addToast("Revised quantity cannot be negative", "error");
        return;
        }

        if (reversePickItems.length === 0) {
        addToast("Please add at least one item", "error");
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
            ...formData,
            reversePickDetailsDTO: reversePickItems.map((item) => ({
            ...item,
            revisedQty: parseFloat(item.revisedQty) || 0,
            orderQty: parseFloat(item.orderQty) || 0,
            pickQty: parseFloat(item.pickQty) || 0,
            })),
            orgId: parseInt(orgId),
            branch: loginBranch,
            branchCode: loginBranchCode,
            client: loginClient,
            customer: loginCustomer,
            warehouse: loginWarehouse,
            finYear: loginFinYear,
            createdBy: loginUserName,
        };

        console.log("📤 Saving Reverse Pick:", saveData);

        const response = await reversePickAPI.createUpdateReversePick(saveData);

        if (response.status === true) {
            handleClear();
            onSaveSuccess && onSaveSuccess();
            addToast(
            editId 
                ? "Reverse Pick updated successfully" 
                : "Reverse Pick created successfully", 
            "success"
            );
            onBack();
        } else {
            const errorMessage = response.message || "Reverse Pick creation failed";
            addToast(errorMessage, "error");
        }
        } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.response?.data?.message || "Reverse Pick creation failed";
        addToast(errorMessage, "error");
        } finally {
        setIsSubmitting(false);
        }
    };


    const FloatingTextArea = ({ label, name, value, onChange, error, required = false, disabled = false, rows = 2, ...props }) => (
        <div className="relative">
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows}
            className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
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
                {editData ? "Edit Reverse Pick" : "Create Reverse Pick"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage reverse picks
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
                // Sample file download logic
                const sampleFile = "/sample-files/sample_reverse_pick.xlsx";
                const link = document.createElement("a");
                link.href = sampleFile;
                link.download = "sample_reverse_pick.xlsx";
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
            {/* TABS NAVIGATION */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
            <button
                onClick={() => setActiveTab("basic")}
                className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === "basic"
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                Basic Information
            </button>
            <button
                onClick={() => setActiveTab("additional")}
                className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === "additional"
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                Additional Information
            </button>
            </div>

            {/* BASIC INFORMATION TAB */}
            {activeTab === "basic" && (
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FloatingInput
                    label="Document No"
                    name="docId"
                    value={formData.docId}
                    onChange={handleInputChange}
                    disabled
                />
                
                <FloatingInput
                    label="Document Date"
                    name="docDate"
                    value={formData.docDate}
                    onChange={handleInputChange}
                    type="date"
                    disabled
                />

                <FloatingSelect
                    label="Pick Request ID *"
                    name="pickRequestDocId"
                    value={formData.pickRequestDocId}
                    onChange={handleSelectChange}
                    options={buyerOrderNoList.map(order => ({ 
                    value: order.docId, 
                    label: order.docId 
                    }))}
                    error={fieldErrors.pickRequestDocId}
                    required
                    disabled={!!editId}
                />

                <FloatingInput
                    label="Pick Request Date"
                    name="pickRequestDocDate"
                    value={formData.pickRequestDocDate}
                    onChange={handleInputChange}
                    type="date"
                    disabled
                />

                <FloatingInput
                    label="Buyer Order No"
                    name="buyerOrderNo"
                    value={formData.buyerOrderNo}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Buyer Order Date"
                    name="buyerOrderDate"
                    value={formData.buyerOrderDate}
                    onChange={handleInputChange}
                    type="date"
                    disabled
                />

                <FloatingInput
                    label="Buyer Ref No"
                    name="buyerRefNo"
                    value={formData.buyerRefNo}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Buyer Ref Date"
                    name="buyerRefDate"
                    value={formData.buyerRefDate}
                    onChange={handleInputChange}
                    type="date"
                    disabled
                />

                <FloatingSelect
                    label="Status *"
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    options={[
                    { value: "Edit", label: "Edit" },
                    { value: "Confirm", label: "Confirm" },
                    { value: "Cancelled", label: "Cancelled" },
                    ]}
                    error={fieldErrors.status}
                    required
                    disabled={formData.freeze}
                />

                <FloatingSelect
                    label="BO Amendment"
                    name="boAmendment"
                    value={formData.boAmendment}
                    onChange={handleSelectChange}
                    options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                    ]}
                    disabled={formData.freeze}
                />

                <FloatingInput
                    label="In Time"
                    name="inTime"
                    value={formData.inTime}
                    onChange={handleInputChange}
                    disabled
                />
                </div>
            </div>
            )}

            {/* ADDITIONAL INFORMATION TAB */}
            {activeTab === "additional" && (
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FloatingInput
                    label="Client Name"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Client Short Name"
                    name="clientShortName"
                    value={formData.clientShortName}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Customer Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Customer Short Name"
                    name="customerShortName"
                    value={formData.customerShortName}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Buyers Reference"
                    name="buyersReference"
                    value={formData.buyersReference}
                    onChange={handleInputChange}
                    disabled
                />

                <FloatingInput
                    label="Invoice No"
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                    disabled
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FloatingTextArea
                    label="Client Address"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleInputChange}
                    rows={3}
                    disabled
                />

                <FloatingTextArea
                    label="Customer Address"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    rows={3}
                    disabled
                />
                </div>
            </div>
            )}
        </div>

        {/* ORDER ITEMS TABLE SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reverse Pick Items</h3>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {reversePickItems.length} items
                </span>
                {formData.totalOrderQty > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    Total Order: {formData.totalOrderQty}
                </span>
                )}
                {formData.totalPickedQty > 0 && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    Total Picked: {formData.totalPickedQty}
                </span>
                )}
                {formData.totalRevisedQty > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                    Total Revised: {formData.totalRevisedQty}
                </span>
                )}
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
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                disabled={!formData.pickRequestDocId}
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

            {/* Order Items Table */}
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
                    Part No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                    Part Desc
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                    Core
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Bin
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Batch No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Order Qty
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Pick Qty
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Revised Qty
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    GRN No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    GRN Date
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Status
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reversePickItems.length === 0 ? (
                    <tr>
                    <td colSpan="13" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                        No items added. Click "Add Item" or "Fill Grid" to start.
                    </td>
                    </tr>
                ) : (
                    reversePickItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Action */}
                        <td className="px-3 py-2">
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                            title="Delete"
                            disabled={formData.freeze}
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                        </td>

                        {/* S.No */}
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">
                        {index + 1}
                        </td>

                        {/* Part No */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.partNo}
                            onChange={(e) => handleItemChange(item.id, "partNo", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Part Desc */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.partDesc}
                            onChange={(e) => handleItemChange(item.id, "partDesc", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Core */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.core}
                            onChange={(e) => handleItemChange(item.id, "core", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Bin */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.bin}
                            onChange={(e) => handleItemChange(item.id, "bin", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Batch No */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.batchNo}
                            onChange={(e) => handleItemChange(item.id, "batchNo", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Order Qty */}
                        <td className="px-3 py-2">
                        <input
                            type="number"
                            value={item.orderQty}
                            onChange={(e) => handleItemChange(item.id, "orderQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled
                        />
                        </td>

                        {/* Pick Qty */}
                        <td className="px-3 py-2">
                        <input
                            type="number"
                            value={item.pickQty}
                            onChange={(e) => handleItemChange(item.id, "pickQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled
                        />
                        </td>

                        {/* Revised Qty */}
                        <td className="px-3 py-2">
                        <input
                            type="number"
                            value={item.revisedQty}
                            onChange={(e) => handleItemChange(item.id, "revisedQty", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step="0.01"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* GRN No */}
                        <td className="px-3 py-2">
                        <input
                            type="text"
                            value={item.grnNo}
                            onChange={(e) => handleItemChange(item.id, "grnNo", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* GRN Date */}
                        <td className="px-3 py-2">
                        <input
                            type="date"
                            value={item.grnDate || ""}
                            onChange={(e) => handleItemChange(item.id, "grnDate", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        />
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2">
                        <select
                            value={item.status}
                            onChange={(e) => handleItemChange(item.id, "status", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            disabled={formData.freeze}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
                {/* Add total row at the bottom */}
                {reversePickItems.length > 0 && (
                <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
                    <tr>
                    <td colSpan="7" className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                        Totals:
                    </td>
                    <td className="px-3 py-2 font-semibold text-blue-600 dark:text-blue-400">
                        {formData.totalOrderQty}
                    </td>
                    <td className="px-3 py-2 font-semibold text-green-600 dark:text-green-400">
                        {formData.totalPickedQty}
                    </td>
                    <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400">
                        {formData.totalRevisedQty}
                    </td>
                    <td colSpan="3"></td>
                    </tr>
                </tfoot>
                )}
            </table>
            </div>

        </div>

        {/* Fill Grid Modal */}
        {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Fill Grid Details
                </h3>
                <button
                    onClick={() => {
                    setModalOpen(false);
                    setSelectedRows([]);
                    setSelectAll(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>
                </div>
                
                <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                    Select All ({selectedRows.length} selected)
                    </label>
                </div>
                
                <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                            Select
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Part No
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Part Desc
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Bin
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Batch No
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            GRN No
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Order Qty
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pick Qty
                        </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {fillGridData.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                            No data available
                            </td>
                        </tr>
                        ) : (
                        fillGridData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2">
                                <input
                                type="checkbox"
                                checked={selectedRows.includes(index)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                    setSelectedRows([...selectedRows, index]);
                                    } else {
                                    setSelectedRows(selectedRows.filter(i => i !== index));
                                    }
                                }}
                                className="h-4 w-4 text-blue-600 rounded"
                                />
                            </td>
                            <td className="px-3 py-2">{item.partNo}</td>
                            <td className="px-3 py-2">{item.partDesc}</td>
                            <td className="px-3 py-2">{item.bin}</td>
                            <td className="px-3 py-2">{item.batchNo}</td>
                            <td className="px-3 py-2">{item.grnNo}</td>
                            <td className="px-3 py-2">{item.orderQty}</td>
                            <td className="px-3 py-2">{item.pickQty}</td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
                
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => {
                    setModalOpen(false);
                    setSelectedRows([]);
                    setSelectAll(false);
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveSelectedRows}
                    disabled={selectedRows.length === 0}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Selected ({selectedRows.length})
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Bulk Upload Dialog */}
        <CommonBulkUpload
            open={uploadOpen}
            handleClose={() => setUploadOpen(false)}
            title="Upload Reverse Pick Files"
            uploadText="Upload file"
            downloadText="Sample File"
            onSubmit={handleSave}
            sampleFileDownload="/sample-files/sample_reverse_pick.xlsx"
            handleFileUpload={() => {}}
            apiUrl={`${API_URL}/api/reversePick/ExcelUploadForReversePick?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
            screen="Reverse Pick"
        />
        </div>
    );
    };

    export default ReversePickForm;