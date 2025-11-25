import { useState, useRef } from "react";
import { Plus, Trash2, Pencil, Paperclip } from "lucide-react";

export default function DocsTab() {
    const [docRows, setDocRows] = useState([
        {
            id: 1,
            doc: "Attach",
            docType: "POD",
            remark: "Remark",
            trip: "new-payouts-7",
            vehicleNumber: "Vehicle Number",
            file: null
        }
    ]);

    const fileInputRef = useRef({}); // store refs for each row

    const addDocRow = () => {
        const newId =
            docRows.length > 0
                ? Math.max(...docRows.map((row) => row.id)) + 1
                : 1;

        setDocRows([
            ...docRows,
            {
                id: newId,
                doc: "Attach",
                docType: "",
                remark: "",
                trip: "",
                vehicleNumber: "",
                file: null
            }
        ]);
    };

    const removeDocRow = (id) => {
        if (docRows.length > 1) {
            setDocRows(docRows.filter((row) => row.id !== id));
        }
    };

    const handleDocChange = (id, field, value) => {
        setDocRows(
            docRows.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    const handleFileSelect = (id, file) => {
        setDocRows(
            docRows.map((row) =>
                row.id === id
                    ? { ...row, file: file, doc: file.name }
                    : row
            )
        );
    };

    const docTypeOptions = [
        "POD",
        "Invoice",
        "Receipt",
        "LR Copy",
        "Delivery Challan",
        "Other"
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Docs
            </h2>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-3 w-12">No.</th>
                            <th className="px-3 py-3">Doc</th>
                            <th className="px-3 py-3">Doc Type</th>
                            <th className="px-3 py-3">Remark</th>
                            <th className="px-3 py-3">Trip</th>
                            <th className="px-3 py-3">Vehicle Number</th>
                            <th className="px-3 py-3 text-center w-24">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {docRows.map((row, index) => (
                            <tr
                                key={row.id}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <td className="px-3 py-2">{index + 1}</td>

                                {/* Attach Button */}
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => fileInputRef.current[row.id]?.click()}
                                        className="flex items-center space-x-1 px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        <Paperclip size={14} />
                                        <span>{row.file ? row.file.name : "Attach"}</span>
                                    </button>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={(el) => (fileInputRef.current[row.id] = el)}
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileSelect(row.id, e.target.files[0])
                                        }
                                    />
                                </td>

                                {/* Doc Type */}
                                <td className="px-3 py-2">
                                    <select
                                        value={row.docType}
                                        onChange={(e) =>
                                            handleDocChange(row.id, "docType", e.target.value)
                                        }
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Doc Type</option>
                                        {docTypeOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Remark */}
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.remark}
                                        onChange={(e) =>
                                            handleDocChange(row.id, "remark", e.target.value)
                                        }
                                        placeholder="Enter Remark"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>

                                {/* Trip */}
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.trip}
                                        onChange={(e) =>
                                            handleDocChange(row.id, "trip", e.target.value)
                                        }
                                        placeholder="Enter Trip"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>

                                {/* Vehicle Number */}
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.vehicleNumber}
                                        onChange={(e) =>
                                            handleDocChange(
                                                row.id,
                                                "vehicleNumber",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter Vehicle Number"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>

                                {/* Action Buttons */}
                                <td className="px-3 py-2 text-center">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                                            <Pencil size={16} className="text-blue-600" />
                                        </button>

                                        {docRows.length > 1 && (
                                            <button
                                                onClick={() => removeDocRow(row.id)}
                                                className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={addDocRow}
                className="mt-4 flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
            >
                <Plus size={16} />
                <span>Add Row</span>
            </button>
        </div>
    );
}
