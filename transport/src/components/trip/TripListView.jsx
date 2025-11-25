import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  FileText,
  Filter,
  List,
  MapPin,
  Plus,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TripListView = ({ setIsListView }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔹 Mock Trip Data
  const trips = [];

  // 🔹 Summary Stats (replace with API later)
  const stats = [
    {
      label: "Total / Active",
      count: "0 / 0",
      color: "blue",
      icon: BarChart3,
    },
    {
      label: "Online / Consent Pending",
      count: "0 / 0",
      color: "green",
      icon: CheckCircle,
    },
    {
      label: "Deviated / Delayed / Long Stoppage (Last 15 Days)",
      count: "0 / 0 / 0",
      color: "red",
      icon: AlertTriangle,
    },
    {
      label: "Completed / POD Received",
      count: "0 / 0",
      color: "blue",
      icon: Timer,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trips
          </h1>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
              <FileText className="h-4 w-4" /> MIS Report
            </button>
            <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Map View
            </button>
            <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
              <List className="h-4 w-4" /> List View
            </button>
            <button
              onClick={() => {
                setIsListView(false); // ✅ Switch to TripMaster
                navigate("/trip"); // ✅ Go to TripMaster page
              }}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Trips
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {s.label}
                  </h3>
                  <Icon
                    className={`h-5 w-5 text-${s.color}-500 dark:text-${s.color}-400`}
                  />
                </div>
                <div
                  className={`mt-3 text-lg font-semibold text-${s.color}-600 dark:text-${s.color}-400`}
                >
                  {s.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-2 items-center">
            <input
              type="text"
              placeholder="Search by Vendor, Vehicle, or Driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <select
              className="col-span-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Delayed</option>
            </select>

            <button className="col-span-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1 text-sm">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Vehicle Number</th>
                  <th className="px-4 py-2">Origin</th>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Driver Number</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created On</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-10 text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 mb-2 text-gray-400" />
                        <p className="text-sm">
                          You haven’t created a Trips yet
                        </p>
                        <button
                         onClick={() => {
                setIsListView(false); // ✅ Switch to TripMaster
                navigate("/trip"); // ✅ Go to TripMaster page
              }}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Create your first Trips
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                    >
                      <td className="px-4 py-2">{trip.id}</td>
                      <td className="px-4 py-2">{trip.vendor}</td>
                      <td className="px-4 py-2">{trip.vehicleNumber}</td>
                      <td className="px-4 py-2">{trip.origin}</td>
                      <td className="px-4 py-2">{trip.destination}</td>
                      <td className="px-4 py-2">{trip.driverNumber}</td>
                      <td className="px-4 py-2">{trip.status}</td>
                      <td className="px-4 py-2">{trip.createdOn}</td>
                      <td className="px-4 py-2">
                        <button className="text-blue-600 hover:underline text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">Rows per page:</span>
            {[20, 100, 500].map((n) => (
              <button
                key={n}
                className={`px-2 py-1 rounded text-sm ${
                  n === 20
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListView;
