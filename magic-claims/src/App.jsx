import { Toaster, toast } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import ReportDamage from "./pages/ReportDamage";
import NotFound from "./pages/NotFound";
import Tracking from "./pages/Tracking";
import CustomerProfile from "./pages/CustomerProfile";
import ClaimSubmitted from "./pages/ClaimSubmitted";
import RepairDashboard from "./pages/RepairDashboard";
import RepairClaimDetail from "./pages/RepairClaimDetail";
import InvoiceDetail from "./pages/InvoiceDetail";
import VehicleInactivePolicies from "./pages/VehicleInactivePolicies";
import ClaimDetail from "./pages/ClaimDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster richColors position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/report-damage" element={<ReportDamage />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/claim-submitted" element={<ClaimSubmitted />} />
          <Route path="/repair-dashboard" element={<RepairDashboard />} />
          <Route path="/repair" element={<RepairDashboard />} />
          <Route path="/repair/claims/:id" element={<RepairClaimDetail />} />
          <Route
            path="/repair/invoice/:repairShopId/:invoiceId"
            element={<InvoiceDetail />}
          />
          <Route path="/vehicle/:carId/policies/inactive" element={<VehicleInactivePolicies />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
