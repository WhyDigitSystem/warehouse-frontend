import {
  AlertTriangle,
  Boxes,
  Building2,
  CalendarCheck,
  Coins,
  FileText,
  Flag,
  GitBranch,
  GitMerge,
  Globe,
  Grid3x3,
  IdCard,
  Landmark,
  Layers,
  Map,
  MapPin,
  Tag,
  UserCheck,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Setup = () => {
  const navigate = useNavigate();

  const masters = [
    { name: "Country", icon: Globe, path: "/country", color: "green" },
    { name: "State", icon: Map, path: "/state", color: "orange" },
    { name: "City", icon: Landmark, path: "/city", color: "sky" },
    { name: "Currency", icon: Coins, path: "/currency", color: "purple" },
    { name: "Region", icon: Flag, path: "/region", color: "red" },
    { name: "Customer", icon: Users, path: "/customer", color: "blue" },
    { name: "Warehouse", icon: Warehouse, path: "/warehouse", color: "purple" },
    { name: "Bin Type", icon: Boxes, path: "/bin-type", color: "green" },
    {
      name: "Warehouse Location",
      icon: MapPin,
      path: "/warehouse-location",
      color: "indigo",
    },
    {
      name: "Location Mapping",
      icon: GitBranch,
      path: "/location-mapping",
      color: "orange",
    },
    { name: "Cell Type", icon: Grid3x3, path: "/cell-type", color: "teal" },
    { name: "Employee", icon: UserCheck, path: "/employee", color: "cyan" },
    { name: "User Creation", icon: UserPlus, path: "/user", color: "pink" },
    {
      name: "External Data Mismatch",
      icon: AlertTriangle,
      path: "/external-data-mismatch",
      color: "rose",
    },
    {
      name: "Material Label Mapping",
      icon: Tag,
      path: "/material-label-mapping",
      color: "emerald",
    },
    {
      name: "Department",
      icon: Building2,
      path: "/department",
      color: "fuchsia",
    },
    { name: "Designation", icon: IdCard, path: "/designation", color: "blue" },
    { name: "Group", icon: Layers, path: "/group", color: "yellow" },
    {
      name: "Document Type",
      icon: FileText,
      path: "/document-type",
      color: "slate",
    },
    {
      name: "Document Type Mapping",
      icon: GitMerge,
      path: "/document-type-mapping",
      color: "sky",
    },
    {
      name: "Financial Year",
      icon: CalendarCheck,
      path: "/financial-year",
      color: "indigo",
    },

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

export default Setup;
