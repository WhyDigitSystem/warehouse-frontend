import React, { useState } from "react";
import Select from "react-select";
import { Pencil, Plus, Trash2, Search } from "lucide-react";

const VendorUsersTable = () => {
  const [rows, setRows] = useState([{ id: 1, user: null }]);

  const [users] = useState([
    {
      label: "operation.admin@traqo.in",
      value: "operation.admin@traqo.in",
      role: "Operation Admin",
    },
    {
      label: "operation.team@traqo.in",
      value: "operation.team@traqo.in",
      role: "Operation User",
    },
    {
      label: "vimithaprimegoldgroup@gmail.com",
      value: "vimithaprimegoldgroup@gmail.com",
      role: "vimitha",
    },
  ]);

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, user: null }]);
  };

  const handleUserChange = (selected, index) => {
    const updated = [...rows];
    updated[index].user = selected;
    setRows(updated);
  };

  const handleDelete = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    alert(`Editing user in row ${index + 1}`);
  };

  // Custom styles for react-select
  const customStyles = {
    container: (base) => ({
      ...base,
      width: "100%",
      minWidth: "200px",
    }),
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      borderColor: state.isFocused
        ? "rgb(59,130,246)"
        : "rgba(156,163,175,0.5)",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59,130,246,0.3)"
        : "none",
      "&:hover": { borderColor: "rgb(59,130,246)" },
      backgroundColor: "white",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      width: "100%",
      minWidth: "100%",
      borderRadius: "0.5rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      fontSize: "0.85rem",
      zIndex: 50,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#eff6ff" : "white",
      color: "#111827",
      padding: "8px 12px",
    }),
  };

  const formatOptionLabel = (option) => (
    <div className="flex flex-col">
      <span className="font-medium text-gray-800">{option.label}</span>
      <span className="text-xs text-gray-500">{option.role}</span>
    </div>
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Vendor Users
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-3 py-3 w-8 text-center">
                <input type="checkbox" className="accent-blue-500" />
              </th>
              <th className="px-3 py-3 w-12">No.</th>
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3 text-center w-24">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" className="accent-blue-500" />
                </td>
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 w-[300px] max-w-[300px]">
                  <Select
                    value={row.user}
                    onChange={(selected) => handleUserChange(selected, index)}
                    options={users}
                    styles={customStyles}
                    placeholder="Select user..."
                    formatOptionLabel={formatOptionLabel}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                      MenuList: (props) => (
                        <>
                          {props.children}
                          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-blue-500 hover:underline text-sm cursor-pointer flex items-center gap-1">
                            <Search size={14} />
                            Advanced Search
                          </div>
                        </>
                      ),
                    }}
                    menuPlacement="auto"
                    menuPortalTarget={document.body}
                    menuPosition="absolute"
                  />
                </td>

                {/* Action Buttons */}
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 dark:text-gray-400 py-4"
                >
                  No users added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <button
        onClick={addRow}
        className="mt-4 flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
      >
        <Plus size={16} />
        <span>Add Row</span>
      </button>
    </div>
  );
};

export default VendorUsersTable;
