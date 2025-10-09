import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import CustomerOverview from './CustomerOverview';
import CustomerMyVehicles from './CustomerMyVehicles';
import CustomerSearch from './CustomerSearch';
import CustomerInbox from './CustomerInbox';
import CustomerProfile from './CustomerProfile';
import CustomerHelp from './CustomerHelp';
import CustomerSettings from './CustomerSettings';
import DashboardNavbar from '../../../components/DashboardNavbar';

const CustomerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <CustomerSidebar logo="/zuper.png" />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardNavbar userRole="customer" />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="overview" element={<CustomerOverview />} />
            <Route path="vehicles" element={<CustomerMyVehicles />} />
            <Route path="search" element={<CustomerSearch />} />
            <Route path="inbox" element={<CustomerInbox />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="help" element={<CustomerHelp />} />
            <Route path="settings" element={<CustomerSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
