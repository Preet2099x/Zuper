import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const DashboardNavbar = ({ userRole }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserName('User');
      }
    } else {
      // If no user data, redirect to login
      navigate(userRole === 'customer' ? '/customer/login' : '/provider/login');
    }
  }, [userRole, navigate]);

  // Listen for user profile updates
  useEffect(() => {
    const handleUserUpdated = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || 'User');
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    window.addEventListener('userUpdated', handleUserUpdated);
    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, []);

  const handleLogout = () => {
    // Remove JWT token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to appropriate login page based on role
    if (userRole === 'customer') {
      navigate('/');
      // navigate('/customer/login');
    } else if (userRole === 'provider') {
      navigate('/');
      // navigate('/provider/login');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {userRole === 'customer' ? 'Customer Dashboard' : 'Provider Dashboard'}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-700 text-white rounded-full p-2">
            <FaUser className="text-lg" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
