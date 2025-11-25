import {
  Users,
  Warehouse,
  Boxes,
  MapPin,
  GitBranch,
  Grid3x3,
  UserCheck,
  UserPlus,
  Package,
  ShoppingCart,
  Truck,
  Factory,
  AlertTriangle,
  Tag,
  Building2,
  IdCard,
  Scale,
  Layers,
  FileText,
  GitMerge,
  CalendarCheck,
  Globe,
  Map,
  Landmark,
  Coins,
  Flag,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const MastersList = () => {
  const navigate = useNavigate();

  const masters = [
   
    { name: "Item", icon: Package, path: "/item", color: "lime" },
    { name: "Buyer", icon: ShoppingCart, path: "/buyer", color: "amber" },
    { name: "Carrier", icon: Truck, path: "/carrier", color: "red" },
    { name: "Supplier", icon: Factory, path: "/supplier", color: "violet" },
    { name: "Unit", icon: Scale, path: "/unit", color: "green" },

    // ⬇️ NEW MASTERS ADDED HERE
   
  ];

  return (
    <div className=" max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Master Data
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-5">
        {masters.map((item) => {
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

export default MastersList;
