import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardCheck,
  Filter,
  PackageCheck,
  PackagePlus,
  ScanBarcode,
  Truck,
  Warehouse,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // KPI CARDS
  const kpis = [
    { title: "Total Stock", value: "18,240", icon: Boxes, gradient: "from-blue-500 to-blue-600" },
    { title: "Inbound Today", value: "92", icon: PackagePlus, gradient: "from-green-500 to-green-600" },
    { title: "Outbound Today", value: "78", icon: PackageCheck, gradient: "from-purple-500 to-purple-600" },
    { title: "Pending Putaway", value: "34", icon: Warehouse, gradient: "from-amber-500 to-orange-500" },
  ];

  // QUICK ACTIONS LIST
  const shortcuts = [
    { name: "Inbound", icon: PackagePlus, path: "/inbound", gradient: "from-green-500 to-green-600" },
    { name: "Outbound", icon: PackageCheck, path: "/outbound", gradient: "from-purple-500 to-purple-600" },
    { name: "Inventory", icon: Boxes, path: "/inventory", gradient: "from-blue-500 to-blue-600" },
    { name: "GRN", icon: ClipboardCheck, path: "/grn", gradient: "from-indigo-500 to-indigo-600" },
    { name: "Scanning", icon: ScanBarcode, path: "/scan", gradient: "from-pink-500 to-pink-600" },
    { name: "Trips", icon: Truck, path: "/trips", gradient: "from-cyan-500 to-cyan-600" },
  ];

  // STOCK DISTRIBUTION PIE DATA
  const stockDistData = [
    { name: "Available", value: 7200 },
    { name: "Reserved", value: 3400 },
    { name: "Damaged", value: 600 },
    { name: "In Transit", value: 900 },
  ];

  // INBOUND OUTBOUND BAR CHART
  const ioChartData = [
    { day: "Mon", in: 45, out: 38 },
    { day: "Tue", in: 60, out: 42 },
    { day: "Wed", in: 52, out: 48 },
    { day: "Thu", in: 70, out: 60 },
    { day: "Fri", in: 68, out: 55 },
    { day: "Sat", in: 40, out: 35 },
    { day: "Sun", in: 30, out: 22 },
  ];

  // EFFICIENCY LINE CHART
  const efficiencyData = [
    { day: "Mon", value: 68 },
    { day: "Tue", value: 72 },
    { day: "Wed", value: 70 },
    { day: "Thu", value: 75 },
    { day: "Fri", value: 78 },
    { day: "Sat", value: 74 },
    { day: "Sun", value: 69 },
  ];

  // CAPACITY UTILIZATION CHART
  const capacityUtil = [
    { name: "Used", value: 78 },
    { name: "Free", value: 22 },
  ];

  const capacityColors = ["#10B981", "#E5E7EB"]; // green + gray

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      
       <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-4 shadow-lg text-white mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Warehouse Dashboard 👋</h1>
            <p className="text-sm text-blue-100">
              Overview of your WMS operations at a glance
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg hover:bg-white/30 transition-all text-sm text-white">
            <Filter className="h-4 w-4" /> Filter View
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className={`p-3 inline-flex rounded-lg bg-gradient-to-r ${kpi.gradient} text-white shadow`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm mt-3 text-gray-500 dark:text-gray-400">{kpi.title}</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                className="cursor-pointer rounded-xl relative overflow-hidden p-4 shadow-sm
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    hover:shadow-md hover:-translate-y-1 transition"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10`} />

                <div className="relative flex flex-col items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UPPER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* STOCK SUMMARY */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Stock Summary</h3>

          <ul className="space-y-3">
            {[
              { label: "Fast Moving Items", value: "624" },
              { label: "Slow Moving Items", value: "148" },
              { label: "Near Expiry", value: "37" },
              { label: "Damaged Stock", value: "12" },
            ].map((item) => (
              <li key={item.label} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                {item.label}
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>

          <div className="space-y-4">
            {["GRN #456 completed", "Shipment #982 dispatched", "Cycle count scheduled", "Putaway completed (12 bins)"].map(
              (activity, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                  {activity}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )
            )}
          </div>
        </div>

        {/* PERFORMANCE OVERVIEW */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Performance Overview</h3>
          <BarChart3 className="h-40 w-full text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            * Static preview — Live charts below
          </p>
        </div>
      </div>

      {/* FULL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* STOCK DISTRIBUTION PIE CHART */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Stock Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stockDistData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#6366F1" /> {/* Purple */}
                <Cell fill="#22C55E" /> {/* Green */}
                <Cell fill="#EF4444" /> {/* Red */}
                <Cell fill="#F59E0B" /> {/* Yellow */}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* INBOUND VS OUTBOUND BAR CHART */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Inbound vs Outbound (Last 7 Days)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ioChartData}>
              <XAxis dataKey="day" stroke="#A1A1AA" />
              <YAxis stroke="#A1A1AA" />
              <Tooltip />
              <Bar dataKey="in" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CAPACITY UTILIZATION DONUT CHART */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Capacity Utilization
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={capacityUtil}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {capacityUtil.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={capacityColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <p className="text-center text-xl font-bold text-green-500 dark:text-green-400 mt-2">
            78% Used
          </p>
        </div>
      </div>

      {/* EFFICIENCY LINE CHART */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Efficiency Trend
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={efficiencyData}>
            <XAxis dataKey="day" stroke="#A1A1AA" />
            <YAxis stroke="#A1A1AA" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F97316"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
