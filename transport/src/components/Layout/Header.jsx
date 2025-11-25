import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { Navigate, useNavigate } from "react-router-dom";
import GlobalSelectionDropdown from "./GlobalParameter";

const Header = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm group"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>

          {/* <div className="relative">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Efit Transport
            </h1>
            <div className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div> */}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shipments, trips, or analytics..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">

  {/* Global Selection Dropdown */}
 <GlobalSelectionDropdown />

  {/* Theme Toggle */}
  <button
    onClick={toggleTheme}
    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group relative"
    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >
    {theme === "dark" ? (
      <Sun className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
    ) : (
      <Moon className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
    )}
  </button>

  {/* Notifications */}
  <button className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 relative group">
    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white dark:border-gray-900">
      3
    </span>
    <div className="absolute -bottom-12 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      <div className="p-4">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Notifications
        </div>
        <div className="text-xs text-gray-500">3 new notifications</div>
      </div>
    </div>
  </button>

  {/* User Profile */}
  <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3 group relative">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
        {user?.name?.charAt(0) || "U"}
      </div>

      <div className="hidden sm:block">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {user?.name || "User"}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Administrator
        </div>
      </div>

      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />

      {/* Dropdown Menu */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <button
            onClick={() => navigate("/settings/profile")}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>

      {/* Quick Stats Bar */}
      {/* <div className="flex items-center space-x-6 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">System Online</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Last sync: 2 minutes ago
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          12 active shipments
        </div>
      </div> */}
    </header>
  );
};

export default Header;
