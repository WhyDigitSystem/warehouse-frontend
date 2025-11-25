import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import TabComponent from "../common/TabComponent";
import InputField from "../UI/InputField";

const CustomerBookingRequestMaster = ({ setIsListView }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [addPitstop, setAddPitstop] = useState(false);

    const tabs = [
        { label: "Details" },
        { label: "Other Info" },
    ];

    return (
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all">
            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsListView(true)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        New Customer Booking Request
                    </h2>
                    <span className="text-red-500 text-sm font-medium">• Not Saved</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        Clear Form
                    </button>
                    <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>

            {/* 🔹 Tabs */}
            <TabComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 🧩 Details Section */}
            {activeTab === 0 && (
                <div className="mt-6 space-y-8">
                    {/* ── Main Details Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Customer *" placeholder="Select customer" />
                        <InputField label="Status" value="Open" disabled />
                        <InputField label="Origin *" placeholder="Enter origin location" />
                        <InputField label="Destination *" placeholder="Enter destination location" />
                        <InputField label="Vehicle Type" placeholder="Enter vehicle type" />
                    </div>

                    {/* ── Extra Info Section ── */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Extra Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <InputField label="Number of Vehicles" type="number" value="1" />
                            <InputField label="Placement Date" type="date" />
                        </div>
                    </div>
                </div>
            )}

            {/* 🧩 Other Info Section */}
            {activeTab === 1 && (
                <div className="mt-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Order Type"
                            value="Contracted scheduled"
                            placeholder="Select order type"
                        />
                        <InputField
                            label="Service Type"
                            placeholder="Select service type"
                        />
                        <InputField
                            label="Ordering Party"
                            placeholder="Select ordering party"
                        />
                        <InputField
                            label="Material Type"
                            placeholder="Select material type"
                        />
                        <InputField
                            label="Bill to Party"
                            placeholder="Select bill to party"
                        />
                        <InputField
                            label="Docket No"
                            placeholder="Enter docket number"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBookingRequestMaster;