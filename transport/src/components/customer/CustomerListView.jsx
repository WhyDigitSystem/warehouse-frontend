import { Plus, Filter, Users, Phone, Mail, CheckCircle, XCircle, Edit3 } from "lucide-react";

const CustomerListView = ({ setIsListView }) => {
  const mockCustomers = [
    { id: 1, name: "ABC Logistics", phone: "9876543210", email: "abc@logistics.com", status: "Active" },
    { id: 2, name: "TransPro Pvt Ltd", phone: "8877665544", email: "contact@transpro.com", status: "Inactive" },
    { id: 3, name: "FastMove Cargo", phone: "9123456789", email: "info@fastmove.in", status: "Active" },
  ];

  const handleEdit = (cust) => {
    console.log("Edit customer:", cust);
    // Example: pass data to CustomerMaster via state or context
    setIsListView(false);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => setIsListView(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCustomers.map((cust) => (
          <div
            key={cust.id}
            className="group bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all relative"
          >
            {/* Edit Button (top-right corner) */}
            <button
              onClick={() => handleEdit(cust)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title="Edit Customer"
            >
              <Edit3 className="h-4 w-4 text-gray-500 dark:text-gray-300 group-hover:text-blue-600" />
            </button>

            {/* Card Header */}
            <div className="flex justify-between items-center mb-2 pr-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {cust.name}
              </h3>
              {cust.status === "Active" ? (
                <CheckCircle className="text-green-500 h-5 w-5" />
              ) : (
                <XCircle className="text-red-500 h-5 w-5" />
              )}
            </div>

            {/* Contact Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" /> {cust.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" /> {cust.email}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 flex justify-end">
              <span
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  cust.status === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {cust.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerListView;
