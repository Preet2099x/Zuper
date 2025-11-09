// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function VerifyEmail() {
  const { token } = useParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMsg("No token provided");
      return;
    }

    fetch(`${API}/api/auth/customer/verify-email/${encodeURIComponent(token)}`)
      .then(res => res.json().then(body => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          setMsg(body.message || "Verification failed");
          return;
        }
        setMsg(body.message || "Verified! Redirecting...");
        setTimeout(() => nav("/customer/login"), 1400);
      })
      .catch(() => setMsg("Network error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <p>{msg}</p>
      </div>
    </div>
  );
}
