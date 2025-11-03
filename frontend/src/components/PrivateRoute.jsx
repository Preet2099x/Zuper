// src/components/PrivateRoute.jsx
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

/**
 * Basic gate:
 * - If there is a token (customer/provider) or adminToken (admin), allow route.
 * - Otherwise redirect to appropriate login page and save attempted location in state.
 *
 * For role-based gating, decode token or store role in localStorage and check here.
 */

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("adminToken");
}

function getUserRole() {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    return "admin";
  }

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || "customer"; // default to customer if no role specified
    } catch (e) {
      return null;
    }
  }

  return null;
}

export default function PrivateRoute({ requiredRole } = {}) {
  const token = getToken();
  const userRole = getUserRole();
  const location = useLocation();

  if (!token) {
    // not logged in -> bounce to login, remember where they tried to go
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  // Optional: role check (if you pass requiredRole prop)
  if (requiredRole) {
    if (userRole !== requiredRole) {
      // Redirect to appropriate login based on required role
      const loginPath = requiredRole === "admin" ? "/admin/login" : "/customer/login";
      return <Navigate to={loginPath} replace />;
    }
  }

  // token exists, allow route
  return <Outlet />;
}
