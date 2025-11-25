import { useState } from "react";
import VehicleListView from "../components/Vehicle/VehicleListView";
import VehicleMaster from "../components/Vehicle/VehicleMaster";



const Vehicle = () => {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all duration-300">
      {isListView ? (
        <VehicleListView setIsListView={setIsListView} />
      ) : (
        <VehicleMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Vehicle;
