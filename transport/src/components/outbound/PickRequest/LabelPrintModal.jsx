// LabelPrintModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, AlertCircle, RefreshCw, Truck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { PickRequestAPI } from "../../../api/pickrequestAPI";


const LabelPrintModal = ({ visible, onClose, row }) => {
  const [loading, setLoading] = useState(false);
  const [labelType, setLabelType] = useState('small');
  const [printData, setPrintData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('item'); // 'item' or 'shipping'
  const [numberOfLabels, setNumberOfLabels] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    toName: '',
    toAddress: ''
  });

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";

  useEffect(() => {
    if (visible && row) {
      console.log("🔄 LabelPrintModal - Starting data processing from LIST VIEW");
      console.log("📦 Received row:", row);
      
      // Initialize shipping address from row data
      if (row.customerName || row.customerAddress) {
        setShippingAddress({
          toName: row.customerName || '',
          toAddress: row.customerAddress || ''
        });
      }
      
      fetchPickRequestDetails();
    } else {
      // Reset when modal closes
      setPrintData([]);
      setShippingAddress({ toName: '', toAddress: '' });
      setNumberOfLabels(1);
      setActiveTab('item');
    }
  }, [visible, row]);

  const fetchPickRequestDetails = async () => {
    if (!row?.id) {
      console.error("❌ No row ID provided");
      return;
    }

    setFetching(true);
    try {
      console.log("📡 Fetching pick request details for ID:", row.id);
      
      const response = await PickRequestAPI.getPickRequestById(row.id);
      console.log("📡 API Response:", response);

      if (response?.status === true && response.paramObjectsMap?.pickRequestVO) {
        const data = response.paramObjectsMap.pickRequestVO;
        console.log("✅ Fetched pick request details:", data);
        
        const items = data.pickRequestDetailsVO || [];
        console.log("📦 Items from API:", items);
        console.log("📦 Items count:", items.length);

        processItemsForLabels(items, data);
      } else {
        console.error("❌ Failed to fetch pick request details");
        setPrintData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching pick request details:", error);
      setPrintData([]);
    } finally {
      setFetching(false);
    }
  };

  const processItemsForLabels = (items, formData) => {
    console.log("🔧 Processing items for labels...");
    console.log("📦 Items to process:", items);

    if (items && items.length > 0) {
      console.log("✅ Items array has data, filtering valid items...");
      
      const validItems = items.filter(item => {
        const hasPartNo = item?.partNo && item.partNo.trim() !== '';
        const hasBin = item?.bin && item.bin.trim() !== '';
        const isValid = item && (hasPartNo || hasBin);
        
        if (!isValid) {
          console.log("❌ Filtered out item:", item);
        }
        return isValid;
      });

      console.log("✅ Valid items after filtering:", validItems);
      console.log("✅ Valid items count:", validItems.length);

      if (validItems.length > 0) {
        const preparedData = validItems.map((item, index) => {
          const labelItem = {
            id: item.id || `label-${index}-${Date.now()}`,
            partNo: item.partNo || 'NO PART NO',
            partDesc: item.partDesc || 'No Description',
            bin: item.bin || 'NO BIN',
            sku: item.sku || 'PCS',
            batchNo: item.batchNo || 'N/A',
            pickQty: item.pickQty || item.orderQty || 0,
            availQty: item.availQty || 0,
            docId: formData?.docId || row?.docId || 'No Doc ID',
            customerName: formData?.customerName || formData?.clientName || row?.customerName || 'No Customer',
            printDate: new Date().toLocaleDateString('en-GB'),
            createdBy: formData?.createdBy || 'System'
          };
          console.log(`📄 Prepared label ${index}:`, labelItem);
          return labelItem;
        });

        console.log("🎉 Final prepared data:", preparedData);
        setPrintData(preparedData);
      } else {
        console.log("❌ No valid items found after filtering");
        setPrintData([]);
      }
    } else {
      console.log("❌ No items available in pick request details");
      setPrintData([]);
    }
  };

  const handleClose = () => {
    console.log("🚪 Closing modal");
    setPrintData([]);
    setLabelType('small');
    setActiveTab('item');
    setNumberOfLabels(1);
    setShippingAddress({ toName: '', toAddress: '' });
    if (onClose) onClose();
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing data");
    fetchPickRequestDetails();
  };

  // Generate barcode data for shipping labels
  const generateBarcodeData = () => {
    return `${row?.docId || row?.buyerOrderNo || 'ORDER'}`;
  };

  // Shipping Label Functions
  // In your LabelPrintModal.jsx, replace the direct JsBarcode usage:

const handlePrintShippingLabels = async () => {
  if (numberOfLabels <= 0) {
    alert("Number of labels must be greater than 0");
    return;
  }

  console.log("🚚 Printing shipping labels:", numberOfLabels);
  setLoading(true);

  try {
    // Dynamically import JsBarcode
    const JsBarcode = (await import('jsbarcode')).default;
    
    const printWindow = window.open('', '_blank');
    const barcodeData = generateBarcodeData();

    // Rest of your printing code...
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Labels - ${row?.docId || 'PickRequest'}</title>
          <style>
            /* your styles */
          </style>
          <script src="https://unpkg.com/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          ${Array.from({ length: numberOfLabels }, (_, i) => `
            <div class="label">
              <!-- your label content -->
              <svg id="barcode-${i}" width="180" height="30"></svg>
            </div>
          `).join('')}
          <script>
            window.onload = function() {
              ${Array.from({ length: numberOfLabels }, (_, i) => `
                JsBarcode("#barcode-${i}", "${barcodeData}", {
                  format: "CODE128",
                  width: 1.5,
                  height: 30,
                  displayValue: false,
                  margin: 0
                });
              `).join('')}
              setTimeout(() => { window.print(); }, 300);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  } catch (error) {
    console.error('❌ Shipping label print error:', error);
    alert('Error printing shipping labels');
  } finally {
    setLoading(false);
  }
};

  const handleDownloadShippingPDF = async () => {
    if (numberOfLabels <= 0) {
      alert("Number of labels must be greater than 0");
      return;
    }

    console.log("📄 Generating shipping label PDF for", numberOfLabels, "labels");
    setLoading(true);

    try {
      const containerId = `shipping-label-container-${Date.now()}`;
      const container = document.createElement("div");
      container.id = containerId;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.width = "384px"; // 4in @ 96 DPI
      container.style.background = "#fff";
      document.body.appendChild(container);

      // Create labels
      for (let i = 0; i < numberOfLabels; i++) {
        const label = document.createElement("div");
        label.style.width = "384px";
        label.style.height = "192px"; // 2in @ 96 DPI
        label.style.boxSizing = "border-box";
        label.style.position = "relative";
        label.style.border = "1px dotted #ccc";
        label.style.display = "flex";
        label.style.flexDirection = "column";
        label.style.justifyContent = "flex-start";
        label.style.padding = "6px";
        label.style.overflow = "hidden";

        label.innerHTML = `
          <div style="text-align:center; font-size:16px; font-weight:bold; margin-bottom:4px;">SHIPPING LABEL</div>
          <div style="display:flex; justify-content:space-between; font-size:11px; line-height:1.2; margin-bottom:4px;">
            <div style="width:48%;"><strong>From:</strong><br/>Uniworld Logistics pvt ltd<br/>Bilapur tauru road mewat 122105</div>
            <div style="width:48%;"><strong>To:</strong><br/>${
              shippingAddress.toName || row?.customerName || 'N/A'
            }<br/>${shippingAddress.toAddress || row?.customerAddress || 'N/A'}</div>
          </div>
          <div style="text-align:center; font-size:13px; font-weight:bold; margin-bottom:4px;">
            Order No: ${row?.docId || row?.buyerOrderNo || 'N/A'}
          </div>
          <div style="text-align:center; margin-bottom:4px;">
            <svg id="barcode-download-${containerId}-${i}" width="180" height="30"></svg>
          </div>
          <div style="position:absolute; bottom:4px; left:0; width:100%; text-align:center; font-size:10px;">
            Label ${i + 1} of ${numberOfLabels}
          </div>
        `;
        container.appendChild(label);
      }

      // Wait for DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate barcodes
      const barcodeData = generateBarcodeData();
      for (let i = 0; i < numberOfLabels; i++) {
        const el = document.getElementById(`barcode-download-${containerId}-${i}`);
        if (el) {
          JsBarcode(el, barcodeData, {
            format: "CODE128",
            width: 1.5,
            height: 30,
            displayValue: false,
            margin: 0,
          });
        }
      }

      // Wait for barcodes to render
      await new Promise((resolve) => setTimeout(resolve, 300));

      const totalHeight = 192 * numberOfLabels;
      const canvas = await html2canvas(container, {
        scale: 2,
        width: 384,
        height: totalHeight,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, numberOfLabels * 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 4, numberOfLabels * 2);
      pdf.save(`shipping_labels_${row?.docId || 'labels'}.pdf`);
      
      console.log("✅ Shipping label PDF generated successfully");
    } catch (error) {
      console.error('❌ Shipping label PDF generation error:', error);
      alert('Error generating shipping label PDF');
    } finally {
      // Clean up
      const containers = document.querySelectorAll(`[id^="shipping-label-container-"]`);
      containers.forEach(container => container.remove());
      setLoading(false);
    }
  };

  // Original item label functions (keep your existing code)
  const handlePrint = () => {
    if (printData.length === 0) {
      console.error("❌ No data to print");
      alert("No labels available to print. The pick request may not have items with Part Numbers or Bin locations.");
      return;
    }

    console.log("🖨️ Starting print process for", printData.length, "labels");
    setLoading(true);
    try {
      const printContent = document.getElementById('labels-content');
      if (!printContent) {
        console.error('❌ Print content not found');
        return;
      }

      const printWindow = window.open('', '_blank');
      const labelsHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Labels - ${row?.docId || 'PickRequest'}</title>
            <style>
              body { 
                margin: 10px; 
                padding: 0;
                font-family: Arial, sans-serif;
                background: white;
              }
              .labels-container {
                display: grid;
                grid-template-columns: ${labelType === 'small' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)'};
                gap: 8px;
                width: 100%;
              }
              .label {
                border: 1px solid #000;
                padding: 8px;
                border-radius: 4px;
                page-break-inside: avoid;
                background: white;
                font-size: ${labelType === 'small' ? '9px' : '11px'};
                min-height: ${labelType === 'small' ? '80px' : '120px'};
              }
              .label-header {
                font-weight: bold;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4px;
                margin-bottom: 4px;
                text-align: center;
                font-size: ${labelType === 'small' ? '10px' : '12px'};
              }
              .label-field {
                margin: 1px 0;
                display: flex;
                justify-content: space-between;
              }
              .field-name {
                font-weight: bold;
                margin-right: 5px;
                min-width: 40px;
              }
              .field-value {
                text-align: right;
                flex: 1;
              }
              @media print {
                body { margin: 5px; }
                .no-print { display: none; }
                .label { border: 1px solid #000 !important; }
              }
            </style>
          </head>
          <body>
            <div class="labels-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(labelsHTML);
      printWindow.document.close();
    } catch (error) {
      console.error('❌ Print error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (printData.length === 0) {
      console.error("❌ No data to generate PDF");
      alert("No labels available to download. The pick request may not have items with Part Numbers or Bin locations.");
      return;
    }

    console.log("📄 Starting PDF generation for", printData.length, "labels");
    setLoading(true);
    try {
      const input = document.getElementById('labels-content');
      if (!input) {
        console.error('❌ Labels content not found for PDF');
        return;
      }

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`labels_${row?.docId || 'pickrequest'}.pdf`);
      console.log("✅ PDF generated successfully");
    } catch (error) {
      console.error('❌ PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    console.log("👻 Modal not visible, returning null");
    return null;
  }

  console.log("🎯 Rendering modal with printData:", printData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Print Labels
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {row?.docId || 'Pick Request'} - {activeTab === 'item' ? `${printData.length} item labels ready` : 'Shipping labels'}
              {fetching && ' (Loading...)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('item')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'item'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Item Labels
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'shipping'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Shipping Labels
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Debug Info:</strong> 
            Row ID: {row?.id || 'N/A'} | 
            Doc ID: {row?.docId || 'N/A'} | 
            {activeTab === 'item' ? `Valid labels: ${printData.length} |` : 'Shipping labels ready |'}
            Fetching: {fetching ? 'Yes' : 'No'}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              {activeTab === 'item' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                      Label Size:
                    </label>
                    <select
                      value={labelType}
                      onChange={(e) => setLabelType(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={fetching}
                    >
                      <option value="small">Small (4 per page)</option>
                      <option value="large">Large (2 per page)</option>
                    </select>
                  </div>
                  
                  <div className="text-sm">
                    {fetching ? (
                      <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading items...
                      </span>
                    ) : printData.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ✅ {printData.length} labels ready for printing
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        ❌ No printable labels found
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                      Number of Labels:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numberOfLabels}
                      onChange={(e) => setNumberOfLabels(parseInt(e.target.value) || 1)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20"
                    />
                  </div>
                  
                  <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    ✅ Shipping labels ready
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={fetching}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          {activeTab === 'item' ? (
            /* Item Labels Content */
            fetching ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading pick request items...
                </p>
              </div>
            ) : printData.length > 0 ? (
              <div 
                id="labels-content"
                className={`grid gap-3 mx-auto ${
                  labelType === 'small' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl' 
                    : 'grid-cols-1 sm:grid-cols-2 max-w-4xl'
                }`}
              >
                {printData.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 border-gray-400 rounded-lg p-3 bg-white shadow-md ${
                      labelType === 'small' ? 'min-h-[100px]' : 'min-h-[140px]'
                    }`}
                  >
                    <div className="label-header text-gray-900 font-bold">
                      {item.customerName}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="label-field">
                        <span className="field-name">Part:</span>
                        <span className="field-value font-mono">{item.partNo}</span>
                      </div>
                      
                      <div className="label-field">
                        <span className="field-name">Desc:</span>
                        <span className="field-value text-xs truncate" title={item.partDesc}>
                          {item.partDesc}
                        </span>
                      </div>
                      
                      <div className="label-field">
                        <span className="field-name">Bin:</span>
                        <span className="field-value font-mono font-bold">{item.bin}</span>
                      </div>
                      
                      <div className="label-field">
                        <span className="field-name">Batch:</span>
                        <span className="field-value">{item.batchNo}</span>
                      </div>
                      
                      <div className="label-field">
                        <span className="field-name">Qty:</span>
                        <span className="field-value font-bold text-blue-600">
                          {item.pickQty} {item.sku}
                        </span>
                      </div>
                      
                      <div className="label-field text-xs text-gray-500 mt-2 pt-1 border-t border-gray-300">
                        <span>Doc: {item.docId}</span>
                        <span>{item.printDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <AlertCircle className="h-16 w-16 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Printable Labels Found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This pick request doesn't have any items with Part Numbers or Bin locations.
                  </p>
                  <div className="mt-4 text-xs text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    <strong>Requirements for labels:</strong> Each item needs either a Part Number or Bin location.
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Shipping Labels Content */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Shipping Label Configuration
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ship To Name:
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.toName}
                      onChange={(e) => setShippingAddress(prev => ({...prev, toName: e.target.value}))}
                      placeholder="Enter recipient name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ship To Address:
                    </label>
                    <textarea
                      value={shippingAddress.toAddress}
                      onChange={(e) => setShippingAddress(prev => ({...prev, toAddress: e.target.value}))}
                      placeholder="Enter shipping address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Shipping Label Preview */}
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Label Preview (4" x 2"):
                  </h5>
                  <div
                    className="mx-auto border border-gray-300 dark:border-gray-600 bg-white p-4"
                    style={{
                      width: '4in',
                      height: '2in',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      lineHeight: '1.2',
                    }}
                  >
                    <div className="text-center font-bold text-base mb-1">
                      SHIPPING LABEL
                    </div>
                    <div className="flex justify-between mb-2">
                      <div className="w-48%">
                        <strong>From:</strong>
                        <br />
                        Uniworld Logistics pvt ltd
                        <br />
                        Bilapur tauru road mewat 122105
                      </div>
                      <div className="w-48%">
                        <strong>To:</strong>
                        <br />
                        {shippingAddress.toName || row?.customerName || 'N/A'}
                        <br />
                        {shippingAddress.toAddress || row?.customerAddress || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center font-bold mb-1">
                      Order No: {row?.docId || row?.buyerOrderNo || 'N/A'}
                    </div>
                    <div className="text-center">
                      {/* Barcode preview would go here */}
                      <div className="text-xs text-gray-500">[Barcode Preview]</div>
                    </div>
                    <div className="text-center text-xs">
                      Label 1 of {numberOfLabels}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {fetching 
              ? 'Loading items...' 
              : activeTab === 'item'
                ? printData.length > 0 
                  ? `Ready to print ${printData.length} item labels` 
                  : 'No printable items found in this pick request'
                : `Ready to print ${numberOfLabels} shipping labels`
            }
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            
            {activeTab === 'item' ? (
              <>
                <button
                  onClick={handleDownloadPDF}
                  disabled={loading || printData.length === 0 || fetching}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {loading ? 'Generating...' : 'Download PDF'}
                </button>
                
                <button
                  onClick={handlePrint}
                  disabled={loading || printData.length === 0 || fetching}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  {loading ? 'Printing...' : 'Print Labels'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDownloadShippingPDF}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {loading ? 'Generating...' : 'Download PDF'}
                </button>
                
                <button
                  onClick={handlePrintShippingLabels}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Truck className="h-4 w-4" />
                  {loading ? 'Printing...' : 'Print Shipping Labels'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrintModal;