import { useState } from "react";
import { Save, List, ArrowLeft } from "lucide-react";
import TabComponent from "../common/TabComponent";

import CustomerListView from "./CustomerListView";
import InputField from "../UI/InputField";

const CustomerMaster = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isListView, setIsListView] = useState(true);

  const [formData, setFormData] = useState({
    customerCode: "CUS-####",
    customerName: "",
    email: "",
    pan: "",
    gstNumber: "",
    phoneNumber: "",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saved Customer Data:", formData);
    alert("Customer data saved successfully (mock)!");
  };

  const tabs = [
    {
      label: "Details",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Customer Code"
            name="customerCode"
            value={formData.customerCode}
            disabled
          />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <InputField
            label="Customer Name"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
          />
          <InputField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="GST Number"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
          />
          <InputField
            label="PAN"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
          />
        </div>
      ),
    },
    {
      label: "Billing",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <InputField
            label="Address 1"
            name="address1"
            required
            value={formData.address1}
            onChange={handleChange}
          />
          <InputField
            label="Address 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
          />
          <InputField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
            <InputField
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
            <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>Domestic</option>
              <option>Export</option>
            </select>
          </div>
           <InputField
            label="Pincode"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
          />
        </div>
      ),
    },
    {
      label: "POC Details",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <InputField
            label="POC Name"
            name="pocName"
            required
            value={formData.pocName}
            onChange={handleChange}
          />
          <InputField
            label="POC Email"
            name="pocEmail"
            value={formData.pocEmail}
            onChange={handleChange}
          />
          <InputField
            label="POC Number"
            name="pocNumber"
            value={formData.pocNumber}
            onChange={handleChange}
          />
        </div>
      ),
    },
  ];

  if (isListView) return <CustomerListView setIsListView={setIsListView} />;

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          New Customer
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListView(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <TabComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6 transition-all duration-500">
        {tabs[activeTab].component}
      </div>
    </div>
  );
};

export default CustomerMaster;
