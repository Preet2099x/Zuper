// src/components/PrivateRoute.jsx
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

/**
 * Basic gate:
 * - If there is a token, allow route (Outlet renders child route).
 * - Otherwise redirect to /customer/login and save attempted location in state.
 *
 * For role-based gating, decode token or store role in localStorage and check here.
 */

function getToken() {
  return localStorage.getItem("token");
}

export default function PrivateRoute({ requiredRole } = {}) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    // not logged in -> bounce to login, remember where they tried to go
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  // Optional: role check (if you pass requiredRole prop)
  if (requiredRole) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== requiredRole) {
        return <Navigate to="/customer/login" replace />;
      }
    } catch (e) {
      // token malformed -> force login
      return <Navigate to="/customer/login" replace />;
    }
  }

  // token exists, allow route
  return <Outlet />;
}
