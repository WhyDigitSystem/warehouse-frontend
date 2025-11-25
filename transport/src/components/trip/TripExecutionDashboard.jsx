import {
  Truck,
  Activity,
  Clock4,
  AlertCircle,
  Navigation,
  BarChart3,
  Map,
  FileText,
  Filter,
  MoreHorizontal,
  Users,
  Settings,
  PlusCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TripExecutionDashboard = () => {
  // Mock Stats
  const tripStats = [
    { title: "Total Trips", value: 120, color: "text-blue-500", icon: Truck },
    { title: "Online Trips", value: 85, color: "text-green-500", icon: Activity },
    { title: "Delayed Trips", value: 5, color: "text-red-500", icon: Clock4 },
    { title: "Consent Pending", value: 3, color: "text-amber-500", icon: AlertCircle },
  ];

  // Quick Links
  const quickLinks = [
    {
      category: "Trips",
      icon: Truck,
      items: ["Trips", "Trip Reports", "Trip Analysis", "Trip Alerts"],
    },
    {
      category: "Vehicles",
      icon: Users,
      items: ["Vehicle", "Driver"],
    },
    {
      category: "Config",
      icon: Settings,
      items: ["Vehicle Type", "Routes"],
    },
    {
      category: "Reports",
      icon: FileText,
      items: ["Trip MIS Report", "Internal Tickets"],
    },
  ];

  // Chart Data
  const tripData = [
    { date: "01-Nov", value: 10 },
    { date: "03-Nov", value: 25 },
    { date: "05-Nov", value: 40 },
    { date: "07-Nov", value: 60 },
    { date: "09-Nov", value: 75 },
    { date: "11-Nov", value: 55 },
    { date: "13-Nov", value: 80 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🚛 Trip Executions
          </h1>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-all">
            <PlusCircle className="h-4 w-4" /> Create Workspace
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {tripStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Shortcuts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Trip Dashboard", "Trip Report MIS", "Trip Analysis", "Control Tower"].map(
            (item, i) => (
              <button
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40 flex items-center justify-between transition"
              >
                {item} <Navigation className="h-4 w-4 text-gray-400" />
              </button>
            )
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickLinks.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.category}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.category}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trip Volume Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Trip Volume
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <Filter className="h-4 w-4" /> Last Month
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripExecutionDashboard;
