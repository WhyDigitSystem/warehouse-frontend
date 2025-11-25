import React, { useState } from "react";
import { Save, RotateCcw, ChevronLeft } from "lucide-react";
import RfqListView from "./RFQListView";
import InputField from "../UI/InputField";

const RfqMaster = () => {
  const [isListView, setIsListView] = useState(true);
  const [formData, setFormData] = useState({
    rfqName: "",
    natureOfContract: "",
    material: "",
    branch: "",
    contractStartDate: "",
    contractDuration: "",
    active: true,
    origin: "",
    destination: "",
    vehicleType: "",
    weight: "",
    rate: "",
    rateType: "Contractual",
    detentionCharge: "",
    unloadingCharges: "0.00",
    extraKmCharges: "0.00",
    vendorTags: "",
    additionalCharges: "",
    terms: "",
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
    console.log("Saving RFQ:", formData);
    alert("RFQ Saved Successfully ✅");
  };

  const handleClear = () => {
    setFormData({
      rfqName: "",
      natureOfContract: "",
      material: "",
      branch: "",
      contractStartDate: "",
      contractDuration: "",
      active: true,
      origin: "",
      destination: "",
      vehicleType: "",
      weight: "",
      rate: "",
      rateType: "Contractual",
      detentionCharge: "",
      unloadingCharges: "0.00",
      extraKmCharges: "0.00",
      vendorTags: "",
      additionalCharges: "",
      terms: "",
      remark: "",
    });
  };

  if (isListView) return <RfqListView setIsListView={setIsListView} />;

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
            New RFQ
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

      {/* RFQ Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InputField
          label="RFQ Name *"
          name="rfqName"
          value={formData.rfqName}
          onChange={handleChange}
          required
        />
        <InputField
          label="Nature of Contract *"
          name="natureOfContract"
          value={formData.natureOfContract}
          onChange={handleChange}
          required
        />
        <InputField
          label="Material"
          name="material"
          value={formData.material}
          onChange={handleChange}
        />
        <InputField
          label="Branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
        />
        <InputField
          label="Contract Start Date"
          name="contractStartDate"
          type="date"
          value={formData.contractStartDate}
          onChange={handleChange}
        />
        <InputField
          label="Contract Duration (Months)"
          name="contractDuration"
          value={formData.contractDuration}
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

      {/* Route & Rate Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
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
          label="Rate"
          name="rate"
          value={formData.rate}
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
          label="Unloading Charges"
          name="unloadingCharges"
          value={formData.unloadingCharges}
          onChange={handleChange}
        />
        <InputField
          label="Extra Km Charges (Upto 500 Km)"
          name="extraKmCharges"
          value={formData.extraKmCharges}
          onChange={handleChange}
        />
      </div>

      {/* Vendor Info & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <InputField
          label="Vendor Tags"
          name="vendorTags"
          value={formData.vendorTags}
          onChange={handleChange}
        />
        <InputField
          label="Additional Charges"
          name="additionalCharges"
          value={formData.additionalCharges}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Terms & Conditions
        </label>
        <textarea
          name="terms"
          value={formData.terms}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm dark:bg-gray-800 dark:text-gray-200"
          placeholder="Enter terms and conditions"
        />
      </div>

      <div className="mt-6">
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

export default RfqMaster;
