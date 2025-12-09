import React from 'react';

const BulkBarcodePrint = ({ visible, onClose, items, formData }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bulk Barcode Printing</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document No:</label>
              <p className="font-semibold">{formData.docId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Total Items:</label>
              <p className="font-semibold">{items.length}</p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Part No</th>
                  <th className="px-3 py-2 text-left">Part Desc</th>
                  <th className="px-3 py-2 text-left">Bin</th>
                  <th className="px-3 py-2 text-left">Print Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.partNo}</td>
                    <td className="px-3 py-2">{item.partDesc}</td>
                    <td className="px-3 py-2">{item.bin}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        defaultValue={1}
                        min="1"
                        max="10"
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Implement bulk print functionality
              console.log('Bulk print barcodes', { items, formData });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print All Barcodes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkBarcodePrint;