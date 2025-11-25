import { useState } from "react";
import CustomerBookingRequestListView from "../components/CustomerBookingRequest/CustomerBookingRequestListView";
import CustomerBookingRequestMaster from "../components/CustomerBookingRequest/CustomerBookingRequestMaster";


const CustomerBookingRequest = () => {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all">
      {isListView ? (
        <CustomerBookingRequestListView setIsListView={setIsListView} />
      ) : (
        <CustomerBookingRequestMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default CustomerBookingRequest;
