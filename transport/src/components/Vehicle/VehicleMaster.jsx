import { useState } from "react";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import InputField from "../UI/InputField";
import { useNavigate } from "react-router-dom";

export default function VehicleMaster({ setIsListView }) {
  const navigate = useNavigate();

  // 🔹 Initial form state
  const [formData, setFormData] = useState({
    vehicle: "",
    status: "Active",
    vehicleType: "",
  });

  // 🔹 Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form reset
  const handleClearForm = () => {
    setFormData({
      vehicle: "",
      status: "Active",
      vehicleType: "",
    });
  };

  // 🔹 Handle form save
  const handleSave = () => {
    console.log("SAVE PAYLOAD:", formData);
    alert("Vehicle saved successfully (mock). Check console for payload.");
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Back button (works with router or state) */}
         

          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              New Vehicle
            </h1>
            <p className="text-xs text-red-500 mt-1">● Not Saved</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearForm}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Form
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
           <button
            onClick={() => {
              if (setIsListView) setIsListView(true);
              else navigate("/vehicle"); // fallback navigation
            }}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField
          label="Vehicle"
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          required
          placeholder="Enter vehicle number or name"
        />
          <InputField
          label="Vehicle Type"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          placeholder="Enter type (e.g., Truck, Mini Lorry)"
        />

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      
      </div>
    </div>
  );
}
