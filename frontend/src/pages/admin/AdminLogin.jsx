import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and admin info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      // Redirect to admin dashboard
      navigate('/dashboard/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-100 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-400 border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-5xl font-black">🛡️</h1>
          </div>
        </div>
        <h2 className="text-center text-5xl font-black uppercase tracking-tight mb-3">
          ADMIN LOGIN
        </h2>
        <p className="text-center text-sm font-bold uppercase">
          ENTER CREDENTIALS TO ACCESS DASHBOARD
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          {error && (
            <div className="mb-6 bg-red-300 border-3 border-black px-4 py-3 font-bold uppercase text-sm">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-black uppercase mb-2">
                🔑 ADMIN CODE
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-3 border-3 border-black font-bold uppercase text-sm focus:outline-none focus:ring-4 focus:ring-orange-400"
                placeholder="ENTER CODE"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-black uppercase mb-2">
                🔒 PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-3 border-black font-bold uppercase text-sm focus:outline-none focus:ring-4 focus:ring-orange-400"
                placeholder="ENTER PASSWORD"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-400 border-3 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? '⏳ SIGNING IN...' : '➡️ SIGN IN'}
            </button>
          </form>

          <div className="mt-8">
            <div className="border-t-3 border-black pt-6">
              <div className="text-center">
                <p className="font-black uppercase text-xs mb-3 text-gray-600">📋 DEMO CREDENTIALS</p>
                <div className="bg-orange-50 border-3 border-black p-4">
                  <p className="font-black text-sm mb-1"><span className="text-gray-600">CODE:</span> BigBoss</p>
                  <p className="font-black text-sm"><span className="text-gray-600">PASSWORD:</span> Admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;