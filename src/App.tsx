import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RegisterPatient from "./pages/RegisterPatient";
import ViewPatients from "./pages/ViewPatients";
import AmbulanceBooking from "./pages/AmbulanceBooking";
import NewPrescription from "./pages/NewPrescription";
import ViewPrescriptions from "./pages/ViewPrescriptions";
import ScheduleAppointment from "./pages/ScheduleAppointment";
import ViewAppointments from "./pages/ViewAppointments";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/register-patient" element={<ProtectedRoute><RegisterPatient /></ProtectedRoute>} />
          <Route path="/view-patients" element={<ProtectedRoute><ViewPatients /></ProtectedRoute>} />
          <Route path="/ambulance" element={<ProtectedRoute><AmbulanceBooking /></ProtectedRoute>} />
          <Route path="/new-prescription" element={<ProtectedRoute><NewPrescription /></ProtectedRoute>} />
          <Route path="/view-prescriptions" element={<ProtectedRoute><ViewPrescriptions /></ProtectedRoute>} />
          <Route path="/schedule-appointment" element={<ProtectedRoute><ScheduleAppointment /></ProtectedRoute>} />
          <Route path="/view-appointments" element={<ProtectedRoute><ViewAppointments /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
