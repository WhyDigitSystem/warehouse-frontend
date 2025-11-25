import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { masterAPI } from "../../../api/customerAPI";

const CountryMasterForm = ({ data, onBack }) => {
  const [form, setForm] = useState({
    countryCode: data?.countryCode || "",
    countryName: data?.countryName || "",
    id: data?.id || "",
    active: data?.active === "Active" ? true : false,
  });



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSave = async () => {
    const payload = {
      ...(data?.id && { id: data?.id }),
      orgId: 1000000001,
      countryCode: form.countryCode,
      countryName: form.countryName,
      active: form.active ? true : false,
      cancel: false,
      createdBy: "ITC001",
    };

    try {
      const response = await masterAPI.saveCountry(payload);

      alert(
        data ? "Country Updated successfully!" : "Country saved successfully!"
      );
      onBack();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save country.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <ArrowLeft
          className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300"
          onClick={onBack}
        />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Country" : "Add Country"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Country Code */}
          <input
            type="text"
            name="countryCode"
            placeholder="Code"
            value={form.countryCode}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
            dark:border-gray-700 bg-white dark:bg-gray-900"
          />

          {/* Country Name */}
          <input
            type="text"
            name="countryName"
            placeholder="Name"
            value={form.countryName}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
            dark:border-gray-700 bg-white dark:bg-gray-900"
          />

          {/* Active */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Active
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 
            dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md"
          >
            <X className="h-4 w-4" /> Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 text-white 
            rounded-md hover:bg-purple-700"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryMasterForm;
