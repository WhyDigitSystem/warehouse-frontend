import InputField from "../UI/InputField";

const POCDetailsTab = ({ data, onChange }) => {
  const handleChange = (e) => onChange(e.target.name, e.target.value);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-b-xl transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <InputField label="POC Name" name="pocName" value={data.pocName} onChange={handleChange} compact />
        <InputField
          label="POC Phone Number"
          name="pocPhoneNumber"
          value={data.pocPhoneNumber}
          onChange={handleChange}
          placeholder="+91 9876543210"
          compact
        />
        <InputField
          label="POC Email"
          name="pocEmail"
          value={data.pocEmail}
          onChange={handleChange}
          placeholder="poc@example.com"
          compact
        />
      </div>
    </div>
  );
};

export default POCDetailsTab;
