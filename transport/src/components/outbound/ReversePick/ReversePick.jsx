import { useState } from "react";
import ReversePickList from "./ReversePickList";
import ReversePickForm from "./ReversePickForm";

const ReversePickPage = () => {
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
        <ReversePickList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ReversePickForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default ReversePickPage;