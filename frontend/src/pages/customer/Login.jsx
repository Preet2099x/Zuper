import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ emailOrPhone: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // basic client-side validation (helpful UX, server still authoritative)
    if (!form.emailOrPhone.trim() || !form.password) {
      setError("Please fill both fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: form.emailOrPhone.trim(), password: form.password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // persist remember choice (non-sensitive)
        if (form.remember) localStorage.setItem("remembered", form.emailOrPhone);
        else localStorage.removeItem("remembered");

        const redirectTo = loc.state?.from?.pathname || "/dashboard/customer";
        nav(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100"
      >
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue to your account</p>
        </header>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
            </svg>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email or phone</span>
            <input
              ref={inputRef}
              name="emailOrPhone"
              value={form.emailOrPhone}
              onChange={handleChange}
              placeholder="you@example.com or +911234567890"
              className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
              required
              autoComplete="username"
            />
          </label>

          <label className="block relative">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-9 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="w-4 h-4" />
              <span className="text-gray-600">Remember me</span>
            </label>

            <button type="button" onClick={() => nav('/forgot-password')} className="text-blue-600 hover:underline">
              Forgot?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">or continue with</div>


        <p className="mt-6 text-center text-sm text-gray-600">Don’t have an account? <button onClick={() => nav('/signup')} className="text-blue-600 hover:underline">Sign up</button></p>
      </motion.div>
    </div>
  );
}
