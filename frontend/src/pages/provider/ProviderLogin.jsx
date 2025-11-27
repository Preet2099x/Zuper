import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_BASE;

export default function ProviderLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
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

    if (!form.email.trim() || !form.password) {
      setError("Please fill both fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/provider/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: form.email.trim(), password: form.password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem("providerToken", data.token);
        localStorage.setItem("providerUser", JSON.stringify(data.provider));
        localStorage.setItem("userRole", "provider");
        if (form.remember) localStorage.setItem("remembered", form.email);
        else localStorage.removeItem("remembered");

        const redirectTo = loc.state?.from?.pathname || "/dashboard/provider/overview";
        nav(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
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
        setError(data.message || "Google login failed");
      } else {
        localStorage.setItem("providerToken", data.token);
        localStorage.setItem("providerUser", JSON.stringify(data.provider));
        localStorage.setItem("userRole", "provider");

        const redirectTo = loc.state?.from?.pathname || "/dashboard/provider/overview";
        nav(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 border-4 border-black transform -rotate-12 hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-400 border-4 border-black rounded-full hidden md:block"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-pink-400 border-4 border-black transform rotate-6 hidden lg:block"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <span className="brutal-badge bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-2xl inline-block">
              ZUPER
            </span>
          </Link>
          <h1 className="brutal-heading text-4xl md:text-5xl mb-2">
            PROVIDER LOGIN! 
          </h1>
          <p className="font-bold text-gray-700">
            Sign in to manage your vehicles
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2">
                <span className="font-black uppercase text-sm">Email</span>
              </label>
              <input
                ref={inputRef}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400 placeholder:normal-case"
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
                  className="w-full p-4 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400 placeholder:normal-case"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-sm uppercase border-2 border-black bg-cyan-300 px-3 py-1 hover:bg-cyan-400"
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
                className="font-black text-sm uppercase hover:text-purple-600 underline"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="brutal-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  // Trigger Google login programmatically
                  const googleBtn = document.querySelector('[aria-labelledby="button-label"]');
                  if (googleBtn) googleBtn.click();
                }}
                disabled={loading}
                className="w-full brutal-btn bg-white hover:bg-gray-50 border-3 border-black py-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-black uppercase text-sm">Continue with Google</span>
              </button>
              {/* Hidden Google Login component */}
              <div className="hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center font-bold">
            Don't have an account?{" "}
            <button 
              onClick={() => nav("/provider/signup")} 
              className="font-black uppercase text-sm underline hover:text-purple-600"
            >
              Sign up here! 
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="brutal-btn bg-purple-400 hover:bg-purple-300 text-black px-6 py-3 inline-block">
             BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
