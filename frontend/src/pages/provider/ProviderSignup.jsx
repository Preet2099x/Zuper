import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_BASE;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone input, only allow digits and limit to 10
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: digits });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      return setError("Please fill all required fields.");
    }

    if (form.phone.length !== 10) {
      return setError("Phone number must be exactly 10 digits.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: `+91${form.phone}`, // Add +91 prefix
        password: form.password,
      };

      // Helpful debug log for request payload
      console.debug("[ProviderSignup] POST", `${API}/api/auth/provider/signup`, payload);

      const res = await fetch(`${API}/api/auth/provider/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Try to parse JSON response but fallback to text for non-JSON bodies
      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        data = { message: text };
      }

      if (!res.ok) {
        console.error("[ProviderSignup] failed", res.status, data);
        setError(data.message || `Signup failed (${res.status})`);
      } else {
        console.debug("[ProviderSignup] success", data);
        setStep("verify");
      }
    } catch {
      console.error("[ProviderSignup] network error", arguments);
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
          localStorage.setItem("providerToken", loginData.token);
          localStorage.setItem("providerUser", JSON.stringify(loginData.provider));
          localStorage.setItem("userRole", "provider");
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/provider/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google signup failed");
      } else {
        localStorage.setItem("providerToken", data.token);
        localStorage.setItem("providerUser", JSON.stringify(data.provider));
        localStorage.setItem("userRole", "provider");
        nav("/dashboard/provider/overview", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google signup failed");
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

      <div className="w-full max-w-2xl relative z-10 animate-slide-up">
        {step === "signup" && (
          <>
            <div className="text-center mb-6">
              <Link to="/" className="inline-block mb-4">
                <span className="brutal-badge bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-2xl inline-block">
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

            <div className="brutal-card bg-white p-8">
              {error && (
                <div className="brutal-card-sm bg-red-100 border-red-500 p-4 mb-6 flex items-start gap-3">
                  <span className="text-2xl"></span>
                  <div>
                    <p className="font-black uppercase text-sm text-red-900 mb-1">ERROR!</p>
                    <p className="font-bold text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">
                      <span className="font-black uppercase text-sm">Full Name</span>
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
                      <span className="font-black uppercase text-sm">Email</span>
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
                </div>

                <div>
                  <label className="block mb-2">
                    <span className="font-black uppercase text-sm">Phone Number</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="bg-gray-100 border-3 border-black px-4 py-4 font-black text-lg flex items-center">
                      +91
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength="10"
                      className="flex-1 p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                      required
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    Enter 10-digit mobile number
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">
                      <span className="font-black uppercase text-sm">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 6 chars"
                        className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xs uppercase border-2 border-black bg-purple-300 px-2 py-1 hover:bg-purple-400"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      <span className="font-black uppercase text-sm">Confirm</span>
                    </label>
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter"
                      className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 placeholder:normal-case"
                      required
                    />
                  </div>
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

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-3 border-black"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 font-black uppercase text-xs">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="[&>div]:w-full [&_iframe]:!w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </div>
              </div>

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
          <div className="brutal-card bg-white p-8">
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
