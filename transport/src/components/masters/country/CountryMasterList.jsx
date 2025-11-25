import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { masterAPI } from "../../../api/customerAPI";

const CountryMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const ORG_ID = 1000000001;

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await masterAPI.getCountries(ORG_ID);
      setList(response);
    } catch (e) {
      console.error("Failed to load countries", e);
    }
  };

  // Calculate pagination values
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = list.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Items per page options
  const pageSizeOptions = [5, 10, 20, 50];

  return (
    <div className="p-4 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300"
            onClick={onBack}
          />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Country Master
          </h1>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto max-w-4xl">
        <table className="w-full text-sm table-auto min-w-[700px]">
          <thead className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-2 text-left w-14">S.No</th>
              <th className="p-2 text-left w-32">Code</th>
              <th className="p-2 text-left w-48">Country</th>
              <th className="p-2 text-left w-24">Active</th>
              <th className="p-2 text-center w-20">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((row, i) => (
              <tr
                key={i}
                className="border-t border-gray-200 dark:border-gray-700 
                bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <td className="p-2">{startIndex + i + 1}</td>

                <td className="p-2">{row.countryCode}</td>
                <td className="p-2">{row.countryName}</td>

                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                      row.active === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {row.active}
                  </span>
                </td>

                <td className="p-2 flex justify-center">
                  <Pencil
                    className="h-4 w-4 text-blue-500 cursor-pointer"
                    onClick={() => onEdit(row)}
                  />
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {list.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3 p-2">
          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          {/* Page info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
              bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
                  text-sm min-w-[40px] ${
                    currentPage === pageNum
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
              bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryMasterList;