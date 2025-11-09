import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

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
        if (form.remember) localStorage.setItem("remembered", form.emailOrPhone);
        else localStorage.removeItem("remembered");

        const redirectTo = loc.state?.from?.pathname || "/dashboard/customer/overview";
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
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-400 border-4 border-black transform rotate-12 hidden md:block"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-pink-400 border-4 border-black rounded-full hidden md:block"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-lime-400 border-4 border-black transform -rotate-6 hidden lg:block"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <span className="brutal-badge bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 text-2xl inline-block transform -rotate-2">
              ZUPER
            </span>
          </Link>
          <h1 className="brutal-heading text-4xl md:text-5xl mb-2">
            WELCOME BACK! 
          </h1>
          <p className="font-bold text-gray-700">
            Sign in to access your account
          </p>
        </div>

        <div className="brutal-card bg-white p-8 transform rotate-1 hover:rotate-0 transition-transform">
          {error && (
            <div className="brutal-card-sm bg-red-100 border-red-500 p-4 mb-6 flex items-start gap-3">
              <span className="text-2xl"></span>
              <div>
                <p className="font-black uppercase text-sm text-red-900 mb-1">ERROR!</p>
                <p className="font-bold text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2">
                <span className="font-black uppercase text-sm">Email or Phone </span>
              </label>
              <input
                ref={inputRef}
                name="emailOrPhone"
                value={form.emailOrPhone}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 uppercase placeholder:normal-case"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block mb-2">
                <span className="font-black uppercase text-sm">Password </span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder:normal-case"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-sm uppercase border-2 border-black bg-yellow-300 px-3 py-1 hover:bg-yellow-400"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="remember" 
                  checked={form.remember} 
                  onChange={handleChange} 
                  className="w-5 h-5 border-3 border-black" 
                />
                <span className="font-bold text-sm">Remember me</span>
              </label>

              <button 
                type="button" 
                onClick={() => nav("/forgot-password")} 
                className="font-black text-sm uppercase hover:text-blue-600 underline"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="brutal-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                  </svg>
                  LOGGING IN...
                </span>
              ) : (
                "SIGN IN "
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

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="brutal-btn bg-white hover:bg-gray-50 text-black py-3 flex items-center justify-center gap-2">
                <span className="text-xl"></span>
                <span className="font-black text-sm">GOOGLE</span>
              </button>
              <button className="brutal-btn bg-white hover:bg-gray-50 text-black py-3 flex items-center justify-center gap-2">
                <span className="text-xl"></span>
                <span className="font-black text-sm">FACEBOOK</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center font-bold">
            Don't have an account?{" "}
            <button 
              onClick={() => nav("/customer/signup")} 
              className="font-black uppercase text-sm underline hover:text-blue-600"
            >
              Sign up here! 
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="brutal-btn bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 inline-block">
             BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
