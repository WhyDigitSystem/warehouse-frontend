import { useState } from "react";

import { useNavigate } from "react-router-dom";
import RfqListView from "../components/RFQ/RFQListView";
import RfqMaster from "../components/RFQ/RFQMaster";

const RFQ = () => {
  const [isListView, setIsListView] = useState(true);

  console.log("Test", isListView)
  const navigate = useNavigate();

  return (
    <div>
      {isListView ? (
        <RfqListView setIsListView={setIsListView} />
      ) : (
        <RfqMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default RFQ;
