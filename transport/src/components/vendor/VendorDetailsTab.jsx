import { useState } from "react";
import InputField from "../UI/InputField";
import ContractHistoryTable from "./ContractHistoryTable";

const VendorDetailsTab = () => {
  const [formData, setFormData] = useState({
    vendorCode: "VD-####",
    status: "Active",
    approvalStatus: "Pending",
    Organization: "",
    primaryPhone: "",
    primaryEmail: "",
    additionalPhones: "",
    additionalEmails: "",
    gst: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-b-xl transition-colors duration-300">
      {/* <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Vendor Details
      </h2> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <InputField
          label="Vendor Code"
          value={formData.vendorCode}
          name="vendorCode"
          disabled
          compact
        />
        <InputField
          label="Status"
          value={formData.status}
          name="status"
          disabled
          compact
        />

        <InputField
          label="Organization"
          required
          name="Organization"
          value={formData.Organization}
          onChange={handleChange}
          compact
        />
        <InputField
          label="Approval Status"
          value={formData.approvalStatus}
          name="approvalStatus"
          disabled
          compact
        />

        <InputField
          label="Primary Phone Number"
          required
          name="primaryPhone"
          value={formData.primaryPhone}
          onChange={handleChange}
          placeholder="+91-9876543210"
          compact
        />
        <InputField
          label="Primary Email"
          required
          name="primaryEmail"
          value={formData.primaryEmail}
          onChange={handleChange}
          placeholder="test@example.com"
          compact
        />

        <InputField
          label="Additional Phone Numbers"
          name="additionalPhones"
          value={formData.additionalPhones}
          onChange={handleChange}
          //   note="Enter comma (,) separated phone numbers. Eg: +91-1234567899, +91-9876545654"
          compact
        />
        <InputField
          label="Additional Emails"
          name="additionalEmails"
          value={formData.additionalEmails}
          onChange={handleChange}
          //   note="Enter comma (,) separated emails. Eg: test@example.com, test2@dummy.com"
          compact
        />

        <InputField
          label="GST"
          name="gst"
          value={formData.gst}
          onChange={handleChange}
          placeholder="29ABCDE1234F1Z5"
          compact
        />
        <InputField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter full address"
          compact
        />
      </div>
<br></br>
      <ContractHistoryTable/>
    </div>
  );
};

export default VendorDetailsTab;
