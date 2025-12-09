import { useState } from "react";
import MultiBuyerOrderList from "./MultiBuyerOrderList";
import MultiBuyerOrderForm from "./MultiBuyerOrderForm";

const MultiBuyerOrderPage = () => {
  const [screen, setScreen] = useState("list");   // list | form
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
        <MultiBuyerOrderList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <MultiBuyerOrderForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default MultiBuyerOrderPage;