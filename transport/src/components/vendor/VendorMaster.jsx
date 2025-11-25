import { useState } from "react";

import TabComponent from "../common/TabComponent";
import BankDetailsTab from "./BankDetailsTab";
import OtherDetailsTab from "./OtherDetailsTab";
import POCDetailsTab from "./POCDetailsTab";
import VendorDetailsTab from "./VendorDetailsTab";
import VendorUsersTable from "./VendorUsersTable";

const VendorMaster = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Details", component: <VendorDetailsTab /> },
    { label: "POC Details", component: <POCDetailsTab /> },
    { label: "Bank Details", component: <BankDetailsTab /> },
    { label: "Other Details", component: <OtherDetailsTab /> },
    { label: "Users", component: <VendorUsersTable /> },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-5 shadow-xl rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <TabComponent
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="transition-all duration-500">
        {tabs[activeTab].component}
      </div>
    </div>
  );
};

export default VendorMaster;
