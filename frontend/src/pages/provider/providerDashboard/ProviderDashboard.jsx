import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';
import ProviderOverview from './ProviderOverview';
import ProviderMyVehicles from './ProviderMyVehicles';
import ProviderListVehicle from './ProviderListVehicle';
import ProviderEarnings from './ProviderEarnings';
import ProviderInbox from './ProviderInbox';
import ProviderSettings from './ProviderSettings';
import ProviderHelp from './ProviderHelp';
import DashboardNavbar from '../../../components/DashboardNavbar';

const ProviderDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ProviderSidebar logo="/zuper.png" />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardNavbar userRole="provider" />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProviderOverview />} />
            <Route path="my-vehicles" element={<ProviderMyVehicles />} />
            <Route path="list-vehicle" element={<ProviderListVehicle />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="inbox" element={<ProviderInbox />} />
            <Route path="settings" element={<ProviderSettings />} />
            <Route path="help" element={<ProviderHelp />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;