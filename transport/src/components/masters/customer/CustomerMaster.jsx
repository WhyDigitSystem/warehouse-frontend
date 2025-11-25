// CustomerMasterPage.jsx
import { useState } from "react";
import CustomerMasterList from "./CustomerMasterList";
import CustomerMasterForm from "./CustomerMasterForm";


const CustomerMasterPage = () => {
  const [screen, setScreen] = useState("list");   // list | form
  const [editData, setEditData] = useState(null); // when editing

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
        <CustomerMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
        />
      )}

      {screen === "form" && (
        <CustomerMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default CustomerMasterPage;
