import React from "react";
import { X, CheckSquare } from "lucide-react";

const FillGridModal = ({
  open,
  onClose,
  fillGridData,
  selectedRows,
  selectAll,
  onSelectAll,
  onRowSelect,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fill Grid Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Select All ({selectedRows.length} selected)
            </label>
          </div>
          
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                    Select
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    From Bin
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Part No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Part Desc
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    GRN No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Batch No
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avl Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fillGridData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  fillGridData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={(e) => onRowSelect(index, e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">{item.fromBin || item.bin}</td>
                      <td className="px-3 py-2">{item.partNo}</td>
                      <td className="px-3 py-2">{item.partDesc}</td>
                      <td className="px-3 py-2">{item.grnNo}</td>
                      <td className="px-3 py-2">{item.batchNo}</td>
                      <td className="px-3 py-2 text-right">{item.avlQty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={selectedRows.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Save Selected ({selectedRows.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default FillGridModal;