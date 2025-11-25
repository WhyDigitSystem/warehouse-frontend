import React, { useState } from "react";
import InputField from "../UI/InputField";

const OtherDetailsTab = () => {
  const [formData, setFormData] = useState({
    vendorType: "Regular",
    advancePercent: "0.000",
    creditPeriod: "",
    tdsPercent: "No TDS - 0%",
    vendorSpotId: "",
    vendorUuid: "",
    tags: "All",
  });

  // All TDS sections
  const tdsOptions = [
    "No TDS - 0%",
    "Section 193 - 10%",
    "Section 194 - 10%",
    "Section 194A - 10%",
    "Section 194B - 30%",
    "Section 194BB - 30%",
    "Section 194C: HUF/Individuals - 1%",
    "Section 194C: Others - 2%",
    "Section 194D - 10%",
    "Section 194DA - 5%",
    "Section 194EE - 10%",
    "Section 194F - 20%",
    "Section 194G - 5%",
    "Section 194H - 5%",
    "Section 194I: Plant & Machinery - 2%",
    "Section 194I: Others - 10%",
    "Section 194IA - 1%",
    "Section 194IB - 5%",
    "Section 194IC - 10%",
    "Section 194J: Technical Fees - 2%",
    "Section 194J: Professional Fees - 10%",
    "Section 194LA - 10%",
    "Section 194M - 5%",
    "Section 194O - 1%",
    "Section 194Q - 0.1%",
    "Section 206C - 1%",
    "Section 206C(1H) - 0.1%",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-b-xl transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Other Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vendor Type */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vendor Type
          </label>
          <select
            name="vendorType"
            value={formData.vendorType}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
          >
            <option>Regular</option>
            <option>Irregular</option>
            <option>Seasonal</option>
          </select>
        </div>

        {/* Advance Percent */}
        <InputField
          label="Advance Percent"
          name="advancePercent"
          value={formData.advancePercent}
          onChange={handleChange}
          placeholder="0.000"
          compact
        />

        {/* Credit Period */}
        <InputField
          label="Credit Period"
          name="creditPeriod"
          value={formData.creditPeriod}
          onChange={handleChange}
          placeholder="Enter credit period"
          compact
        />

        {/* TDS Percent */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            TDS Percent
          </label>
          <select
            name="tdsPercent"
            value={formData.tdsPercent}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
          >
            {tdsOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* vendor_spot_id */}
        <InputField
          label="vendor_spot_id"
          name="vendorSpotId"
          value={formData.vendorSpotId}
          onChange={handleChange}
          placeholder="Enter vendor spot ID"
          compact
        />

        {/* vendor_uuid */}
        <InputField
          label="vendor_uuid"
          name="vendorUuid"
          value={formData.vendorUuid}
          onChange={handleChange}
          placeholder="Enter vendor UUID"
          compact
        />

        {/* Tags */}
        <div className="md:col-span-1">
          <InputField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="All"
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default OtherDetailsTab;
