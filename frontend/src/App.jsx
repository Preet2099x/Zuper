// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
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
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected: wrap with PrivateRoute which checks JWT and optionally role */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/provider" element={<ProviderDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      fallback
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
