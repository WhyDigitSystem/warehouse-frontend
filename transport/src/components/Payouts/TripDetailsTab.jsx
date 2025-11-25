import { useState } from "react";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import InputField from "../UI/InputField";
import { useNavigate } from "react-router-dom";

export default function TripDetailsTab() {
    const [tripRows, setTripRows] = useState([
        {
            id: 1,
            trips: "",
            origin: "",
            destination: "",
            vehicle: "",
            status: "Status"
        }
    ]);

    const [openTripDropdown, setOpenTripDropdown] = useState(null);
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "13-11-2025"
    });

    // Manual trip options
    const tripOptions = [
        { id: "PP-1146959", name: "PP-1146959 - Mumbai to Delhi" },
        { id: "PP-1146960", name: "PP-1146960 - Bangalore to Chennai" },
        { id: "PP-1146961", name: "PP-1146961 - Kolkata to Hyderabad" }
    ];

    const addTripRow = () => {
        const newId = tripRows.length > 0 ? Math.max(...tripRows.map(row => row.id)) + 1 : 1;
        setTripRows([...tripRows, {
            id: newId,
            trips: "",
            origin: "",
            destination: "",
            vehicle: "",
            status: "Status"
        }]);
    };

    const removeTripRow = (id) => {
        if (tripRows.length > 1) {
            setTripRows(tripRows.filter(row => row.id !== id));
        }
    };

    const handleTripChange = (id, field, value) => {
        setTripRows(tripRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const statusOptions = [
        "Pending",
        "In Progress",
        "Completed",
        "Cancelled",
        "On Hold"
    ];

    const handleTripInputFocus = (rowId) => {
        setOpenTripDropdown(rowId);
    };

    const handleTripSelect = (rowId, tripValue) => {
        handleTripChange(rowId, "trips", tripValue);
        setOpenTripDropdown(null);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = () => {
        setOpenTripDropdown(null);
    };

    return (
        <div className="p-6 space-y-6" onClick={handleClickOutside}>
            {/* Header Section */}
            <div className="space-y-6">
                {/* Trips Details */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Trips Details
                    </h2>

                    {/* Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* From Date */}
                        <InputField
                            label="From Date"
                            name="fromDate"
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) =>
                                handleFilterChange("fromDate", e.target.value)
                            }
                        />

                        {/* To Date */}
                        <InputField
                            label="To Date"
                            name="toDate"
                            type="date"
                            value={filters.toDate}
                            onChange={(e) =>
                                handleFilterChange("toDate", e.target.value)
                            }
                        />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    {/* Fetch Trips Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Search className="h-4 w-4" />
                        Fetch Trips
                    </button>
                </div>
            </div>

            {/* Trips Table Section */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trips
                </h3>

                {/* Non-scrollable table container */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-3 py-2 w-12">No.</th>
                                <th className="px-3 py-2">Trips *</th>
                                <th className="px-3 py-2">Origin *</th>
                                <th className="px-3 py-2">Destination *</th>
                                <th className="px-3 py-2">Vehicle *</th>
                                <th className="px-3 py-2">Status *</th>
                                <th className="px-3 py-2 text-center w-20">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tripRows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="px-3 py-1 text-center">{index + 1}</td>

                                    <td className="px-3 py-1 relative">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {/* Trips Input */}
                                            <input
                                                type="text"
                                                value={row.trips}
                                                onChange={(e) => handleTripChange(row.id, "trips", e.target.value)}
                                                onFocus={() => handleTripInputFocus(row.id)}
                                                placeholder="Search Trips..."
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />

                                            {openTripDropdown === row.id && (
                                                <div className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                                                    <div className="p-1 max-h-48 overflow-y-auto">
                                                        {tripOptions.map((trip) => (
                                                            <button
                                                                key={trip.id}
                                                                onClick={() => handleTripSelect(row.id, trip.name)}
                                                                className="w-full flex items-center gap-2 px-2 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-blue-50 dark:hover:bg-blue-800 text-sm text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{trip.id}</div>
                                                                </div>
                                                            </button>
                                                        ))}

                                                        {/* Divider */}
                                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                                        {/* Action Buttons */}
                                                        <button
                                                            onClick={() => {
                                                                handleTripChange(row.id, "trips", "PP-1146959");
                                                                setOpenTripDropdown(null);
                                                                navigate("/trip");
                                                            }}
                                                            className="w-full flex items-center gap-2 px-2 py-2 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-800 text-sm transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Create a new Trips
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-3 py-1">
                                        <input
                                            type="text"
                                            value={row.origin}
                                            onChange={(e) =>
                                                handleTripChange(row.id, "origin", e.target.value)
                                            }
                                            placeholder="Enter Origin"
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </td>

                                    <td className="px-3 py-1">
                                        <input
                                            type="text"
                                            value={row.destination}
                                            onChange={(e) =>
                                                handleTripChange(row.id, "destination", e.target.value)
                                            }
                                            placeholder="Enter Destination"
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </td>

                                    <td className="px-3 py-1">
                                        <input
                                            type="text"
                                            value={row.vehicle}
                                            onChange={(e) =>
                                                handleTripChange(row.id, "vehicle", e.target.value)
                                            }
                                            placeholder="Enter Vehicle"
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </td>

                                    <td className="px-3 py-1">
                                        <select
                                            value={row.status}
                                            onChange={(e) =>
                                                handleTripChange(row.id, "status", e.target.value)
                                            }
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="Status">Status</option>
                                            {statusOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-1 text-center">
                                        <div className="flex justify-center items-center space-x-1">
                                            <button
                                                onClick={() => console.log("Edit row", row.id)}
                                                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                            >
                                                <Pencil size={14} className="text-blue-600" />
                                            </button>

                                            {tripRows.length > 1 && (
                                                <button
                                                    onClick={() => removeTripRow(row.id)}
                                                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                                >
                                                    <Trash2 size={14} className="text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={addTripRow}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Add Row
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}