import React, { useState } from "react";
import InputField from "../UI/InputField";

const BankDetailsTab = () => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-b-xl transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Bank Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Account Number */}
        <InputField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          placeholder="Enter account number"
          compact
        />

        {/* IFSC Code */}
        <InputField
          label="IFSC"
          name="ifsc"
          value={formData.ifsc}
          onChange={handleChange}
          placeholder="Enter IFSC code"
          compact
        />

        {/* Account Holder Name */}

          <InputField
            label="Account Holder Name"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            placeholder="Enter account holder name"
            compact
          />
      </div>
    </div>
  );
};

export default BankDetailsTab;
