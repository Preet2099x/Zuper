import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProviderSignup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState("signup"); // "signup" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 1) Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      return setError("Please fill all required fields.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/provider/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
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
      const res = await fetch(`${API}/api/auth/provider/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
      } else {
        // Auto-login after verification
        const loginRes = await fetch(`${API}/api/auth/provider/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: form.email,
            password: form.password,
          }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("user", JSON.stringify(loginData.provider));
          nav("/dashboard/provider", { replace: true });
        } else {
          setError(loginData.message || "Login failed. Please log in manually.");
          nav("/provider/login");
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
      const res = await fetch(`${API}/api/auth/provider/resend-email-otp`, {
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
        <h1 className="text-2xl font-semibold mb-4">Sign up as Provider</h1>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

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
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full p-2 border rounded"
              required
            />

            <label className="flex items-center text-sm gap-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((s) => !s)}
                className="h-4 w-4"
              />
              <span>Show password</span>
            </label>

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

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => nav("/provider/login")}
            className="text-blue-600 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
