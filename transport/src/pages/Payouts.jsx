import { useState } from "react";

import { useNavigate } from "react-router-dom";
import PayoutsListView from "../components/Payouts/PayoutsListView";
import PayoutsMaster from "../components/Payouts/PayoutsMaster";

const Payouts = () => {
  const [isListView, setIsListView] = useState(true);

  console.log("Test", isListView)
  const navigate = useNavigate();

  return (
    <div>
      {isListView ? (
        <PayoutsListView setIsListView={setIsListView} />
      ) : (
        <PayoutsMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Payouts;
