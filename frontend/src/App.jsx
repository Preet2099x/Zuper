// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signup from "./pages/customer/CustomerSingup.jsx";
import Login from "./pages/customer/CustomerLogin.jsx";
import CustomerDashboard from "./pages/customer/customerDashboard/CustomerDashboard.jsx";
import ProviderSignup from "./pages/provider/ProviderSignup.jsx";
import ProviderLogin from "./pages/provider/ProviderLogin.jsx";
import ProviderDashboard from "./pages/provider/providerDashboard/ProviderDashboard.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import NotFound from "./pages/NotFound.jsx";
import LandingPage from "./pages/LandingPage.jsx";

import PrivateRoute from "./components/PrivateRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Public */}
      <Route path="/customer/signup" element={<Signup />} />
      <Route path="/customer/login" element={<Login />} />
      <Route path="/provider/signup" element={<ProviderSignup />} />
      <Route path="/provider/login" element={<ProviderLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected: wrap with PrivateRoute which checks JWT and optionally role */}
      <Route element={<PrivateRoute />}>
        {/* Customer Dashboard Routes */}
        <Route path="/dashboard/customer/*" element={<CustomerDashboard />} />

        <Route path="/dashboard/provider/*" element={<ProviderDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<PrivateRoute requiredRole="admin" />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      fallback
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
