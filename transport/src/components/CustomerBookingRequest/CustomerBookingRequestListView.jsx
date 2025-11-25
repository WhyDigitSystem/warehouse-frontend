import { Plus, Filter, MapPin, ClipboardList, Calendar, Edit3, User } from "lucide-react";

const CustomerBookingRequestListView = ({ setIsListView }) => {
    const mockIndents = [
        {
            id: 1,
            customer: "ABC Logistics",
            status: "Open",
            origin: "Chennai",
            destination: "Bangalore",
            vehicleType: "Truck 20FT",
            numberOfVehicles: 1,
            placementDate: "2025-11-07",
            orderType: "Contracted scheduled",
            serviceType: "FTL",
        },
        {
            id: 2,
            customer: "XYZ Transport",
            status: "Open",
            origin: "Hyderabad",
            destination: "Mumbai",
            vehicleType: "Trailer",
            numberOfVehicles: 2,
            placementDate: "2025-11-06",
            orderType: "Spot",
            serviceType: "LTL",
        },
        {
            id: 3,
            customer: "Global Shipping",
            status: "Open",
            origin: "Delhi",
            destination: "Kolkata",
            vehicleType: "Container 32FT",
            numberOfVehicles: 1,
            placementDate: "2025-11-08",
            orderType: "Contracted scheduled",
            serviceType: "FTL",
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
                    <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Customer Booking Request
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
                        Add Booking Request
                    </button>
                </div>
            </div>

            {/* Modern Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 uppercase text-gray-600 dark:text-gray-300 text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left font-semibold">#</th>
                            <th className="px-5 py-3 text-left font-semibold">Customer</th>
                            <th className="px-5 py-3 text-left font-semibold">Status</th>
                            <th className="px-5 py-3 text-left font-semibold">Origin</th>
                            <th className="px-4 py-3 text-left font-semibold">Destination</th>
                            <th className="px-5 py-3 text-left font-semibold">Vehicle Type</th>
                            <th className="px-2 py-3 text-left font-semibold">No. of Vehicles</th>
                            <th className="px-5 py-3 text-left font-semibold">Placement Date</th>
                            <th className="px-5 py-3 text-left font-semibold">Order Type</th>
                            <th className="px-3 py-3 text-center font-semibold">Action</th>
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
                                    <User className="h-4 w-4 text-gray-400" />
                                    {indent.customer}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${indent.status === "Open"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                            }`}
                                    >
                                        {indent.status}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{indent.origin}</span>
                                        </div>

                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{indent.destination}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4">{indent.vehicleType}</td>

                                <td className="px-5 py-4 text-center">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                                        {indent.numberOfVehicles}
                                    </span>
                                </td>

                                <td className="px-5 py-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {indent.placementDate}
                                </td>

                                <td className="px-5 py-4">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {indent.orderType}
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

export default CustomerBookingRequestListView;