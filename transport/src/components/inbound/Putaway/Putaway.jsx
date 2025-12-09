import React, { useState } from "react";
import PutawayForm from "./PutawayForm";
import PutawayList from "./PutawayList";

const Putaway = () => {
  const [currentView, setCurrentView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setCurrentView("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("list");
    setEditData(null);
  };

  const handleSaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentView === "list" ? (
        <PutawayList 
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <PutawayForm 
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default Putaway;