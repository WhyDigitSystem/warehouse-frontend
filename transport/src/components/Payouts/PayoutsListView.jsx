import {
    Wallet,
    Banknote,
    CheckCheck,
    Hourglass,
    FileText,
    Filter,
    List,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PayoutsListView = ({ setIsListView }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const payouts = [];

    const stats = [
        {
            label: "Total Payouts",
            count: "0",
            color: "blue",
            icon: Wallet,
        },
        {
            label: "Total Amount",
            count: "₹0",
            color: "green",
            icon: Banknote,
        },
        {
            label: "Total Paid",
            count: "₹0",
            color: "red",
            icon: CheckCheck,
        },
        {
            label: "Total Pending",
            count: "₹0",
            color: "blue",
            icon: Hourglass,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Payouts
                    </h1>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
                            <List className="h-4 w-4" /> List View
                        </button>
                        <button
                            onClick={() => {
                                setIsListView(false);
                            }}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> Add Payouts
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
                            placeholder="Search by Vendor, Purpose, or Payout Reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />

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
                                    <th className="px-4 py-2">Payout ID</th>
                                    <th className="px-4 py-2">Vendor</th>
                                    <th className="px-4 py-2">Purpose</th>
                                    <th className="px-4 py-2">Invoice Amount</th>
                                    <th className="px-4 py-2">Total Amount</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Payout Reference</th>
                                    <th className="px-4 py-2">Invoice Type</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Created At</th>
                                    <th className="px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="text-center py-10 text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText className="h-8 w-8 mb-2 text-gray-400" />
                                                <p className="text-sm">
                                                    You haven't created any Payouts yet
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setIsListView(false);
                                                    }}
                                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                                >
                                                    Create your first Payout
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map((payout) => (
                                        <tr
                                            key={payout.id}
                                            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                        >
                                            <td className="px-4 py-2">{payout.payoutId}</td>
                                            <td className="px-4 py-2">{payout.vendor}</td>
                                            <td className="px-4 py-2">{payout.purpose}</td>
                                            <td className="px-4 py-2">₹{payout.invoiceAmount}</td>
                                            <td className="px-4 py-2">₹{payout.totalAmount}</td>
                                            <td className="px-4 py-2">{payout.quantity}</td>
                                            <td className="px-4 py-2">{payout.payoutReference}</td>
                                            <td className="px-4 py-2">{payout.invoiceType}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    payout.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    payout.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    payout.status === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{payout.createdAt}</td>
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
                                className={`px-2 py-1 rounded text-sm ${n === 20
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

export default PayoutsListView;