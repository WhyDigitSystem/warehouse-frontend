// ItemMasterPage.jsx
import { useState } from "react";
import ItemMasterList from "./ItemMasterList";
import ItemMasterForm from "./ItemMasterForm";

const ItemMasterPage = () => {
  const [screen, setScreen] = useState("list");   // list | form
  const [editData, setEditData] = useState(null); // when editing
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
        <ItemMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ItemMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default ItemMasterPage;