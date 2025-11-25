import { useState } from "react";
import CustomerListView from "../components/customer/CustomerListView";
import CustomerMaster from "../components/customer/CustomerMaster";


const Customer = () => {
  // 🔹 Controls which view is active
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all">
      {isListView ? (
        <CustomerListView setIsListView={setIsListView} />
      ) : (
        <CustomerMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Customer;
