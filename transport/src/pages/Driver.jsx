import { useState } from "react";
import DriverListView from "../components/Driver/DriverListView";
import DriverMaster from "../components/Driver/DriverMaster";

const Driver = () => {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all duration-300">
      {isListView ? (
        <DriverListView setIsListView={setIsListView} />
      ) : (
        <DriverMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Driver;
