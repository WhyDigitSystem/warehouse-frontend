import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import AuctionDashboard from "./components/Auction/AuctionDashboard";
import LoginForm from "./components/Auth/LoginForm";
import InboundMenu from "./components/inbound/InboundMenu";
import Layout from "./components/Layout/Layout";
import CountryMaster from "./components/masters/country/CountryMaster";
import CustomerMasterPage from "./components/masters/customer/CustomerMaster";
import MastersList from "./components/masters/MasterList";
import Setup from "./components/masters/Setup";
import OutboundMenu from "./components/outbound/OutboundList";
import ReportsList from "./components/reports/ReportList";
import ProfileSettings from "./components/settings/Profile";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import UserManagement from "./components/settings/UserManagement";
import StockProcessList from "./components/stock-process/StockProcessList";
import TripExecutionDashboard from "./components/trip/TripExecutionDashboard";
import VASList from "./components/VAS/VASList";
import CustomerBookingRequest from "./pages/CustomerBookingRequest";
import Dashboard from "./pages/Dashboard";
import Driver from "./pages/Driver";
import Indent from "./pages/Indent";
import Invoice from "./pages/Invoice";
import Payouts from "./pages/Payouts";
import RFQ from "./pages/RFQ";
import RoutePage from "./pages/RoutePage";
import Trip from "./pages/Trip";
import Vehicle from "./pages/Vehicle";
import Vendor from "./pages/Vendor";
import VendorRate from "./pages/VendorRate";
import { store } from "./store";
import "./styles/globals.css";
import ChatWidget from "./utils/ChatWidget";
import ItemMaster from "./components/masters/item/ItemMaster";
import BuyerMasterPage from "./components/masters/buyer/Buyer";
import CarrierMasterPage from "./components/masters/carrier/CarrierMaster";
import { ToastProvider } from "./components/Toast/ToastContext";
import SupplierMaster from "./components/masters/supplier/SupplierMaster";
import UnitMaster from "./components/masters/unit/UnirMaster";
import StateMaster from "./components/masters/state/StateMaster";
import GatePassInPage from "./components/inbound/GatePassin/Gatepassin";
import CityMaster from "./components/masters/city/CityMaster";
import WarehouseMaster from "./components/masters/warehouse/warehouseMaster";
import User from "./components/masters/user/User";
import EmployeeMasterPage from "./components/masters/employee/EmployeeMaster";
import WarehouseLocation from "./components/masters/warehouselocation/WarehouseLocationMaster";
import GRNPage from "./components/inbound/GRN/GRN";
import Putaway from "./components/inbound/Putaway/Putaway";
import BuyerOrderPage from "./components/outbound/BuyerOrder/BuyerOrder";
import PickRequestForm from "./components/outbound/PickRequest/PickRequestForm";
import PickRequestPage from "./components/outbound/PickRequest/PickRequest";
import MultiBuyerOrder from "./components/outbound/MuliBO/MultiBuyerOrder";
import MultiPickRequestPage from "./components/outbound/MultiPR/MultiPickRequest";
import ReversePickPage from "./components/outbound/ReversePick/ReversePick";
import DeliveryChallanPage from "./components/outbound/DeliveryChallan/DeliveryChallan";
import LocationMovementPage from "./components/stock-process/LocationMovement/LocationMovement";
import StockRestatePage from "./components/stock-process/StockRestate/StockRestate";
import CodeConversionPage from "./components/stock-process/CodeConversion/CodeConversion";
import CycleCountPage from "./components/stock-process/CycleCount/CycleCount";
import OpeningStockPage from "./components/stock-process/OpeningStock/OpeningStock";
import StockConsolidation from "./components/reports/StockReports/StockConsolidation";
import StockConsolidationBinWise from "./components/reports/StockReports/StockConsolidationBinWise";
import StockLedger from "./components/reports/StockReports/StockLedger";
import StockBatchWise from "./components/reports/StockReports/StockBatchWise";
import StockBinBatchStatusWise from "./components/reports/StockReports/StockBinBatch";
import KittingPage from "./components/stock-process/Kitting/Kitting";
import DeKittingPage from "./components/stock-process/DeKitting/Dekitting";
import VasPickPage from "./components/stock-process/VAS Pick/VASPick";
import VasPutawayPage from "./components/stock-process/VAS Putaway/VASPutaway";

// Theme initializer component
const ThemeInitializer = () => {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/" />;
};

const AppContent = () => {
  return (
    <>
      <ThemeInitializer />
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/vendor" element={<Vendor />} />
                      {/* <Route path="/customer" element={<Customer />} /> */}
                      <Route path="/route" element={<RoutePage />} />
                      <Route path="/trip" element={<Trip />} />
                      <Route path="/vehicle" element={<Vehicle />} />
                      <Route path="/driver" element={<Driver />} />
                      <Route path="/auction" element={<AuctionDashboard />} />
                      <Route
                        path="/trip-execution"
                        element={<TripExecutionDashboard />}
                      />
                      <Route path="/indents" element={<Indent />} />
                      <Route path="/vendor-invoice" element={<Invoice />} />
                      <Route path="/vendor-rate" element={<VendorRate />} />
                      <Route
                        path="/booking-request"
                        element={<CustomerBookingRequest />}
                      />
                      <Route path="/payouts" element={<Payouts />} />
                      <Route
                        path="/calendar"
                        element={<div className="p-6">Calendar Page</div>}
                      />
                      <Route path="/rfq" element={<RFQ />} />
                      <Route path="/settings" element={<SettingsDashboard />} />
                      <Route
                        path="/settings/users"
                        element={<UserManagement />}
                      />
                      <Route
                        path="/settings/profile"
                        element={<ProfileSettings />}
                      />
                      {/* WMS Routes */}
                      <Route path="/masters" element={<MastersList />} />
                      <Route path="/inbound" element={<InboundMenu />} />
                      <Route path="/outbound" element={<OutboundMenu />} />
                      <Route
                        path="/customer"
                        element={<CustomerMasterPage />}
                      />
                      <Route path="/carrier" element={<CarrierMasterPage />} />
                      <Route path="/country" element={<CountryMaster />} />

                      <Route path="/vas" element={<VASList />} />
                      <Route
                        path="/stock-process"
                        element={<StockProcessList />}
                      />
                      <Route path="/reports" element={<ReportsList />} />
                      <Route path="/setup" element={<Setup />} />

                      <Route path="/item" element={<ItemMaster />} />
                      <Route path="/buyer" element={<BuyerMasterPage />} />

                      <Route path="/supplier" element={<SupplierMaster />} />
                      <Route path="/unit" element={<UnitMaster />} />

                      <Route path="/state" element={<StateMaster />} />

                      <Route path="/city" element={<CityMaster />} />

                      <Route
                        path="/warehouse-location"
                        element={<WarehouseLocation />}
                      />
                      <Route path="/inbound/grn" element={<GRNPage />} />
                      <Route path="/inbound/putaway" element={<Putaway />} />
                      <Route
                        path="/outbound/buyer-order"
                        element={<BuyerOrderPage />}
                      />

                      <Route
                        path="/outbound/multi-buyer-order"
                        element={<MultiBuyerOrder />}
                      />

                      <Route
                        path="/outbound/multi-pick-request"
                        element={<MultiPickRequestPage />}
                      />
                      <Route
                        path="/outbound/pick-request"
                        element={<PickRequestPage />}
                      />

                      <Route
                        path="/outbound/reverse-pick"
                        element={<ReversePickPage />}
                      />

                      <Route
                        path="/outbound/delivery-challan"
                        element={<DeliveryChallanPage />}
                      />

                      <Route
                        path="/stock/location-movement"
                        element={<LocationMovementPage />}
                      />

                      <Route
                        path="/stock/stock-restate"
                        element={<StockRestatePage />}
                      />

                      <Route
                        path="/stock/code-conversion"
                        element={<CodeConversionPage />}
                      />

                      <Route
                        path="/stock/cycle-count"
                        element={<CycleCountPage />}
                      />

                      <Route
                        path="/stock/opening-stock"
                        element={<OpeningStockPage />}
                      />

                      <Route
                        path="/reports/stock-consolidation"
                        element={<StockConsolidation />}
                      />
                      <Route
                        path="/reports/stock-consolidation-binwise"
                        element={<StockConsolidationBinWise />}
                      />

                      <Route
                        path="/reports/stock-batch-wise"
                        element={<StockBatchWise />}
                      />

                      <Route
                        path="/reports/stock-bin-batch-status"
                        element={<StockBinBatchStatusWise />}
                      />

                      <Route
                        path="/reports/stock-ledger"
                        element={<StockLedger />}
                      />

                      <Route path="/vas/kitting" element={<KittingPage />} />

                      <Route
                        path="/vas/dekitting"
                        element={<DeKittingPage />}
                      />

                      <Route path="/vas/pick" element={<VasPickPage />} />

                      <Route path="/vas/putaway" element={<VasPutawayPage />} />
                      <Route path="/user" element={<User />} />
                      <Route
                        path="/employee"
                        element={<EmployeeMasterPage />}
                      />
                      <Route path="/warehouse" element={<WarehouseMaster />} />
                      <Route
                        path="/inbound/gatepass-in"
                        element={<GatePassInPage />}
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ChatWidget />
      <AppContent />
    </Provider>
  );
}

export default App;
