import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code & new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/customer/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/customer/reset-password`, {
        email,
        code,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/customer/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black uppercase mb-2 text-shadow-brutal">
            RESET PASSWORD
          </h1>
          <p className="text-gray-600 font-bold uppercase text-sm">
            {step === 1 ? "Enter your email" : "Enter code and new password"}
          </p>
        </div>

        <div className="brutal-card bg-white p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-3 border-red-500 text-red-700 font-bold uppercase text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-green-100 border-3 border-green-500 text-green-700 font-bold uppercase text-sm">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode}>
              <div className="mb-6">
                <label className="block mb-2 font-black uppercase text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="brutal-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg disabled:opacity-50"
              >
                {loading ? "SENDING..." : "SEND RESET CODE"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block mb-2 font-black uppercase text-sm">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:border-yellow-400 font-medium text-center text-2xl tracking-widest"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-black uppercase text-sm">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:border-yellow-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 brutal-btn bg-yellow-400 hover:bg-yellow-500 px-3 py-1 text-xs"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="brutal-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg disabled:opacity-50"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/customer/login")}
              className="font-black text-sm uppercase hover:text-blue-600 underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
