import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import InputField from "../UI/InputField";

export default function DetailsTab({ form, handleChange }) {
    const vendorRef = useRef(null);
    const navigate = useNavigate();

    // Vendor Search States
    const [vendorSearch, setVendorSearch] = useState("");
    const [selectedVendor, setSelectedVendor] = useState("");
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);

    const mockVendors = [
        { id: 1, name: "TMT Transport" },
        { id: 2, name: "ABC Logistics" },
        { id: 3, name: "Prime Movers" }
    ];

    const filteredVendors = mockVendors.filter((item) =>
        item.name.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendorRef.current && !vendorRef.current.contains(event.target)) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVendorSelect = (vendor) => {
        setSelectedVendor(vendor.name);
        handleChange({ target: { name: "vendor", value: vendor.name } });
        setShowVendorDropdown(false);
    };

    const handleCreateNewVendor = () => {
        setShowVendorDropdown(false);
        navigate("/vendor");
    };

    return (
        <div className="p-6 space-y-1">

            {/* --- ROW 1 --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0">

                <InputField label="Naming Series" name="namingSeries" value="PAY-YY.-MM.-####" disabled />
                <div>
                    <InputField label="Created At" name="createdAt" value="13-11-2025 11:29:46" disabled />
                    <span className="text-xs text-gray-500">Asia/Kolkata</span>
                </div>
                <InputField label="Payout Status" name="payoutStatus" value="Draft" disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
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
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                        <p className="font-medium text-gray-700 dark:text-gray-100">
                                            {vendor.name}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 px-3 py-2">
                                    No vendors found
                                </p>
                            )}

                            <button
                                onClick={handleCreateNewVendor}
                                className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Create a new Vendor
                            </button>
                        </div>
                    )}
                </div>

                <InputField
                    label="Purpose"
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    required
                />

                <InputField
                    label="Invoice Amount"
                    type="number"
                    name="invoiceAmount"
                    value={form.invoiceAmount}
                    onChange={handleChange}
                    required
                />

                <InputField
                    label="Quantity"
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                />

                <InputField
                    label="Total Invoice Amount"
                    type="number"
                    name="totalInvoiceAmount"
                    value={form.totalInvoiceAmount}
                    onChange={handleChange}
                />

                <InputField
                    label="Required For Validation"
                    name="requiredForValidation"
                    value={form.requiredForValidation}
                    onChange={handleChange}
                    placeholder="per trip, per day, etc."
                />

                <InputField
                    label="Payout Reference"
                    name="payoutReference"
                    value={form.payoutReference}
                    onChange={handleChange}
                    placeholder="Eg. Trip ID, LR, Invoice Number etc."
                />

                <InputField
                    label="Invoice"
                    name="invoice"
                    value={form.invoice}
                    onChange={handleChange}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Invoice Type
                    </label>

                    <select
                        name="invoiceType"
                        value={form.invoiceType}
                        onChange={handleChange}
                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 rounded border border-gray-300 dark:border-gray-700">
                        <option value="Manual">Manual</option>
                        <option value="Digital">Digital</option>
                    </select>
                </div>

                {/* Vendor Details Title */}
                <div className="col-span-3 text-base font-semibold text-gray-700 dark:text-gray-200 mt-2">
                    Vendor Details
                </div>

                {/* Vendor Details Input – aligned left */}
                <div className="col-span-3 md:col-span-1">
                    <InputField
                        label="Vendor Details"
                        name="vendorDetails"
                        value={form.vendorDetails}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
}
