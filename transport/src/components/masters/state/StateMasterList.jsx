import { ArrowLeft, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { masterAPI } from "../../../api/stateAPI";

const StateMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const ORG_ID = 1000000001;

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const response = await masterAPI.getStates(ORG_ID);
      setList(response);
    } catch (e) {
      console.error("Failed to load states", e);
      console.log("Failed to load states", 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter((state) =>
    state.stateName?.toLowerCase().includes(search.toLowerCase()) ||
    state.country?.toLowerCase().includes(search.toLowerCase()) ||
    state.region?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            onClick={onBack}
          />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            State Master
          </h1>
        </div>

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
          placeholder="Search states, countries, or regions…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Loading states…
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
                <th className="p-2 text-left font-medium">State Code</th>
                <th className="p-2 text-left font-medium">State Name</th>
                <th className="p-2 text-left font-medium">State Number</th>
                <th className="p-2 text-left font-medium">Country</th>
                <th className="p-2 text-left font-medium">Region</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {filtered.map((state, i) => (
                <tr
                  key={state.id}
                  className="border-t border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{state.stateCode}</td>
                  <td className="p-2">{state.stateName}</td>
                  <td className="p-2">{state.stateNumber}</td>
                  <td className="p-2">{state.country}</td>
                  <td className="p-2">{state.region}</td>

                  {/* Status */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium 
                        ${
                          state.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {state.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center">
                    <Pencil
                      className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer transition"
                      onClick={() => onEdit(state)}
                    />
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search ? "No states found matching your search" : "No states found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StateMasterList;