import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import TabComponent from "../common/TabComponent";
import InvoiceDetails from "./InvoiceDetails";
import TripDetails from "./TripDetails";
import TripsDocs from "./TripsDocs";
import VendorResponse from "./VendorResponse";
import { useNavigate } from "react-router-dom";

const InvoiceMaster = ({ setIsListView }) => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const tabs = [
        { label: "Details" },
        { label: "Trips Details" },
        { label: "Trips Docs" },
        { label: "Vendor Response" },
    ];

    const handleNavigateToVendor = () => {
        navigate('/vendor');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <InvoiceDetails onNavigateToVendor={handleNavigateToVendor} />;
            case 1:
                return <TripDetails />;
            case 2:
                return <TripsDocs />;
            default:
                return <VendorResponse />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all">
            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsListView(true)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        New Vendor Invoice
                    </h2>
                    <span className="text-red-500 text-sm font-medium">• Not Saved</span>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Clear Form
                    </button>
                    <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700 mb-0" />

            {/* 🔹 Tabs */}
            <TabComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 🔹 Tab Content */}
            <div className="mt-6">{renderTabContent()}</div>
        </div>
    );
};

export default InvoiceMaster;
