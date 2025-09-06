import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [step, setStep] = useState("signup"); // "signup" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 1) Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/customer/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        setStep("verify");
      }
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  // 2) Verify email OTP
  const handleVerify = async () => {
    if (!otp.trim()) return setError("Enter the verification code");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/customer/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
      } else {
        // Auto-login after verification
        const loginRes = await fetch(`${API}/api/auth/customer/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("user", JSON.stringify(loginData.user));
          nav("/dashboard/customer", { replace: true });
        } else {
          setError(loginData.message || "Login failed. Please log in manually.");
          nav("/login");
        }
      }
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  // 3) Resend OTP
  const handleResend = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/customer/resend-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend code");
      } else {
        alert("New code sent to your email");
      }
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign up for Zuper</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>
        )}

        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full p-2 border rounded"
              required
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-3">
            <p className="text-gray-700">
              We’ve sent a 6-digit verification code to <b>{form.email}</b>.
              Enter it below to verify your account.
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Verification code"
              className="w-full p-2 border rounded"
              required
            />
            <button
              onClick={handleVerify}
              className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="w-full bg-gray-200 text-gray-800 p-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
