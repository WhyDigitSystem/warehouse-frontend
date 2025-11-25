import { 
    Plus, 
    Filter, 
    FileText, 
    Calendar, 
    Edit3, 
    Wallet,
    Banknote,
    CheckCheck,
    Hourglass,
    List,
    Users,
    Receipt
} from "lucide-react";
import { useState } from "react";

const InvoiceListView = ({ setIsListView }) => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const mockInvoices = [
        {
            id: 1,
            invoiceNumber: "INV-001",
            vendor: "ABC Transport",
            amount: "₹15,000.00",
            invoiceDate: "2025-11-07",
            dueDate: "2025-11-21",
            status: "Pending",
            created: "2025-11-07 17:06:19",
        },
        {
            id: 2,
            invoiceNumber: "INV-002",
            vendor: "XYZ Logistics",
            amount: "₹22,500.00",
            invoiceDate: "2025-11-06",
            dueDate: "2025-11-20",
            status: "Approved",
            created: "2025-11-06 14:30:45",
        },
        {
            id: 3,
            invoiceNumber: "INV-003",
            vendor: "Global Carriers",
            amount: "₹18,750.00",
            invoiceDate: "2025-11-08",
            dueDate: "2025-11-22",
            status: "Paid",
            created: "2025-11-08 09:15:30",
        },
    ];

    // Stats data
    const stats = [
        {
            label: "Total Invoices",
            count: mockInvoices.length.toString(),
            color: "blue",
            icon: FileText,
        },
        {
            label: "Total Amount",
            count: "₹56,250.00",
            color: "green",
            icon: Banknote,
        },
        {
            label: "Total Paid",
            count: "1",
            color: "green",
            icon: CheckCheck,
        },
        {
            label: "Total Due",
            count: "2",
            color: "orange",
            icon: Hourglass,
        },
    ];

    const handleEdit = (invoice) => {
        console.log("Edit Invoice:", invoice);
        setIsListView(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-0 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Invoices
                    </h1>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
                            <List className="h-4 w-4" /> List View
                        </button>
                        <button
                            onClick={() => setIsListView(false)}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> New Invoice
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
                            placeholder="Search by Invoice Number, Vendor, or Amount..."
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
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Paid</option>
                            <option>Overdue</option>
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
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">INVOICE NUMBER</th>
                                    <th className="px-4 py-3">VENDOR</th>
                                    <th className="px-4 py-3">AMOUNT</th>
                                    <th className="px-4 py-3">INVOICE DATE</th>
                                    <th className="px-4 py-3">DUE DATE</th>
                                    <th className="px-4 py-3">STATUS</th>
                                    <th className="px-4 py-3">CREATED</th>
                                    <th className="px-4 py-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockInvoices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center py-10 text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText className="h-8 w-8 mb-2 text-gray-400" />
                                                <p className="text-sm">
                                                    You haven't created any Invoices yet
                                                </p>
                                                <button
                                                    onClick={() => setIsListView(false)}
                                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                                >
                                                    Create your first Invoice
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    mockInvoices.map((invoice, idx) => (
                                        <tr
                                            key={invoice.id}
                                            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                        >
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-4 py-3">
                                                {invoice.vendor}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                                                {invoice.amount}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {invoice.invoiceDate}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {invoice.dueDate}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full ${invoice.status === "Approved"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : invoice.status === "Paid"
                                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        }`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {invoice.created}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing 1–{mockInvoices.length} of {mockInvoices.length} results
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                Prev
                            </button>
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                                1
                            </button>
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceListView;