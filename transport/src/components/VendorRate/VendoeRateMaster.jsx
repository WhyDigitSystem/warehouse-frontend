import React, { useState } from "react";

import { Save, RotateCcw, ChevronLeft } from "lucide-react";
import VendorRateListView from "./VendorRateListView";
import InputField from "../UI/InputField";

const VendorRateMaster = () => {
  const [isListView, setIsListView] = useState(true);
  const [formData, setFormData] = useState({
    status: "Active",
    vendor: "",
    namingSeries: "RM-#####",
    effectiveFrom: "",
    effectiveTo: "",
    priority: "1",
    active: true,
    origin: "",
    destination: "",
    rate: "",
    vehicleType: "",
    weight: "",
    rateType: "Contractual",
    detentionCharge: "",
    rank: "1",
    unloadingCharges: "0.00",
    extraKmCharges: "0.00",
    remark: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Saving Vendor Rate Master:", formData);
    alert("Vendor Rate Saved Successfully ✅");
  };

  const handleClear = () => {
    setFormData({
      ...formData,
      vendor: "",
      origin: "",
      destination: "",
      rate: "",
      vehicleType: "",
      weight: "",
      detentionCharge: "",
      remark: "",
    });
  };

  if (isListView) return <VendorRateListView setIsListView={setIsListView} />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListView(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            New Vendor Rate Master
          </h2>
          <span className="text-sm text-orange-500 ml-2">● Not Saved</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1 text-gray-700 dark:text-gray-200"
          >
            <RotateCcw className="h-4 w-4" /> Clear Form
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InputField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        />
        <InputField
          label="Vendor *"
          name="vendor"
          value={formData.vendor}
          onChange={handleChange}
          required
        />
        <InputField
          label="Naming Series"
          name="namingSeries"
          value={formData.namingSeries}
          onChange={handleChange}
        />
        <InputField
          label="Effective To"
          name="effectiveTo"
          type="date"
          value={formData.effectiveTo}
          onChange={handleChange}
        />
        <InputField
          label="Effective From"
          name="effectiveFrom"
          type="date"
          value={formData.effectiveFrom}
          onChange={handleChange}
        />
        <InputField
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        />

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-gray-700 dark:text-gray-300 text-sm">
            Active
          </label>
        </div>
        </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
    

        <InputField
          label="Origin *"
          name="origin"
          value={formData.origin}
          onChange={handleChange}
          required
        />
        <InputField
          label="Destination *"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          required
        />
        <InputField
          label="Rate *"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          required
        />
        <InputField
          label="Vehicle Type"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
        />
        <InputField
          label="Weight (Ton)"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
        />
        <InputField
          label="Rate Type"
          name="rateType"
          value={formData.rateType}
          onChange={handleChange}
        />
        <InputField
          label="Detention Charge"
          name="detentionCharge"
          value={formData.detentionCharge}
          onChange={handleChange}
        />
        <InputField
          label="Rank"
          name="rank"
          value={formData.rank}
          onChange={handleChange}
        />
        <InputField
          label="Unloading Charges"
          name="unloadingCharges"
          value={formData.unloadingCharges}
          onChange={handleChange}
        />
        <InputField
          label="Extra km Charges Upto 500 Km"
          name="extraKmCharges"
          value={formData.extraKmCharges}
          onChange={handleChange}
        />
        <InputField
          label="Remark"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
        />
      </div>
    </div>
   
  );
};

export default VendorRateMaster;
