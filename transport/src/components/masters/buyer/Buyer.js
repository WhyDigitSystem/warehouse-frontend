import { useState } from "react";
import BuyerMasterList from "./buyerList";
import BuyerMasterForm from "./BuyerForm";

const BuyerMaster = () => {
  const [currentView, setCurrentView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setCurrentView("form");
  };

  const handleEdit = (buyer) => {
    setEditData(buyer);
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
        <BuyerMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <BuyerMasterForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default BuyerMaster;
