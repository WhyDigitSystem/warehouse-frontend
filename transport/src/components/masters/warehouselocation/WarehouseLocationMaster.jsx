import { useState } from "react";
import WarehouseLocationList from "./WarehouseLocationList";
import WarehouseLocationForm from "./WarehouseLocationForm";

const WarehouseLocation = () => {
  const [currentView, setCurrentView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setCurrentView("form");
  };

  const handleEdit = (location) => {
    setEditData(location);
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("list");
    setEditData(null);
  };

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      {currentView === "list" ? (
        <WarehouseLocationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <WarehouseLocationForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default WarehouseLocation;