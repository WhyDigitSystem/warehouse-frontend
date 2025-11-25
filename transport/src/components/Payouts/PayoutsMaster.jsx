import { useState } from "react";
import TabComponent from "../common/TabComponent";
import { ArrowLeft } from "lucide-react";
import DetailsTab from "./DetailsTab";
import TimelineTab from "./TimelineTab";
import DocsTab from "./DocsTab";
import TripDetailsTab from "./TripDetailsTab";

export default function PayoutsMaster({ setIsListView }) {
    const [activeTab, setActiveTab] = useState(0);

    const [form, setForm] = useState({
        vendor: "",
        invoiceAmount: "",
        totalInvoiceAmount: "",
        payoutReference: "",
        purpose: "",
        quantity: "1",
        requiredForValidation: "",
        invoiceType: "",
        vendorDetails: "",
    });

    const tabs = [
        { label: "Details" },
        { label: "Timeline" },
        { label: "Docs" },
        { label: "Trip Details" },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 0:
                return <DetailsTab form={form} handleChange={handleChange} />;
            case 1:
                return <TimelineTab />;
            case 2:
                return <DocsTab />;
            case 3:
                return <TripDetailsTab />;
            default:
                return <DetailsTab form={form} handleChange={handleChange} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-5 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">

                    {/* Left: Back Button */}
                    <button
                        onClick={() => setIsListView(true)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Center: Title */}
                    <div className="flex-1 flex justify-start ml-2">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            New Payouts
                            <span className="text-sm text-orange-500 ml-2">• Not Saved</span>
                        </h1>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Clear Form
                        </button>
                        <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Save
                        </button>
                    </div>

                </div>

                {/* Tabs */}
                <TabComponent
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Render Active Tab */}
                {renderActiveTab()}
            </div>
        </div>
    );
}