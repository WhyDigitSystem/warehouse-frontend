import { Plus, Filter, User, Phone, Edit, Trash2 } from "lucide-react";

const DriverListView = ({ setIsListView }) => {
  const mockDrivers = [
    { id: 1, name: "Ramesh Kumar", number: "9876543210", status: "Active" },
    { id: 2, name: "Suresh Babu", number: "9876501234", status: "Inactive" },
    { id: 3, name: "Karthi", number: "9898989898", status: "Active" },
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Drivers Overview
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
            Add Driver
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockDrivers.length > 0 ? (
          mockDrivers.map((d) => (
            <div
              key={d.id}
              className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {d.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {d.number}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    d.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <hr className="my-3 border-gray-200 dark:border-gray-700" />

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Driver ID: #{d.id}
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
            <p>No drivers available. Add your first driver!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverListView;
