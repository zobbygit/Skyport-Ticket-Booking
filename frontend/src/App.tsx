import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import { useAuthStore } from "./store/authStore";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FlightSearch from "./pages/FlightSearch";
import FlightDetails from "./pages/FlightDetails";
import BoardingPass from "./pages/BoardingPass";
import AirportMap from "./pages/AirportMap";
import Baggage from "./pages/Baggage";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFlights from "./pages/admin/AdminFlights";
import AdminGates from "./pages/admin/AdminGates";
import AdminPassengers from "./pages/admin/AdminPassengers";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminAirports from "./pages/admin/AdminAirports";
import Checkout from "./pages/Checkout";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";

function PublicLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/flights" element={<FlightSearch />} />
        <Route path="/flights/:id" element={<FlightDetails />} />
        <Route path="/airport-map" element={<AirportMap />} />
        <Route path="/baggage" element={<Baggage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout/:bookingId" element={<Checkout />} />
          <Route path="/boarding-pass/:id" element={<BoardingPass />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <Routes>
 <Route path="/admin/login" element={<AdminLogin />} />

<Route element={<AdminProtectedRoute />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="flights" element={<AdminFlights />} />
    <Route path="gates" element={<AdminGates />} />
    <Route path="passengers" element={<AdminPassengers />} />
    <Route path="airports" element={<AdminAirports />} />
    <Route path="notifications" element={<AdminNotifications />} />

    {/* SUPER ADMIN ONLY */}
    <Route
      path="admins"
      element={<AdminProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}
    >
      <Route index element={<AdminAdmins />} />
    </Route>

    {/* SUPER ADMIN ONLY */}
    <Route
      path="audit-log"
      element={<AdminProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}
    >
      <Route index element={<AdminAuditLog />} />
    </Route>

    <Route path="announcements" element={<AdminAnnouncements />} />
  </Route>
</Route>

      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <PublicLayout />
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
