import {
  FileText,
  PackageSearch,
  RotateCcw,
  ClipboardList,
  Truck,
  Undo2,
  Files,
  PackagePlus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const OutboundMenu = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Order Processing",
      color: "blue",
      items: [
        { name: "Buyer Order", icon: FileText, path: "/outbound/buyer-order" },
        { name: "Pick Request", icon: PackageSearch, path: "/outbound/pick-request" },
        { name: "Reverse Pick", icon: RotateCcw, path: "/outbound/reverse-pick" },
      ],
    },
    {
      title: "Delivery & Returns",
      color: "green",
      items: [
        { name: "WMS Delivery Challan", icon: ClipboardList, path: "/outbound/wms-delivery-challan" },
        { name: "Delivery Challan", icon: Truck, path: "/outbound/delivery-challan" },
        { name: "Sales Return", icon: Undo2, path: "/outbound/sales-return" },
      ],
    },
  ];

  const multipleOrders = {
    title: "Multiple Orders",
    color: "purple",
    items: [
      { name: "Multiple Buyer Order", icon: Files, path: "/outbound/multi-buyer-order" },
      { name: "Multiple Pick Request", icon: PackagePlus, path: "/outbound/multi-pick-request" },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Outbound
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Manage all outbound operations efficiently.
      </p>

      {/* Two sections side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>

            {/* Masters-style card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                  >
                    <div
                      className={`
                        p-3 rounded-xl 
                        bg-${section.color}-100 dark:bg-${section.color}-900/30 
                        text-${section.color}-600 dark:text-${section.color}-400 
                        mb-3 inline-flex
                      `}
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
        ))}
      </div>

      {/* Multiple Orders in full width below */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {multipleOrders.title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5">
          {multipleOrders.items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                className="cursor-pointer group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div
                  className={`
                    p-3 rounded-xl 
                    bg-${multipleOrders.color}-100 
                    dark:bg-${multipleOrders.color}-900/30 
                    text-${multipleOrders.color}-600 
                    dark:text-${multipleOrders.color}-400 
                    mb-3 inline-flex
                  `}
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

    </div>
  );
};

export default OutboundMenu;
