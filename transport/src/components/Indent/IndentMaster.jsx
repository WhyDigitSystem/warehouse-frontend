import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import TabComponent from "../common/TabComponent";
import InputField from "../UI/InputField";

const IndentMaster = ({ setIsListView }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [addPitstop, setAddPitstop] = useState(false);

  const tabs = [
    { label: "Details" },
    { label: "Extra Info" },
    { label: "Vendor Response" },
    { label: "Trips Linked" },
    { label: "Trips Docs" },
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
            New Indents
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
          {/* ── Status Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Status" value="Pending" disabled />
            <InputField label="Created At" value="07-11-2025 17:06:19" disabled />
            <InputField label="Indent Status" disabled />
            <InputField label="Time Zone" value="Asia/Kolkata" disabled />
          </div>

          {/* ── Customer Section ── */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Customer
            </h3>
            <InputField label="Customer" placeholder="Select customer" />
          </div>

          {/* ── Route Details Section ── */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Route Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Route" placeholder="Enter route name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Origin"
                required
                placeholder="Enter origin location"
              />
              <InputField
                label="Destination"
                required
                placeholder="Enter destination location"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Vehicle Type"
                placeholder="Enter vehicle type"
              />
              <InputField
                label="Weight (Ton)"
                placeholder="Enter weight in tons"
                type="number"
              />
            </div>

            {/* Add Pitstop */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={addPitstop}
                onChange={(e) => setAddPitstop(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Add Pitstop
              </label>
            </div>

            {addPitstop && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Pitstop Table (Mock Example)
                </h4>
                <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Pitstop Location
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2">
                        Chennai, Tamil Nadu, India
                      </td>
                      <td className="px-3 py-2">
                        <button className="text-blue-600 hover:underline text-xs">
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className="mt-3 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  Add Row
                </button>
              </div>
            )}
          </div>

          {/* ── Rates Section ── */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Rates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Number of Vehicles"
                type="number"
                value="1"
              />
              <InputField label="Customer Rate" placeholder="Enter rate" />
              <InputField
                label="Vendor Rate per Vehicle"
                placeholder="Enter vendor rate"
              />
              <InputField label="Extra Info" placeholder="Add notes or remarks" />
              <InputField
                label="Available Vendor with rates"
                placeholder="Select vendor"
              />
              <InputField label="Placement Date" type="date" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentMaster;
