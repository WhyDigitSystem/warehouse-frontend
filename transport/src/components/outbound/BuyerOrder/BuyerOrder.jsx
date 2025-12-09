import { useState } from "react";
import BuyerOrderList from "./BuyerOrderList";
import BuyerOrderForm from "./BuyerOrderForm";

const BuyerOrderPage = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <BuyerOrderList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <BuyerOrderForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default BuyerOrderPage;