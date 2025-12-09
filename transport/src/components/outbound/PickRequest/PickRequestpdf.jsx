import React, { useEffect, useState } from "react";
import { Download, X, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PickRequestPDF = ({ row, onComplete, visible }) => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && row) {
      setOpen(true);

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentDateTime(`${formattedDate} ${formattedTime}`);
    }
  }, [visible, row]);

  const handleClose = () => {
    setOpen(false);
    if (onComplete) onComplete();
  };

  const handleDownloadPdf = async () => {
    setLoading(true);
    try {
      const input = document.getElementById("pdf-content");
      if (!input) return;

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PICK_${row?.docId || "document"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      const input = document.getElementById("pdf-content");
      if (!input) return;

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Pick Request - ${row?.docId}</title>
            <style>
              body { margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" />
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!row || !open) return null;

  // Get the details from the correct property
  const pickDetails = row.pickRequestDetailsVO || [];

  // Calculate totals
  const totalPickQty = pickDetails.reduce((sum, item) => sum + (Number(item.pickQty) || 0), 0);
  const totalAvailQty = pickDetails.reduce((sum, item) => sum + (Number(item.availQty) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pick Request - Preview
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-0 bg-gray-50 dark:bg-gray-800">
          <div
            id="pdf-content"
            className="bg-white p-6 mx-auto shadow-sm"
            style={{
              width: "210mm",
              minHeight: "297mm",
              fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
              color: "#1f2937",
              backgroundColor: "#ffffff",
            }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start border-b-2 border-gray-300 pb-4 mb-6">
              <div className="flex-1">
                <div className="text-gray-900 font-bold text-xl mb-1">UNIWORLD WMS</div>
                <div className="text-sm text-gray-600">
                  Warehouse Management System
                </div>
              </div>
              <div className="text-center flex-1">
                <div className="text-lg font-bold text-gray-900">PICK REQUEST</div>
                <div className="text-sm text-gray-600 mt-1">{row.docId}</div>
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold text-gray-900">{loginBranch}</div>
                <div className="text-sm text-gray-600">{currentDateTime}</div>
              </div>
            </div>

            {/* COMPANY INFO */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Client Information</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{row.clientName}</div>
                  <div className="text-xs text-gray-600 mt-1">{row.clientAddress}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Customer Information</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{row.customerName}</div>
                  <div className="text-xs text-gray-600 mt-1">{row.customerAddress}</div>
                </div>
              </div>
            </div>

            {/* DOCUMENT DETAILS */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Pick No</div>
                  <div className="text-gray-900 font-medium">{row.docId}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Pick Date</div>
                  <div className="text-gray-900">
                    {row.docDate ? new Date(row.docDate).toLocaleDateString("en-GB") : "-"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Order No</div>
                  <div className="text-gray-900">{row.buyerRefNo || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Status</div>
                  <div className="text-gray-900">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(row.status)}`}>
                      {row.status || 'DRAFT'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Buyer Order No</div>
                  <div className="text-gray-900">{row.buyerOrderNo || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Buyer Order Date</div>
                  <div className="text-gray-900">
                    {row.buyerOrderDate ? new Date(row.buyerOrderDate).toLocaleDateString("en-GB") : "-"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Total Items</div>
                  <div className="text-gray-900">{pickDetails.length}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-xs uppercase">Total Qty</div>
                  <div className="text-gray-900 font-bold">{totalPickQty}</div>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    {[
                      "Sl.",
                      "Part Code",
                      "Part Description",
                      "Batch",
                      "Unit",
                      "Pick Qty",
                      "Location",
                      "Tick",
                      "Avl Qty",
                    ].map((head, idx) => (
                      <th
                        key={idx}
                        className="border border-gray-300 p-2 font-semibold text-left text-xs uppercase"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pickDetails.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-200 p-2 text-gray-600">{index + 1}</td>
                      <td className="border border-gray-200 p-2 font-medium text-gray-900">
                        {item.partNo}
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-700">
                        {item.partDesc}
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-600 text-center">
                        {item.batchNo || "-"}
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-600 text-center">
                        {item.sku}
                      </td>
                      <td className="border border-gray-200 p-2 text-center font-bold text-green-700">
                        {item.pickQty}
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-600 text-center font-mono">
                        {item.bin}
                      </td>
                      <td className="border border-gray-200 p-2 text-center">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded mx-auto"></div>
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-600 text-center">
                        {item.availQty}
                      </td>
                    </tr>
                  ))}
                  
                  {/* TOTAL ROW */}
                  <tr className="bg-gray-100 font-semibold">
                    <td
                      colSpan={5}
                      className="border border-gray-300 p-2 text-right text-gray-700"
                    >
                      Total
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-red-700 font-bold">
                      {totalPickQty}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-700">
                      -
                    </td>
                    <td className="border border-gray-300 p-2 text-center">-</td>
                    <td className="border border-gray-300 p-2 text-center text-gray-700">
                      {totalAvailQty}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FOOTER & SIGNATURES */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="grid grid-cols-3 gap-8 text-xs text-center">
                <div>
                  <div className="border-b border-gray-300 pb-8 mb-2">
                    Prepared By
                  </div>
                  <div className="text-gray-600">Name & Signature</div>
                </div>
                <div>
                  <div className="border-b border-gray-300 pb-8 mb-2">
                    Picked By
                  </div>
                  <div className="text-gray-600">Name & Signature</div>
                </div>
                <div>
                  <div className="border-b border-gray-300 pb-8 mb-2">
                    Verified By
                  </div>
                  <div className="text-gray-600">Name & Signature</div>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-6">
                <div>Uniworld Logistics - Warehouse Management System</div>
                <div>{loginBranch} • {localStorage.getItem("address") || "Warehouse Address"}</div>
                <div className="mt-1">Generated on {currentDateTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-b-lg flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {pickDetails.length} items • Total Qty: {totalPickQty}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 
                       rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
            >
              <Printer size={16} />
              {loading ? "Printing..." : "Print"}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 
                       rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
            >
              <Download size={16} />
              {loading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 
                       dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors (same as in your template)
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case "CONFIRM":
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case "PENDING":
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case "CANCELLED":
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Get global parameters (same as in your template)
const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";

export default PickRequestPDF;