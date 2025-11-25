import { clsx } from "clsx";
import Lottie from "lottie-react";
import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  LayoutDashboard,
  PackageCheck,
  PackagePlus,
  Wrench,
} from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import truckAnimation from "../../assets/lottieflow-ecommerce.json";

const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Masters", href: "/masters", icon: BookOpenCheck },
    { name: "Inbound", href: "/inbound", icon: PackagePlus },
    { name: "Outbound", href: "/outbound", icon: PackageCheck },
    { name: "VAS", href: "/vas", icon: Wrench },
    { name: "Stock Process", href: "/stock-process", icon: Boxes },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Setup", href: "/setup", icon: BarChart3 },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={clsx(
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 h-full",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <nav className="h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-4 mt-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md flex items-center justify-center">
            <Lottie animationData={truckAnimation} loop autoplay />
          </div>

          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 WMS
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Logistics Management
              </p>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex-1 p-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center transition-all duration-200 border group hover:shadow-sm",
                    isActive
                      ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
                    sidebarOpen
                      ? "px-3 py-2 rounded-lg"
                      : "px-1 py-1 rounded-full justify-center"
                  )
                }
              >
                <Icon className="h-5 w-5" />

                <span
                  className={clsx(
                    "transition-all duration-200",
                    sidebarOpen
                      ? "ml-3 opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Version */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              v1.0.0
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
