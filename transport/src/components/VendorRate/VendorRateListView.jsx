import { Plus, Filter, Truck } from "lucide-react";

const VendorRateListView = ({ setIsListView }) => {
  const mockRates = [
    {
      id: 1,
      vendor: "ABC Logistics",
      origin: "Chennai",
      destination: "Bangalore",
      rate: "12000",
      vehicleType: "Truck 20FT",
      status: "Active",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Vendor Rate List
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button
            onClick={() => setIsListView(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Rate
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Vendor</th>
              <th className="px-4 py-3 text-left font-semibold">Origin</th>
              <th className="px-4 py-3 text-left font-semibold">Destination</th>
              <th className="px-4 py-3 text-left font-semibold">Rate</th>
              <th className="px-4 py-3 text-left font-semibold">Vehicle Type</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockRates.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-all dark:text-gray-200"
              >
                <td className="px-4 py-2 border-b">{r.vendor}</td>
                <td className="px-4 py-2 border-b">{r.origin}</td>
                <td className="px-4 py-2 border-b">{r.destination}</td>
                <td className="px-4 py-2 border-b">{r.rate}</td>
                <td className="px-4 py-2 border-b">{r.vehicleType}</td>
                <td className="px-4 py-2 border-b">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorRateListView;
