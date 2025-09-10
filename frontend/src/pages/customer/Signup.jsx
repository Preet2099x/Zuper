import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState("signup"); // signup | verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    let t;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // client side validation helper
  const validateSignup = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      return "Please fill all required fields.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSignup = async (e) => {
    e && e.preventDefault();
    setError("");
    setInfo("");

    const v = validateSignup();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/customer/signup`, {
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
      if (!res.ok) setError(data.message || "Signup failed");
      else {
        setStep("verify");
        setInfo("Verification code sent. Check your email.");
        setResendCooldown(60); // 60s cooldown
        // focus first otp input after tiny delay
        setTimeout(() => otpRefs.current[0]?.focus?.(), 200);
      }
    } catch (err) {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  // OTP helpers
  const otpValue = otp.join("");

  const handleOtpChange = (i, value) => {
    if (!/^[0-9]?$/.test(value)) return; // only digits, max 1
    const next = [...otp];
    next[i] = value;
    setOtp(next);

    if (value && i < otpRefs.current.length - 1) {
      otpRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < otpRefs.current.length - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleVerify = async () => {
    setError("");
    setInfo("");
    if (otpValue.length !== 6 || /\D/.test(otpValue)) return setError("Enter the 6-digit verification code.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/customer/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Verification failed");
      else {
        // auto-login
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
    } catch (err) {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/customer/resend-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to resend code");
      else {
        setInfo("New code sent to your email.");
        setResendCooldown(60);
      }
    } catch (err) {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Create your account</h1>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
        {info && <div className="bg-green-50 border border-green-100 text-green-700 p-2 rounded mb-3">{info}</div>}

        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-3">
            <label className="block">
              <span className="text-xs text-gray-600">Full name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-600">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-600">Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-600">Password</span>
                <div className="relative mt-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full p-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0114.12 14.12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-xs text-gray-600">Confirm</span>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((s) => !s)}
                  className="h-4 w-4"
                />
                <span>Show password</span>
              </label>
              <div>Passwords must be at least 6 characters.</div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white p-3 rounded-lg shadow hover:brightness-105 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Create account"}
            </button>

            <div className="pt-2 text-center text-sm text-gray-500">Already have an account? <a href="/login" className="text-blue-600">Log in</a></div>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">A 6-digit code was sent to <b>{form.email}</b>. Enter it below.</p>

            <div className="flex gap-2 justify-center">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleVerify}
                className="w-full bg-green-600 text-white p-3 rounded-lg disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className="w-full border p-3 rounded-lg disabled:opacity-60"
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
              </button>
            </div>

            <div className="text-xs text-gray-400 text-center">If you don’t get the email within a minute, check spam or try a different address.</div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
