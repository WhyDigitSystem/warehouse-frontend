import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function TimelineTab() {
    const [rows, setRows] = useState([
        { id: 1, status: "", timeRecorded: "" },
    ]);

    const addRow = () => {
        setRows([
            ...rows,
            { id: rows.length + 1, status: "", timeRecorded: "" },
        ]);
    };

    const removeRow = (index) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
        }
    };

    const editRow = (index) => {
        alert(`Editing row ${index + 1}`);
    };

    const handleChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Timeline
            </h2>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-3 w-12">No.</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Time Recorded</th>
                            <th className="px-3 py-3 text-center w-24">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={index}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <td className="px-3 py-2">{index + 1}</td>

                                {/* Status */}
                                <td className="px-3 py-2 w-[200px]">
                                    <input
                                        type="text"
                                        value={row.status}
                                        onChange={(e) =>
                                            handleChange(index, "status", e.target.value)
                                        }
                                        placeholder="Enter Status"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>

                                {/* Time Recorded (datetime picker) */}
                                <td className="px-3 py-2 w-[220px]">
                                    <input
                                        type="datetime-local"
                                        value={row.timeRecorded}
                                        onChange={(e) =>
                                            handleChange(index, "timeRecorded", e.target.value)
                                        }
                                        className="
        w-full bg-white dark:bg-gray-900 
        border border-gray-300 dark:border-gray-700 
        rounded-md px-2 py-1 text-sm 
        text-gray-900 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-blue-500
        dark:[color-scheme:dark]
    "
                                    />
                                </td>

                                {/* Action column */}
                                <td className="px-3 py-2 text-center">
                                    <div className="flex justify-center items-center space-x-2">

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => editRow(index)}
                                            className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                        >
                                            <Pencil size={16} className="text-blue-600" />
                                        </button>

                                        {/* Delete Button */}
                                        {rows.length > 1 && (
                                            <button
                                                onClick={() => removeRow(index)}
                                                className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center text-gray-500 dark:text-gray-400 py-4"
                                >
                                    No timeline entries.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Row */}
            <button
                onClick={addRow}
                className="mt-4 flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
            >
                <Plus size={16} />
                <span>Add Row</span>
            </button>
        </div>
    );
}
