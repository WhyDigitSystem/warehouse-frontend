import { Plus, Filter, MapPin, Truck, Calendar, Edit3 } from "lucide-react";

const IndentListView = ({ setIsListView }) => {
  const mockIndents = [
    {
      id: 1,
      origin: "Chennai",
      destination: "Bangalore",
      vehicleType: "Truck 20FT",
      weight: "10 Ton",
      date: "2025-11-07",
      status: "Pending",
    },
    {
      id: 2,
      origin: "Hyderabad",
      destination: "Mumbai",
      vehicleType: "Trailer",
      weight: "20 Ton",
      date: "2025-11-06",
      status: "Approved",
    },
    {
      id: 3,
      origin: "Delhi",
      destination: "Kolkata",
      vehicleType: "Container 32FT",
      weight: "18 Ton",
      date: "2025-11-08",
      status: "In Transit",
    },
  ];

  const handleEdit = (indent) => {
    console.log("Edit Indent:", indent);
    setIsListView(false);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Indent List
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => setIsListView(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Indent
          </button>
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-800 uppercase text-gray-600 dark:text-gray-300 text-xs">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">#</th>
              <th className="px-5 py-3 text-left font-semibold">Origin</th>
              <th className="px-4 py-3 text-left font-semibold">Destination</th>
              <th className="px-5 py-3 text-left font-semibold">Vehicle Type</th>
              <th className="px-5 py-3 text-left font-semibold">Weight</th>
              <th className="px-5 py-3 text-left font-semibold">Date</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockIndents.map((indent, idx) => (
              <tr
                key={indent.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition-all duration-200"
              >
                <td className="px-5 py-4">{idx + 1}</td>

                <td className="px-5 py-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                 {indent.origin}
                </td>

                <td className="px-2 py-4 gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {indent.destination}
                </td>

                <td className="px-5 py-4">{indent.vehicleType}</td>

                <td className="px-5 py-4">{indent.weight}</td>

                <td className="px-5 py-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {indent.date}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      indent.status === "Approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : indent.status === "In Transit"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {indent.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleEdit(indent)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        <span>Showing 1–3 of 3 results</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Prev
          </button>
          <button className="px-3 py-1 border rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            1
          </button>
          <button className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndentListView;
