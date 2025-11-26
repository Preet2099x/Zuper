import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminAccounts from './AdminAccounts';
import AdminVehicles from './AdminVehicles';
import AdminAdd from './AdminAdd';
import AdminDocuments from './AdminDocuments';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('accounts');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'accounts', label: 'Accounts', icon: '👥' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'add', label: 'Add', icon: '➕' }
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'accounts':
        return <AdminAccounts />;
      case 'vehicles':
        return <AdminVehicles />;
      case 'documents':
        return <AdminDocuments />;
      case 'add':
        return <AdminAdd />;
      default:
        return <AdminAccounts />;
    }
  };

  return (
    <div className="flex h-screen bg-orange-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r-4 border-black">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-20 bg-orange-400 border-b-4 border-black">
            <h1 className="text-2xl font-black uppercase tracking-tight">🛡️ ADMIN</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center px-4 py-4 font-black uppercase text-sm border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                      activePage === item.id
                        ? 'bg-orange-300'
                        : 'bg-white hover:bg-orange-100'
                    }`}
                  >
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t-4 border-black">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-4 bg-red-400 border-3 border-black font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="text-2xl mr-3">🚪</span>
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b-4 border-black">
          <div className="px-8 py-6">
            <h2 className="text-4xl font-black uppercase tracking-tight">
              {menuItems.find(item => item.id === activePage)?.icon} {menuItems.find(item => item.id === activePage)?.label || 'DASHBOARD'}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;