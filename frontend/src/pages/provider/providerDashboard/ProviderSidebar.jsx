import React from 'react';
import { NavLink } from 'react-router-dom';

// Define the navigation links for the provider sidebar
const providerNavItems = [
  { path: '/dashboard/provider/overview', label: 'Overview', emoji: '📊' },
  { path: '/dashboard/provider/my-vehicles', label: 'My Vehicles', emoji: '🚗' },
  { path: '/dashboard/provider/list-vehicle', label: 'List Vehicle', emoji: '➕' },
  { path: '/dashboard/provider/earnings', label: 'Earnings', emoji: '💰' },
  { path: '/dashboard/provider/booking-requests', label: 'Booking Requests', emoji: '🔔' },
  { path: '/dashboard/provider/inbox', label: 'Inbox', emoji: '📬' },
  { path: '/dashboard/provider/settings', label: 'Settings', emoji: '⚙️', position: 'footer' },
  { path: '/dashboard/provider/help', label: 'Help', emoji: '❓', position: 'footer' },
];

const ProviderSidebar = ({ logo }) => {
  const mainNav = providerNavItems.filter((item) => !item.position);
  const footerNav = providerNavItems.filter((item) => item.position === 'footer');

  return (
    <aside className="w-64 h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col p-4 fixed left-0 top-0 overflow-y-auto overflow-x-hidden border-r-4 border-purple-400 shadow-[8px_0px_0px_0px_rgba(192,132,252,0.3)] scrollbar-hide">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Logo Section */}
      <div className="py-4 px-2 mb-6 text-center">
        <div className="brutal-card bg-purple-400 text-black px-4 py-3 inline-block transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-2xl font-black uppercase tracking-wider">ZUPER</span>
          <div className="w-full h-0.5 bg-black mt-1.5"></div>
        </div>
        <div className="mt-3 brutal-badge bg-black border-3 border-purple-400 text-purple-400 px-3 py-1 inline-block">
          <span className="font-black uppercase text-xs tracking-widest">🚗 PROVIDER</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow space-y-2.5">
        <div className="mb-3 px-2">
          <span className="font-black uppercase text-xs text-gray-500 tracking-wider">MAIN MENU</span>
          <div className="w-10 h-0.5 bg-purple-400 mt-1"></div>
        </div>
        {mainNav.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between py-2.5 px-3 font-black uppercase text-xs transition-all border-3 border-white relative overflow-hidden ${
                isActive
                  ? "bg-purple-400 text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] scale-105"
                  : "bg-white text-black hover:bg-purple-300 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-lg transition-transform group-hover:scale-125 ${index % 3 === 0 ? 'group-hover:rotate-12' : index % 3 === 1 ? 'group-hover:-rotate-12' : 'group-hover:rotate-6'}`}>
                {item.emoji}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </div>
            <div className={({ isActive }) => 
              `w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-black scale-100' : 'bg-gray-400 scale-0 group-hover:scale-100'}`
            }></div>
          </NavLink>
        ))}
      </nav>

      {/* Footer Navigation */}
      <nav className="mt-auto space-y-2.5 pt-4 border-t-4 border-purple-400 relative">
        <div className="mb-2.5 px-2 pt-2">
          <span className="font-black uppercase text-xs text-gray-500 tracking-wider">QUICK ACCESS</span>
          <div className="w-10 h-0.5 bg-purple-400 mt-1"></div>
        </div>
        {footerNav.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between py-2.5 px-3 font-black uppercase text-xs transition-all border-3 border-white ${
                isActive
                  ? "bg-purple-400 text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] scale-105"
                  : "bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-purple-400 hover:to-purple-500 hover:text-black hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg transition-transform group-hover:scale-125 group-hover:rotate-12">
                {item.emoji}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Badge */}
      <div className="mt-3 p-2.5 bg-purple-400 border-3 border-white text-center transform -rotate-1">
        <p className="font-black uppercase text-xs text-black">✨ POWERED BY ZUPER</p>
      </div>
    </aside>
  );
};

export default ProviderSidebar;