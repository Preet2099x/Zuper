import React from 'react';
import { NavLink } from 'react-router-dom';

// Import desired icons from the react-icons library
import {
  FaTachometerAlt,
  FaTruck,
  FaSearch,
  FaEnvelope,
  FaUser,
  FaQuestionCircle,
  FaCog,
} from 'react-icons/fa';

// Define the navigation links inside the component file
const customerNavItems = [
  { path: '/dashboard/customer/overview', icon: <FaTachometerAlt />, label: 'Overview' },
  { path: '/dashboard/customer/vehicles', icon: <FaTruck />, label: 'My Vehicles' },
  { path: '/dashboard/customer/search', icon: <FaSearch />, label: 'Search' },
  { path: '/dashboard/customer/inbox', icon: <FaEnvelope />, label: 'Inbox' },
  { path: '/dashboard/customer/profile', icon: <FaUser />, label: 'Profile' },
  { path: '/dashboard/customer/help', icon: <FaQuestionCircle />, label: 'Help', position: 'footer' },
  { path: '/dashboard/customer/settings', icon: <FaCog />, label: 'Settings', position: 'footer' },
];

const CustomerSidebar = ({ logo }) => {
  // Separate main and footer navigation items
  const mainNav = customerNavItems.filter((item) => !item.position);
  const footerNav = customerNavItems.filter((item) => item.position === 'footer');

  // Base classes for all nav links for consistency
  const navLinkClasses =
    'flex items-center py-3 px-4 my-1 rounded-lg font-medium transition-colors duration-200 hover:bg-slate-700 hover:text-white';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-400 flex flex-col p-4">
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

export default CustomerSidebar;