import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  const [step, setStep] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
          nav("/dashboard/provider/overview", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-40 h-40 bg-cyan-400 border-4 border-black transform rotate-12 hidden lg:block"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-yellow-400 border-4 border-black rounded-full hidden md:block"></div>
      <div className="absolute top-1/3 left-10 w-20 h-20 bg-pink-400 border-4 border-black transform -rotate-45 hidden lg:block"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {step === "signup" && (
          <>
            <div className="text-center mb-6">
              <Link to="/" className="inline-block mb-4">
                <span className="brutal-badge bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-2xl inline-block transform rotate-2">
                  ZUPER
                </span>
              </Link>
              <h1 className="brutal-heading text-4xl md:text-5xl mb-2">
                BECOME A PROVIDER! 
              </h1>
              <p className="font-bold text-gray-700">
                Start earning by listing your vehicles
              </p>
            </div>

            <div className="brutal-card bg-white p-8 transform -rotate-1 hover:rotate-0 transition-transform">
              {error && (
                <div className="brutal-card-sm bg-red-100 border-red-500 p-4 mb-6 flex items-start gap-3">
                  <span className="text-2xl"></span>
                  <div>
                    <p className="font-black uppercase text-sm text-red-900 mb-1">ERROR!</p>
                    <p className="font-bold text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Full Name </span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 uppercase placeholder:normal-case"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Email </span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 lowercase placeholder:normal-case"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Phone </span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Password </span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-sm uppercase border-2 border-black bg-purple-300 px-3 py-1 hover:bg-purple-400"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Confirm Password </span>
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="brutal-btn w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                      </svg>
                      CREATING ACCOUNT...
                    </span>
                  ) : (
                    "CREATE ACCOUNT "
                  )}
                </button>
              </form>

              <p className="mt-6 text-center font-bold">
                Already have an account?{" "}
                <button 
                  onClick={() => nav("/provider/login")} 
                  className="font-black uppercase text-sm underline hover:text-purple-600"
                >
                  Login here! 
                </button>
              </p>
            </div>

            <div className="text-center mt-6">
              <Link to="/" className="brutal-btn bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 inline-block">
                 BACK TO HOME
              </Link>
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="brutal-card bg-white p-8 transform rotate-1">
            <div className="text-center mb-6">
              <span className="text-6xl mb-4 inline-block animate-float-brutal"></span>
              <h1 className="brutal-heading text-3xl md:text-4xl mb-2">
                CHECK YOUR EMAIL!
              </h1>
              <p className="font-bold text-gray-700">
                We sent a 6-digit code to <span className="text-purple-600">{form.email}</span>
              </p>
            </div>

            {error && (
              <div className="brutal-card-sm bg-red-100 border-red-500 p-4 mb-6 flex items-start gap-3">
                <span className="text-2xl"></span>
                <div>
                  <p className="font-black uppercase text-sm text-red-900 mb-1">ERROR!</p>
                  <p className="font-bold text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block mb-2">
                  <span className="font-black uppercase text-sm">Verification Code </span>
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full p-4 border-3 border-black font-bold text-2xl text-center tracking-widest focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:text-gray-300"
                  required
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="brutal-btn w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                    </svg>
                    VERIFYING...
                  </span>
                ) : (
                  "VERIFY & CONTINUE "
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="brutal-btn w-full bg-white hover:bg-gray-50 text-black py-3 disabled:opacity-50"
              >
                RESEND CODE 
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
