import { Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { masterAPI } from "../../../api/customerAPI";

const CustomerMasterList = ({ onAddNew, onEdit }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const ORG_ID = 1000000001;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await masterAPI.getCustomer(ORG_ID);
      console.log("Customer List API →", data);
      setList(data);
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter((cust) =>
    cust.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Master
        </h1>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700 transition"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Search Box */}
      <div
        className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm
      "
      >
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Loading customers…
        </p>
      )}

      {/* Table */}
      {!loading && (
        <div
          className="
          rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 
          shadow-sm
        "
        >
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Customer</th>
                <th className="p-2 text-left font-medium">POC name</th>
                <th className="p-2 text-left font-medium">Email</th>
                <th className="p-2 text-left font-medium">Mobile No</th>
                <th className="p-2 text-left font-medium">City</th>
                <th className="p-2 text-left font-medium">Clients</th>
                <th className="p-2 text-left font-medium">Branches</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {filtered.map((cust, i) => (
                <tr
                  key={cust.id}
                  className="border-t border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{cust.customerName}</td>
                  <td className="p-2">{cust.contactPerson}</td>
                  <td className="p-2">{cust.emailId}</td>
                  <td className="p-2">{cust.mobileNumber}</td>
                  <td className="p-2">{cust.city}</td>
                  {/* Client count */}
                  <td className="p-2">{cust.clientVO?.length ?? 0}</td>

                  {/* Branch count */}
                  <td className="p-2">{cust.clientBranchVO?.length ?? 0}</td>

                  {/* Status */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium 
                        ${
                          cust.active === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {cust.active}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center gap-3">
                    <Pencil
                      className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer"
                      onClick={() => onEdit(cust)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerMasterList;
