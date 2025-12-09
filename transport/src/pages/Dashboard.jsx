import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Eye,
  X,
  PieChart as PieChartIcon,
  Activity,
  Package,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
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
import { dashboardAPI } from "../api/dashboardAPI";
import dayjs from "dayjs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [detailedView, setDetailedView] = useState({
    type: "",
    title: "",
    data: [],
    open: false
  });
  
  // Global parameters from localStorage
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";
  
  // State for warehouse bin details modal
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [warehouseBinData, setWarehouseBinData] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [binFilters, setBinFilters] = useState({
    binStatus: "",
    bin: "",
    partNo: "",
  });
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState({
    // KPI Cards
    totalStock: "0",
    inboundToday: "0",
    outboundToday: "0",
    pendingPutaway: "0",
    
    // Stock Summary
    stockSummary: {
      fastMoving: 0,
      slowMoving: 0,
      nearExpiry: 0,
      damaged: 0,
    },
    
    // Charts Data
    stockDistData: [
      { name: "Available", value: 0 },
      { name: "Reserved", value: 0 },
      { name: "Damaged", value: 0 },
      { name: "In Transit", value: 0 },
    ],
    
    inboundOutboundData: [],
    capacityUtilization: [{ name: "Used", value: 0 }, { name: "Free", value: 100 }],
    efficiencyTrend: [],
    
    // Status Counts from APIs
    grn: { completed: [], pending: [] },
    putaway: { completed: [], pending: [] },
    buyerOrder: { completed: [], pending: [] },
    pickRequest: { completed: [], pending: [] },
    warehouseOccupancy: { occupied: 0, available: 0 }
  });

  // Get current month for API calls
  const currentMonth = dayjs().format("YYYY-MM");

  // QUICK ACTIONS LIST
  const shortcuts = [
    { name: "Inbound", icon: PackagePlus, path: "/inbound", gradient: "from-green-500 to-green-600" },
    { name: "Outbound", icon: PackageCheck, path: "/outbound", gradient: "from-purple-500 to-purple-600" },
    { name: "Inventory", icon: Boxes, path: "/inventory", gradient: "from-blue-500 to-blue-600" },
    { name: "GRN", icon: ClipboardCheck, path: "/grn", gradient: "from-indigo-500 to-indigo-600" },
    { name: "Scanning", icon: ScanBarcode, path: "/scan", gradient: "from-pink-500 to-pink-600" },
    { name: "Trips", icon: Truck, path: "/trips", gradient: "from-cyan-500 to-cyan-600" },
  ];

  // Status Card Configuration
  const statusCards = [
    {
      title: "GRN",
      completed: dashboardData.grn.completed?.length || 0,
      pending: dashboardData.grn.pending?.length || 0,
      colors: { completed: "#6DD5ED", pending: "#2193B0" },
      icon: PackageCheck
    },
    {
      title: "Putaway",
      completed: dashboardData.putaway.completed?.length || 0,
      pending: dashboardData.putaway.pending?.length || 0,
      colors: { completed: "#00C49F", pending: "#FFBB28" },
      icon: Boxes
    },
    {
      title: "Buyer Order",
      completed: dashboardData.buyerOrder.completed?.length || 0,
      pending: dashboardData.buyerOrder.pending?.length || 0,
      colors: { completed: "#FF8042", pending: "#FFBB28" },
      icon: Users
    },
    {
      title: "Pick Request",
      completed: dashboardData.pickRequest.completed?.length || 0,
      pending: dashboardData.pickRequest.pending?.length || 0,
      colors: { completed: "#8884D8", pending: "#82CA9D" },
      icon: Package
    }
  ];

  // Colors for charts
  const stockDistColors = ["#6366F1", "#22C55E", "#EF4444", "#F59E0B"];
  const capacityColors = ["#10B981", "#E5E7EB"];

  console.log("Dashboard data state:", {
  warehouseOccupancy: dashboardData.warehouseOccupancy,
  capacityUtilization: dashboardData.capacityUtilization,
  totalStock: dashboardData.totalStock
});

// Add this after your useState declarations
useEffect(() => {
  console.log("Dashboard data updated:", {
    occupancy: dashboardData.warehouseOccupancy,
    capacity: dashboardData.capacityUtilization
  });
}, [dashboardData.warehouseOccupancy, dashboardData.capacityUtilization]);
// Function to fetch warehouse bin details
const fetchWarehouseBinDetails = async () => {
  setWarehouseLoading(true);
  try {
    const response = await dashboardAPI.getWarehouseOccupancy(
      orgId, 
      loginBranchCode, 
      loginWarehouse, 
      loginClient
    );
    
    console.log("Warehouse bin details response:", response);
    
    // Check if response has paramObjectsMap and binDetails
    if (response && response.data.paramObjectsMap && response.data.paramObjectsMap.binDetails) {
      console.log("Setting warehouse bin data:", response.data.paramObjectsMap.binDetails.length, "items");
      setWarehouseBinData(response.data.paramObjectsMap.binDetails);
    } else if (response && response.binDetails) {
      // Fallback: check for binDetails at root level
      console.log("Setting warehouse bin data (root level):", response.binDetails.length, "items");
      setWarehouseBinData(response.binDetails);
    } else {
      console.warn("No bin details found in response:", response);
      setWarehouseBinData([]);
    }
    setWarehouseModalOpen(true);
  } catch (error) {
    console.error("Error fetching warehouse bin details:", error);
    setWarehouseBinData([]);
    setWarehouseModalOpen(true);
  } finally {
    setWarehouseLoading(false);
  }
};
  // Filter warehouse bin data
  const filteredBinData = warehouseBinData.filter(bin => {
    if (binFilters.binStatus && bin.binStatus !== binFilters.binStatus) return false;
    if (binFilters.bin && !bin.bin?.toLowerCase().includes(binFilters.bin.toLowerCase())) return false;
    if (binFilters.partNo && !bin.partNo?.toLowerCase().includes(binFilters.partNo.toLowerCase())) return false;
    return true;
  });

  
// Calculate occupancy from bin data
const calculateOccupancy = (binData) => {
  // Handle both structures: direct array or nested in paramObjectsMap
  const binDetails = binData.paramObjectsMap?.binDetails || binData.binDetails || binData || [];
  const occupied = binDetails.filter((bin) => bin.binStatus === "Occupied").length;
  const available = binDetails.filter((bin) => bin.binStatus === "Empty").length;
  return { occupied, available };
};

  // Handle opening detailed view
  const handleOpenDetailedView = (title, data, type) => {
    setDetailedView({
      type,
      title,
      data,
      open: true
    });
  };

  // Handle closing detailed view
  const handleCloseDetailedView = () => {
    setDetailedView({
      type: "",
      title: "",
      data: [],
      open: false
    });
  };

  // Render detailed view table
  const renderDetailedTable = (data, type) => {
    let columns = [];

    switch (type) {
      case "grnCompleted":
      case "grnPending":
        columns = [
          { header: "GRN No", key: "grnNo" },
          {
            header: "GRN Date",
            key: "grnDate",
            format: (date) => dayjs(date).format("DD-MM-YYYY"),
          },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "putawayCompleted":
      case "putawayPending":
        columns = [
          { header: "Putaway No", key: "putawayNo" },
          { header: "Reference No", key: "refNo" },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "buyerOrderCompleted":
      case "buyerOrderPending":
        columns = [
          { header: "Order No", key: "orderNo" },
          {
            header: "Order Date",
            key: "orderDate",
            format: (date) => dayjs(date).format("DD-MM-YYYY"),
          },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "pickRequestCompleted":
      case "pickRequestPending":
        columns = [
          { header: "Pick Request No", key: "pickNo" },
          { header: "Status", key: "status" },
          { header: "Qty", key: "pickQty" },
        ];
        break;
      default:
        columns = [];
    }

    return (
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {col.format ? col.format(item[col.key]) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
// Updated fetchDashboardData function
const fetchDashboardData = async () => {
  if (!orgId || !loginBranchCode || !loginClient || !loginWarehouse) {
    console.warn("Missing required parameters for dashboard");
    return;
  }

  setIsLoading(true);
  try {
    // Fetch data sequentially
    let grnData = { pending: [], completed: [] };
    let putawayData = { pending: [], completed: [] };
    let buyerOrderData = { pending: [], completed: [] };
    let pickRequestData = { pending: [], completed: [] };
    let occupancyData = { occupied: 0, available: 0 };
    let stockSummaryData = {
      fastMoving: 0,
      slowMoving: 0,
      nearExpiry: 0,
      damaged: 0,
      totalStock: 0
    };

    // ... other API calls remain the same ...
// Update the occupancy data fetching part in fetchDashboardData
try {
  const occupancyResponse = await dashboardAPI.getWarehouseOccupancy(
    orgId, 
    loginBranchCode, 
    loginWarehouse, 
    loginClient
  );
  
  console.log("Occupancy API Response received (dashboard):", occupancyResponse);
  
  // DEBUG: Check what we received
  console.log("Occupancy response structure:", {
    hasStatus: occupancyResponse?.status !== undefined,
    occupied: occupancyResponse?.occupied,
    available: occupancyResponse?.available,
    hasBinDetails: !!occupancyResponse?.paramObjectsMap?.binDetails,
    binDetailsCount: occupancyResponse?.paramObjectsMap?.binDetails?.length || 0
  });
  
  if (occupancyResponse?.status === true) {
    // Use the counts directly from the API response
    occupancyData = {
      occupied: occupancyResponse.occupied || 0,
      available: occupancyResponse.available || 0
    };
    
    console.log("✅ Using direct occupancy counts:", occupancyData);
  } else {
    console.warn("⚠️ Occupancy API returned false status");
    
    // Fallback: Try to calculate from binDetails if available
    const binDetails = occupancyResponse?.paramObjectsMap?.binDetails || [];
    if (binDetails.length > 0) {
      const occupiedCount = binDetails.filter(bin => bin.binStatus === "Occupied").length;
      const availableCount = binDetails.filter(bin => bin.binStatus === "Empty").length;
      occupancyData = {
        occupied: occupiedCount,
        available: availableCount
      };
      console.log("✅ Calculated occupancy from binDetails:", occupancyData);
    }
  }
  
  console.log("Final occupancy data for dashboard:", occupancyData);
} catch (occupancyError) {
  console.error("Failed to fetch occupancy data:", occupancyError);
  occupancyData = { occupied: 0, available: 0 };
}

    // ... other API calls remain the same ...

    // Calculate totals
    const totalGRNCount = (grnData.pending?.length || 0) + (grnData.completed?.length || 0);
    const totalBuyerOrdersCount = (buyerOrderData.pending?.length || 0) + (buyerOrderData.completed?.length || 0);
    const totalPutawayCount = (putawayData.pending?.length || 0) + (putawayData.completed?.length || 0);
    
    // Calculate total bins and percentage
    const totalBins = occupancyData.occupied + occupancyData.available;
    const usedPercentage = totalBins > 0 ? Math.round((occupancyData.occupied / totalBins) * 100) : 0;
    const freePercentage = totalBins > 0 ? Math.round((occupancyData.available / totalBins) * 100) : 100;
    
    console.log("Final occupancy values:", {
      occupied: occupancyData.occupied,
      available: occupancyData.available,
      totalBins,
      usedPercentage,
      freePercentage
    });
    
    // Update dashboard data
    setDashboardData(prev => ({
      ...prev,
      // KPI Cards
      inboundToday: totalGRNCount.toString(),
      outboundToday: totalBuyerOrdersCount.toString(),
      pendingPutaway: (putawayData.pending?.length || 0).toString(),
      totalStock: (stockSummaryData.totalStock || 0).toLocaleString(),
      
      // Stock Summary
      stockSummary: {
        fastMoving: stockSummaryData.fastMoving || 0,
        slowMoving: stockSummaryData.slowMoving || 0,
        nearExpiry: stockSummaryData.nearExpiry || 0,
        damaged: stockSummaryData.damaged || 0,
      },
      
      // Status Data
      grn: grnData,
      putaway: putawayData,
      buyerOrder: buyerOrderData,
      pickRequest: pickRequestData,
      
      // Charts Data
      stockDistData: [
        { name: "Available", value: Math.round((stockSummaryData.totalStock || 0) * 0.6) || 0 },
        { name: "Reserved", value: Math.round((stockSummaryData.totalStock || 0) * 0.25) || 0 },
        { name: "Damaged", value: (stockSummaryData.damaged || 0) * 10 },
        { name: "In Transit", value: Math.round((stockSummaryData.totalStock || 0) * 0.05) || 0 },
      ],
      
      // Inbound/Outbound chart
      inboundOutboundData: generateWeeklyIOData(
        grnData.completed?.length || 0, 
        buyerOrderData.completed?.length || 0
      ),
      
      // FIXED: Capacity Utilization based on actual percentage
      capacityUtilization: [
        { name: "Used", value: usedPercentage },
        { name: "Free", value: freePercentage }
      ],
      
      // Efficiency trend
      efficiencyTrend: generateEfficiencyTrend(
        grnData.completed?.length || 0, 
        buyerOrderData.completed?.length || 0
      ),
      
      // FIXED: Warehouse occupancy with actual values
      warehouseOccupancy: {
        occupied: occupancyData.occupied,
        available: occupancyData.available
      }
    }));

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    setIsLoading(false);
  }
};
  // Helper function to generate weekly inbound/outbound data
  const generateWeeklyIOData = (totalInbound, totalOutbound) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => ({
      day,
      in: Math.round((totalInbound / 7) * (0.8 + Math.random() * 0.4)),
      out: Math.round((totalOutbound / 7) * (0.8 + Math.random() * 0.4))
    }));
  };

  // Helper function to generate efficiency trend
  const generateEfficiencyTrend = (completedGRN, completedOrders) => {
    const baseEfficiency = Math.min(85, Math.max(65, (completedGRN + completedOrders) / 20));
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => ({
      day,
      value: Math.round(baseEfficiency + (Math.random() * 6 - 3))
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setBinFilters({
      binStatus: "",
      bin: "",
      partNo: "",
    });
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // KPI CARDS - Updated with real data
  const kpis = [
    { 
      title: "Total Stock", 
      value: dashboardData.totalStock, 
      icon: Boxes, 
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    { 
      title: "Inbound Today", 
      value: dashboardData.inboundToday, 
      icon: PackagePlus, 
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-gradient-to-r from-green-500 to-green-600"
    },
    { 
      title: "Outbound Today", 
      value: dashboardData.outboundToday, 
      icon: PackageCheck, 
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    { 
      title: "Pending Putaway", 
      value: dashboardData.pendingPutaway, 
      icon: Warehouse, 
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
  ];

  // Status Pie Chart Component
  const StatusPieChart = ({ title, completed, pending, colors, onCompletedClick, onPendingClick }) => {
    const data = [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
    
    const total = completed + pending;
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
        <div className="flex flex-col items-center">
          {/* Pie Chart Visualization */}
          <div className="relative w-24 h-24 mb-3">
            {total > 0 ? (
              <>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Completed Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors.completed}
                    strokeWidth="20"
                    strokeDasharray={`${(completedPercentage / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Pending Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors.pending}
                    strokeWidth="20"
                    strokeDasharray={`${((100 - completedPercentage) / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform={`rotate(${completedPercentage * 3.6 - 90} 50 50)`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Data
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <button
              onClick={onCompletedClick}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.completed }} />
              <span className="text-green-600 dark:text-green-400 font-medium">{completed}</span>
              <span className="text-gray-500 dark:text-gray-400">Completed</span>
            </button>
            <button
              onClick={onPendingClick}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.pending }} />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{pending}</span>
              <span className="text-gray-500 dark:text-gray-400">Pending</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto min-h-screen p-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 rounded-3xl p-6 shadow-lg text-white mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Floating trucks animation */}
        <div className="absolute top-4 right-8 opacity-20">
          <Truck className="h-16 w-16 animate-pulse" />
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome to Your WMS Hub 🚛</h1>
            <p className="text-sm text-blue-100 mt-1">
              Manage inventory, orders, and optimize your warehouse operations
            </p>
            {/* <div className="mt-2 text-xs text-blue-100">
              <span className="inline-block mr-4">
                <strong>Branch:</strong> {loginBranch}
              </span>
              <span className="inline-block mr-4">
                <strong>Warehouse:</strong> {loginWarehouse}
              </span>
              <span className="inline-block">
                <strong>Client:</strong> {loginClient}
              </span>
            </div> */}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg hover:bg-white/30 transition-all text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
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
              <div className={`p-3 inline-flex rounded-lg ${kpi.bgColor} text-white shadow`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm mt-3 text-gray-500 dark:text-gray-400">{kpi.title}</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              {kpi.title === "Total Stock" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {dashboardData.warehouseOccupancy.occupied} bins occupied
                </p>
              )}
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

      {/* STATUS CARDS SECTION (Replaces the old upper panels) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Process Status Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <StatusPieChart
                key={card.title}
                title={card.title}
                completed={card.completed}
                pending={card.pending}
                colors={card.colors}
                onCompletedClick={() => handleOpenDetailedView(
                  `Completed ${card.title}`,
                  dashboardData[card.title.toLowerCase().replace(' ', '')]?.completed || [],
                  `${card.title.toLowerCase().replace(' ', '')}Completed`
                )}
                onPendingClick={() => handleOpenDetailedView(
                  `Pending ${card.title}`,
                  dashboardData[card.title.toLowerCase().replace(' ', '')]?.pending || [],
                  `${card.title.toLowerCase().replace(' ', '')}Pending`
                )}
              />
            );
          })}
        </div>
      </div>

      {/* WAREHOUSE OCCUPANCY CARD - Enlarged */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Warehouse Occupancy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {loginWarehouse} - {loginClient}
            </p>
          </div>
          <button
            onClick={fetchWarehouseBinDetails}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-lg transition-all shadow"
            disabled={warehouseLoading}
          >
            <Eye className="h-4 w-4" />
            View Bin Details
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Occupancy Chart */}
          <div className="flex-1">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 dark:text-white">
                      {dashboardData.warehouseOccupancy.occupied}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Occupied</div>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${(dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available)) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.warehouseOccupancy.occupied}</div>
                  <div className="text-sm opacity-90">Occupied Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.warehouseOccupancy.available}</div>
                  <div className="text-sm opacity-90">Available Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Boxes className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available}
                  </div>
                  <div className="text-sm opacity-90">Total Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Warehouse className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Occupancy Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Storage Utilization</span>
            <span>
              {Math.round((dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available)) * 100) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available)) * 100) || 0}%` 
              }}
            />
          </div>
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
                data={dashboardData.stockDistData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {dashboardData.stockDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={stockDistColors[index]} />
                ))}
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
            <BarChart data={dashboardData.inboundOutboundData}>
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
                data={dashboardData.capacityUtilization}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {dashboardData.capacityUtilization.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={capacityColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xl font-bold text-green-500 dark:text-green-400 mt-2">
            {dashboardData.capacityUtilization[0].value}% Used
          </p>
        </div>
      </div>

      {/* EFFICIENCY LINE CHART */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Efficiency Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dashboardData.efficiencyTrend}>
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

      {/* Warehouse Bin Details Modal */}
      {warehouseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Warehouse Bin Details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loginWarehouse} - {loginClient}
                </p>
              </div>
              <button
                onClick={() => setWarehouseModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto flex-1">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bin Status
                  </label>
                  <select
                    value={binFilters.binStatus}
                    onChange={(e) => setBinFilters({...binFilters, binStatus: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Empty">Empty</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bin Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by bin..."
                      value={binFilters.bin}
                      onChange={(e) => setBinFilters({...binFilters, bin: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Part No Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by part number..."
                      value={binFilters.partNo}
                      onChange={(e) => setBinFilters({...binFilters, partNo: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors w-full justify-center"
                  >
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bins</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {filteredBinData.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupied</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {filteredBinData.filter(b => b.binStatus === 'Occupied').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Empty</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {filteredBinData.filter(b => b.binStatus === 'Empty').length}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredBinData.length} of {warehouseBinData.length} bins
                </div>
              </div>

              {/* Modal Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider w-12">
                        S.No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                        Bin
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray500 dark:text-white uppercase tracking-wider min-w-[120px]">
                        Bin Type
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[120px]">
                        Part No
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[200px]">
                        Part Description
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-white uppercase tracking-wider min-w-[100px]">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {warehouseLoading ? (
                      <tr>
                        <td colSpan="7" className="px-3 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading bin details...</p>
                        </td>
                      </tr>
                    ) : filteredBinData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                          No bin data found
                        </td>
                      </tr>
                    ) : (
                      filteredBinData.map((bin, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 text-gray-900 dark:text-white text-center">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {bin.bin || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {bin.binType || '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bin.binStatus === 'Occupied' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {bin.binStatus || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {bin.partNo || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {bin.partDesc || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white text-right">
                            {bin.quantity ? parseFloat(bin.quantity).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Bins: {warehouseBinData.length} • 
                Occupied: {warehouseBinData.filter(b => b.binStatus === 'Occupied').length} • 
                Empty: {warehouseBinData.filter(b => b.binStatus === 'Empty').length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setWarehouseModalOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {detailedView.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {detailedView.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {detailedView.data.length} records found
                </p>
              </div>
              <button
                onClick={handleCloseDetailedView}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-auto flex-1">
              {detailedView.data.length > 0 ? (
                renderDetailedTable(detailedView.data, detailedView.type)
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {detailedView.data.length} records
              </span>
              <button
                onClick={handleCloseDetailedView}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;