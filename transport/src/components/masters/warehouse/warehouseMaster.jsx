import React, { useState } from "react";
import WarehouseMasterList from "./WarehouseMasterList";
import WarehouseMasterForm from "./WarehouseMasterForm";

const WarehouseMaster = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const handleAddNew = () => {
    setSelectedWarehouse(null);
    setCurrentView("form");
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedWarehouse(null);
  };

  const handleSave = () => {
    setCurrentView("list");
    setSelectedWarehouse(null);
  };

  return (
    <div>
      {currentView === "list" ? (
        <WarehouseMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      ) : (
        <WarehouseMasterForm
          onBack={handleBack}
          onSave={handleSave}
          editData={selectedWarehouse}
        />
      )}
    </div>
  );
};

export default WarehouseMaster;