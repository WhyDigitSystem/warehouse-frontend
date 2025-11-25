import { Plus, Filter, Truck, Edit, Trash2 } from "lucide-react";

const VehicleListView = ({ setIsListView }) => {
  // Mock Data
  const mockVehicles = [
    { id: 1, vehicle: "TN09AB1234", status: "Active", type: "Mini Truck" },
    { id: 2, vehicle: "KA01CD5678", status: "Inactive", type: "Lorry" },
    { id: 3, vehicle: "MH12XY4567", status: "Active", type: "Trailer" },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vehicles Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 
            dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => setIsListView(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 
            text-white rounded-lg shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockVehicles.length > 0 ? (
          mockVehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Vehicle Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {v.vehicle}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {v.type}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    v.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* Divider */}
              <hr className="my-3 border-gray-200 dark:border-gray-700" />

              {/* Actions */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Vehicle ID: #{v.id}
                </span>
                <div className="flex gap-2">
                  <button
                    className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                    hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 
                    hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p>No vehicles available. Add your first vehicle!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex gap-2 text-sm">
          {[10, 20, 50].map((num) => (
            <button
              key={num}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 
              dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleListView;
