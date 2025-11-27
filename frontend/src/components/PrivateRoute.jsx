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
  return localStorage.getItem("customerToken") || localStorage.getItem("providerToken") || localStorage.getItem("adminToken");
}

function getUserRole() {
  const customerToken = localStorage.getItem("customerToken");
  const providerToken = localStorage.getItem("providerToken");
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    return "admin";
  }

  if (providerToken) {
    return "provider";
  }

  if (customerToken) {
    return "customer";
  }

  // Fallback: check userRole in localStorage
  return localStorage.getItem("userRole") || null;
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
      const loginPath = requiredRole === "admin" ? "/admin/login" : 
                        requiredRole === "provider" ? "/provider/login" : "/customer/login";
      return <Navigate to={loginPath} replace />;
    }
  }

  // token exists, allow route
  return <Outlet />;
}
