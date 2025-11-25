import React from "react";
import {
  PlusCircle,
  Download,
  Filter,
  RefreshCcw,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RfqListView = ({ setIsListView }) => {
  const navigate = useNavigate();

  // Temporary mock data
  const rfqData = []; // Replace this with API data later

  const summaryCards = [
    { title: "Total", value: 0, color: "text-gray-600", dot: "bg-gray-400" },
    { title: "Scheduled / Draft", value: "0 / 0", color: "text-blue-600", dot: "bg-blue-400" },
    { title: "Open / Closed", value: "0 / 0", color: "text-green-600", dot: "bg-green-400" },
    { title: "Terminated", value: 0, color: "text-red-600", dot: "bg-red-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          RFQ
        </h1>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition">
            <Download className="h-4 w-4" />
            Download Line Item Template
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition">
            <FileSpreadsheet className="h-4 w-4" />
            List View
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <RefreshCcw className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setIsListView(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
          >
            <PlusCircle className="h-4 w-4" />
            Add RFQ
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <div className={`h-2 w-2 rounded-full ${card.dot}`}></div>
            </div>
            <p className={`text-xl font-semibold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table / Empty State */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        {rfqData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m-2 8a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
            <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2">
              No RFQ found
            </h3>
            <button
              onClick={() => setIsListView(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow"
            >
              Create a new RFQ
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium border-b">ID</th>
                  <th className="px-4 py-2 text-left font-medium border-b">RFQ Name</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Contract Type</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Created On</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Status</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {rfqData.map((rfq) => (
                  <tr
                    key={rfq.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-2 border-b">{rfq.id}</td>
                    <td className="px-4 py-2 border-b">{rfq.name}</td>
                    <td className="px-4 py-2 border-b">{rfq.type}</td>
                    <td className="px-4 py-2 border-b">{rfq.createdOn}</td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          rfq.status === "Open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => navigate(`/rfq/${rfq.id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RfqListView;
