import { useState } from "react";
import InvoiceListView from "../components/Invoice/InvoiceListView";
import InvoiceMaster from "../components/Invoice/InvoiceMaster";


const Invoice = () => {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all">
      {isListView ? (
        <InvoiceListView setIsListView={setIsListView} />
      ) : (
        <InvoiceMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Invoice;
