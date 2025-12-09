import { useState } from "react";
import VasPickList from "./VASPickList";
import VasPickForm from "./VASPickForm";

const VasPickPage = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setScreen("list");
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
        <VasPickList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <VasPickForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default VasPickPage;