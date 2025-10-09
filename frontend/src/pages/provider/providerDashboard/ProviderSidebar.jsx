import React from 'react';
import { NavLink } from 'react-router-dom';

// Import desired icons from the react-icons library
import {
  FaChartLine,
  FaTruck,
  FaPlusCircle,
  FaEnvelope,
  FaCog,
  FaQuestionCircle,
  FaDollarSign,
} from 'react-icons/fa';

// Define the navigation links for the provider sidebar
const providerNavItems = [
  { path: '/dashboard/provider/overview', icon: <FaChartLine />, label: 'Overview' },
  { path: '/dashboard/provider/my-vehicles', icon: <FaTruck />, label: 'My Vehicles' },
  { path: '/dashboard/provider/list-vehicle', icon: <FaPlusCircle />, label: 'List Vehicle' },
  { path: '/dashboard/provider/earnings', icon: <FaDollarSign />, label: 'Earnings' },
  { path: '/dashboard/provider/inbox', icon: <FaEnvelope />, label: 'Inbox' },
  { path: '/dashboard/provider/settings', icon: <FaCog />, label: 'Settings', position: 'footer' },
  { path: '/dashboard/provider/help', icon: <FaQuestionCircle />, label: 'Help', position: 'footer' },
];

const ProviderSidebar = ({ logo }) => {
  // Separate main and footer navigation items based on the 'position' property
  const mainNav = providerNavItems.filter((item) => !item.position);
  const footerNav = providerNavItems.filter((item) => item.position === 'footer');

  // Base classes for all nav links to ensure consistency and avoid repetition
  const navLinkClasses =
    'flex items-center py-3 px-4 my-1 rounded-lg font-medium transition-colors duration-200 hover:bg-slate-700 hover:text-white';

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-400 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto">
      <div className="py-4 px-2 mb-4 text-center">
        <img src={logo} alt="Company Logo" className="w-32 h-auto mx-auto" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow">
        <ul>
          {mainNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${navLinkClasses} ${isActive ? 'bg-slate-700 text-white' : ''}`
                }
              >
                <span className="text-xl mr-4">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Navigation */}
      <nav className="mt-auto">
        <ul>
          {footerNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${navLinkClasses} ${isActive ? 'bg-slate-700 text-white' : ''}`
                }
              >
                <span className="text-xl mr-4">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ProviderSidebar;