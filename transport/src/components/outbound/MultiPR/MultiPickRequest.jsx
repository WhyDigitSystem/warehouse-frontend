import { useState } from "react";
import MultiPickRequestList from "./MultiPickRequestList";

const MultiPickRequestPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="multi-pick-request-page">
      <MultiPickRequestList
        onSaveSuccess={handleSaveSuccess}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default MultiPickRequestPage;