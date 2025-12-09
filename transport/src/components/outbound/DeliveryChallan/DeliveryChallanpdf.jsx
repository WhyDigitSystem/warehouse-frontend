import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const GeneratePdfDeliveryChallan = ({ row, onClose, onDownload }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContentRef = useRef(null);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    totalGST: 0,
    totalBillAmount: 0,
    totalShippedQty: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    if (row) {
      calculateTotals();
    }
  }, [row]);

  const calculateTotals = () => {
    if (!row?.deliveryChallanDetailsVO) return;

    const totals = row.deliveryChallanDetailsVO.reduce(
      (acc, item) => {
        const shippedQty = parseFloat(item.shippedQty) || 0;
        const unitRate = parseFloat(item.unitRate) || 0;
        const amount = parseFloat(item.amount) || 0;
        const totalGst = parseFloat(item.totalGst) || 0;
        const billAmount = parseFloat(item.billAmount) || 0;

        return {
          totalAmount: acc.totalAmount + amount,
          totalGST: acc.totalGST + totalGst,
          totalBillAmount: acc.totalBillAmount + billAmount,
          totalShippedQty: acc.totalShippedQty + shippedQty,
          totalWeight: acc.totalWeight + (unitRate * shippedQty),
        };
      },
      { totalAmount: 0, totalGST: 0, totalBillAmount: 0, totalShippedQty: 0, totalWeight: 0 }
    );

    setTotals(totals);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD-MM-YYYY');
  };

  const formatDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${date} ${time}`;
  };

  const handleDownloadPdf = async () => {
    if (!pdfContentRef.current) {
      console.error("PDF content element not found");
      return;
    }

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Delivery_Challan_${row.docId || 'DC'}_${dayjs().format('YYYY-MM-DD_HHmmss')}.pdf`);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Challan - ${row.docId || 'DC'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            ${document.getElementById('pdf-styles')?.innerHTML || ''}
          </style>
        </head>
        <body>
          ${pdfContentRef.current?.innerHTML || ''}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!row) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">No Data</h3>
          <p className="text-gray-600 mb-4">No delivery challan data available for PDF generation.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inline Styles for PDF */}
      <style id="pdf-styles">
        {`
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
            .pdf-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: white;
            }
          }
          
          .pdf-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
            font-family: 'Arial', sans-serif;
            box-sizing: border-box;
          }
          
          .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          
          .company-info h2 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #1a237e;
          }
          
          .company-info p {
            margin: 2px 0;
            font-size: 12px;
            color: #666;
          }
          
          .document-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            color: #d32f2f;
          }
          
          .branch-info {
            text-align: right;
          }
          
          .branch-info h3 {
            font-size: 18px;
            margin: 0;
            color: #1a237e;
          }
          
          .document-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          
          .info-section h4 {
            font-size: 16px;
            margin: 0 0 10px 0;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 5px;
          }
          
          .info-label {
            font-weight: bold;
            width: 120px;
            color: #555;
          }
          
          .info-value {
            flex: 1;
            color: #333;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #1a237e;
            padding-bottom: 5px;
            border-bottom: 2px solid #1a237e;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .items-table th {
            background: #1a237e;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            border: 1px solid #ddd;
          }
          
          .items-table td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }
          
          .items-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          .items-table tr:hover {
            background: #f5f5f5;
          }
          
          .totals-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          
          .total-box {
            text-align: center;
            padding: 10px;
            border-radius: 4px;
            background: white;
            border: 1px solid #ddd;
          }
          
          .total-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .total-value {
            font-size: 16px;
            font-weight: bold;
            color: #1a237e;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
          }
          
          .signature-box {
            text-align: center;
            width: 200px;
          }
          
          .signature-line {
            width: 150px;
            height: 1px;
            background: #000;
            margin: 40px auto 5px auto;
          }
          
          .signature-label {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          
          .footer p {
            margin: 2px 0;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(0, 0, 0, 0.1);
            z-index: -1;
            white-space: nowrap;
          }
          
          .container-no {
            font-size: 14px;
            font-weight: bold;
            color: #d32f2f;
            background: #ffebee;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
            margin: 5px 0;
          }
          
          .vehicle-info {
            display: inline-block;
            background: #e8f5e8;
            padding: 5px 10px;
            border-radius: 4px;
            margin: 5px 0;
          }
          
          .alert-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 12px;
            color: #856404;
          }
        `}
      </style>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Delivery Challan Preview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Generated: {formatDateTime()}
              </span>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-4 overflow-auto max-h-[70vh]">
            {/* PDF Content */}
            <div ref={pdfContentRef} className="pdf-container">
              {/* Watermark */}
              <div className="watermark">DELIVERY CHALLAN</div>
              
              {/* Header */}
              <div className="pdf-header">
                <div className="company-info">
                  <h2>UWL WMS</h2>
                  <p>Warehouse Management System</p>
                  <p>Email: info@efitwms.com | Phone: +91-XXXXXXXXXX</p>
                </div>
                
                <div className="document-title">DELIVERY CHALLAN</div>
                
                <div className="branch-info">
                  <h3>{row.branch || localStorage.getItem('branch') || 'Main Branch'}</h3>
                  <p>Branch Code: {row.branchCode || 'N/A'}</p>
                </div>
              </div>
              
              {/* Document Information */}
              <div className="document-info">
                <div className="info-section">
                  <h4>Delivery Information</h4>
                  <div className="info-row">
                    <span className="info-label">Challan No:</span>
                    <span className="info-value">{row.docId || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Challan Date:</span>
                    <span className="info-value">{formatDate(row.docDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Buyer Order No:</span>
                    <span className="info-value">{row.buyerOrderNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">BO Date:</span>
                    <span className="info-value">{formatDate(row.boDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Pick Request No:</span>
                    <span className="info-value">
                      {row.deliveryChallanDetailsVO?.[0]?.pickRequestNo || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Transport & Logistics</h4>
                  <div className="info-row">
                    <span className="info-label">Container No:</span>
                    <span className="info-value container-no">{row.containerNO || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vehicle No:</span>
                    <span className="info-value vehicle-info">{row.vechileNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Transport Name:</span>
                    <span className="info-value">{row.transportName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gate Pass No:</span>
                    <span className="info-value">{row.gatePassNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gate Pass Date:</span>
                    <span className="info-value">{formatDate(row.gatePassDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Buyer Information */}
              <div className="section-title">Buyer Details</div>
              <div className="document-info">
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Buyer Name:</span>
                    <span className="info-value">{row.buyer || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Delivery Terms:</span>
                    <span className="info-value">{row.deliveryTerms || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Payment Terms:</span>
                    <span className="info-value">{row.payTerms || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Bill To:</span>
                    <span className="info-value" style={{whiteSpace: 'pre-wrap'}}>
                      {row.billTo || 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ship To:</span>
                    <span className="info-value" style={{whiteSpace: 'pre-wrap'}}>
                      {row.shipTo || row.billTo || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="section-title">Additional Information</div>
              <div className="document-info">
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Invoice No:</span>
                    <span className="info-value">{row.invoiceNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Excise Invoice:</span>
                    <span className="info-value">{row.exciseInvoiceNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Commercial Invoice:</span>
                    <span className="info-value">{row.commercialInvoiceNo || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">GR Waiver No:</span>
                    <span className="info-value">{row.grWaiverNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Bank Name:</span>
                    <span className="info-value">{row.bankName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Insurance No:</span>
                    <span className="info-value">{row.insuranceNo || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Packing Details */}
              <div className="section-title">Packing Details</div>
              <div className="document-info">
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">No. of Boxes:</span>
                    <span className="info-value">{row.noOfBoxes || '0'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gross Weight:</span>
                    <span className="info-value">
                      {row.grossWeight || '0'} {row.gwtUom || 'KG'}
                    </span>
                  </div>
                </div>
                
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Packing Slip No:</span>
                    <span className="info-value">{row.packingSlipNo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Docket No:</span>
                    <span className="info-value">{row.docketNo || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Important Notes */}
              <div className="alert-box">
                <strong>Important Notes:</strong>
                <ul style={{margin: '5px 0 0 20px', padding: 0}}>
                  <li>Goods once sold will not be taken back</li>
                  <li>All disputes subject to jurisdiction of local courts</li>
                  <li>Payment should be made within agreed terms</li>
                  <li>Original invoice must be presented for warranty claims</li>
                </ul>
              </div>
              
              {/* Items Table */}
              <div className="section-title">Delivery Items</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Part No</th>
                    <th>Part Description</th>
                    <th>Bin</th>
                    <th>Qty</th>
                    <th>Unit Rate</th>
                    <th>Amount</th>
                    <th>GST</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {row.deliveryChallanDetailsVO?.map((item, index) => (
                    <tr key={index}>
                      <td style={{textAlign: 'center'}}>{index + 1}</td>
                      <td>{item.partNo || 'N/A'}</td>
                      <td>{item.partDescription || 'N/A'}</td>
                      <td>{item.outBoundBin || 'N/A'}</td>
                      <td style={{textAlign: 'right'}}>{item.shippedQty || '0'}</td>
                      <td style={{textAlign: 'right'}}>{parseFloat(item.unitRate || 0).toFixed(2)}</td>
                      <td style={{textAlign: 'right'}}>{parseFloat(item.amount || 0).toFixed(2)}</td>
                      <td style={{textAlign: 'right'}}>{parseFloat(item.totalGst || 0).toFixed(2)}</td>
                      <td style={{textAlign: 'right'}}>{parseFloat(item.billAmount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totals Section */}
              <div className="totals-section">
                <div className="total-box">
                  <div className="total-label">Total Quantity</div>
                  <div className="total-value">{totals.totalShippedQty}</div>
                </div>
                <div className="total-box">
                  <div className="total-label">Total Amount</div>
                  <div className="total-value">₹{totals.totalAmount.toFixed(2)}</div>
                </div>
                <div className="total-box">
                  <div className="total-label">Total GST</div>
                  <div className="total-value">₹{totals.totalGST.toFixed(2)}</div>
                </div>
                <div className="total-box">
                  <div className="total-label">Bill Amount</div>
                  <div className="total-value">₹{totals.totalBillAmount.toFixed(2)}</div>
                </div>
              </div>
              
              {/* Amount in Words */}
              <div className="alert-box" style={{background: '#e3f2fd', borderColor: '#2196f3', color: '#0d47a1'}}>
                <strong>Amount in Words:</strong> {convertToWords(totals.totalBillAmount)} ONLY
              </div>
              
              {/* Signatures */}
              <div className="signature-section">
                <div className="signature-box">
                  <div className="signature-label">Prepared By</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Signature</div>
                </div>
                
                <div className="signature-box">
                  <div className="signature-label">Checked By</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Signature</div>
                </div>
                
                <div className="signature-box">
                  <div className="signature-label">Authorized Signatory</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Signature & Stamp</div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="footer">
                <p>This is a computer generated document. No signature required.</p>
                <p>Generated on: {formatDateTime()} | User: {row.createdBy || localStorage.getItem('userName') || 'System'}</p>
                <p>UWL WMS © {new Date().getFullYear()} | All rights reserved</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Document: {row.docId || 'N/A'} | Items: {row.deliveryChallanDetailsVO?.length || 0}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <button
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to convert number to words
const convertToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const numStr = num.toFixed(2);
  const [whole, fraction] = numStr.split('.');
  
  let words = '';
  let n = parseInt(whole);

  if (n === 0) return 'Zero Rupees';

  // Crores
  if (n >= 10000000) {
    words += convertToWords(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }

  // Lakhs
  if (n >= 100000) {
    words += convertToWords(Math.floor(n / 100000)) + ' Lakh ';
    n %= 100000;
  }

  // Thousands
  if (n >= 1000) {
    words += convertToWords(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }

  // Hundreds
  if (n >= 100) {
    words += convertToWords(Math.floor(n / 100)) + ' Hundred ';
    n %= 100;
  }

  // Tens and Ones
  if (n > 0) {
    if (words !== '') words += 'and ';

    if (n < 20) {
      words += a[n];
    } else {
      words += b[Math.floor(n / 10)];
      if (n % 10 > 0) {
        words += '-' + a[n % 10];
      }
    }
  }

  words += ' Rupees';

  // Add paise
  if (fraction && parseInt(fraction) > 0) {
    words += ' and ' + convertToWords(parseInt(fraction)) + ' Paise';
  }

  return words;
};

export default GeneratePdfDeliveryChallan;