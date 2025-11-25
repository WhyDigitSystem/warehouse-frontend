import {
  FileSpreadsheet,
  Layers,
  ClipboardList,
  Archive,
  FileBarChart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ReportsList = () => {
  const navigate = useNavigate();

  const reports = [
    {
      name: "Stock Consolidation",
      icon: Layers,
      path: "/reports/stock-consolidation",
      color: "purple",
    },
    {
      name: "Stock Consolidation BinWise",
      icon: FileSpreadsheet,
      path: "/reports/stock-consolidation-binwise",
      color: "green",
    },
    {
      name: "Stock Ledger Report",
      icon: ClipboardList,
      path: "/reports/stock-ledger",
      color: "blue",
    },
    {
      name: "Stock Batch Wise Report",
      icon: Archive,
      path: "/reports/stock-batch-wise",
      color: "orange",
    },
    {
      name: "Stock Bin Batch Status Wise Report",
      icon: FileBarChart,
      path: "/reports/stock-bin-batch-status",
      color: "red",
    },
  ];

  return (
    <div className=" max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Reports
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5">
        {reports.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className="cursor-pointer group bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 p-4 rounded-2xl 
              shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div
                className={`p-3 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30
                text-${item.color}-600 dark:text-${item.color}-400 mb-3 inline-flex`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {item.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsList;
