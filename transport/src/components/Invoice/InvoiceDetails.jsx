import { useEffect, useRef, useState } from "react";
import InputField from "../UI/InputField";
import { Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InvoiceDetails = () => {
    const [invoiceDate, setInvoiceDate] = useState("11-11-2025");
    const [dueDate, setDueDate] = useState("11-11-2025");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [description, setDescription] = useState("");
    const [additionalCharges, setAdditionalCharges] = useState([]);
    const [vendorSearch, setVendorSearch] = useState("");
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [form, setForm] = useState({
        vendor: '',
        invoiceType: ''
    })

    const vendorRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendorRef.current && !vendorRef.current.contains(event.target)) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const mockVendors = [
        { id: 1, name: "ABC Transport", code: "V001" },
        { id: 2, name: "XYZ Logistics", code: "V002" },
        { id: 3, name: "Global Carriers", code: "V003" },
        { id: 4, name: "Prime Movers", code: "V004" },
        { id: 5, name: "Swift Logistics", code: "V005" },
    ];

    const filteredVendors = mockVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        vendor.code.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    const addNewRow = () => {
        setAdditionalCharges([
            ...additionalCharges,
            {
                id: additionalCharges.length + 1,
                purpose: "",
                amount: "",
                remark: "",
                trip: "",
                status: "Draft"
            }
        ]);
    };

    const updateChargeField = (id, field, value) => {
        setAdditionalCharges(charges =>
            charges.map(charge =>
                charge.id === id ? { ...charge, [field]: value } : charge
            )
        );
    };

    const handleVendorSelect = (vendor) => {
        setSelectedVendor(vendor.name);
        setVendorSearch("");
        setShowVendorDropdown(false);
    };

    const handleCreateNewVendor = () => {
        setShowVendorDropdown(false);
        navigate("/vendor");
    };

    return (
        <div className="mt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="relative" ref={vendorRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vendor <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        value={selectedVendor || vendorSearch}
                        onChange={(e) => {
                            setSelectedVendor("");
                            setVendorSearch(e.target.value);
                            setShowVendorDropdown(true);
                        }}
                        onFocus={() => setShowVendorDropdown(true)}
                        placeholder="Search Vendor..."
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {showVendorDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-2">

                            {filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        onClick={() => handleVendorSelect(vendor)}
                                        className="px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                    >
                                        <p className="font-medium text-gray-600 dark:text-gray-100">
                                            {vendor.name}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 px-3 py-2">No vendors found</p>
                            )}

                            <button
                                onClick={handleCreateNewVendor}
                                className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-md text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Create a new Vendor
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created At
                    </label>
                    <input
                        type="datetime-local"
                        value={form.createdAt || "2025-11-13T11:29"}
                        onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    <span className="text-xs text-gray-500">Asia/Kolkata</span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Invoice Type
                    </label>
                    <select
                        value={form.invoiceType}
                        onChange={(e) =>
                            setForm({ ...form, invoiceType: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Select Type</option>
                        <option value="Manual">Manual</option>
                        <option value="Digital">Digital</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Invoice File
                    </label>
                    <button className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                        Attach
                    </button>
                </div>

            </div>

            {/* Additional Charges Section */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Additional Charges
                </h3>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 px-2">
                    <div className="col-span-1 flex items-center">No.</div>
                    <div className="col-span-2 flex items-center">Purpose <span className="text-red-500">*</span></div>
                    <div className="col-span-2 flex items-center">Amount <span className="text-red-500">*</span></div>
                    <div className="col-span-2 flex items-center">Remark</div>
                    <div className="col-span-2 flex items-center">Trip</div>
                    <div className="col-span-2 flex items-center">Status</div>
                    <div className="col-span-1 flex items-center justify-center">Action</div>
                </div>

                {/* Charges Rows or No Data State */}
                {additionalCharges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        No Data
                    </div>
                ) : (
                    additionalCharges.map((charge) => (
                        <div
                            key={charge.id}
                            className="grid grid-cols-12 gap-2 px-2 py-2 border-b border-gray-200 dark:border-gray-700 items-center"
                        >
                            {/* No. */}
                            <div className="col-span-1 flex items-center text-sm text-gray-600 dark:text-gray-400 h-9">
                                {charge.id}
                            </div>

                            {/* Purpose */}
                            <div className="col-span-2">
                                <InputField
                                    value={charge.purpose}
                                    onChange={(e) => updateChargeField(charge.id, "purpose", e.target.value)}
                                    placeholder="Enter purpose"
                                    compact={true}
                                />
                            </div>

                            {/* Amount */}
                            <div className="col-span-2">
                                <InputField
                                    type="number"
                                    value={charge.amount}
                                    onChange={(e) => updateChargeField(charge.id, "amount", e.target.value)}
                                    placeholder="0.00"
                                    compact={true}
                                />
                            </div>

                            {/* Remark */}
                            <div className="col-span-2">
                                <InputField
                                    value={charge.remark}
                                    onChange={(e) => updateChargeField(charge.id, "remark", e.target.value)}
                                    placeholder="Enter remark"
                                    compact={true}
                                />
                            </div>

                            {/* Trip */}
                            <div className="col-span-2">
                                <select
                                    value={charge.trip}
                                    onChange={(e) => updateChargeField(charge.id, "trip", e.target.value)}
                                    className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Trip</option>
                                    <option value="adhoc-per-trip">Adhoc - Per Trip</option>
                                    <option value="trip-1">Trip 1</option>
                                    <option value="trip-2">Trip 2</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center h-9">
                                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                    {charge.status}
                                </span>
                            </div>

                            {/* Action (Edit Icon) */}
                            <div className="col-span-1 flex justify-center items-center h-9">
                                <button
                                    onClick={() => console.log(`Editing row ${charge.id}`)}
                                    className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700 transition"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Add Row Button */}
                <button
                    onClick={addNewRow}
                    className="mt-4 px-4 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                    Add Row
                </button>
            </div>

            {/* ── Amount Section Full Width ── */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Amount
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Trip Cost */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Trip Cost
                            </label>
                            <InputField
                                type="number"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Sub Total */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sub Total
                            </label>
                            <InputField
                                type="number"
                                placeholder="0.00"
                            />
                        </div>

                        {/* TDS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                TDS
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Select</option>
                                <option value="no-tds">No TDS - OK</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Total Additional Charges */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Total Additional Charges
                            </label>
                            <InputField
                                type="number"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Total Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Total Amount <span className="text-red-500">*</span>
                            </label>
                            <InputField
                                type="number"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Payable Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Payable Amount
                            </label>
                            <InputField
                                type="number"
                                placeholder="0.00"
                                className="text-blue-600 font-semibold"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Invoice Details Full Width ── */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Invoice Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Invoice Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Invoice Number
                            </label>
                            <InputField
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="Enter invoice number"
                            />
                        </div>

                        {/* Invoice Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Invoice Date <span className="text-red-500">*</span>
                            </label>
                            <InputField
                                type="date"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <InputField
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;