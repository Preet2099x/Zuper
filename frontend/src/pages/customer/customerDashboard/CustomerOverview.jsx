import React from 'react';

const CustomerOverview = () => {
  // Static data for demonstration
  const stats = [
    { title: 'Active Contracts', value: '3', color: 'bg-blue-500' },
    { title: 'Vehicles Managed', value: '5', color: 'bg-green-500' },
    { title: 'Total Spent', value: '₹1,25,000', color: 'bg-yellow-500' },
    { title: 'Pending Payments', value: '1', color: 'bg-red-500' },
  ];

  const recentActivity = [
    { id: 1, action: 'New contract signed', vehicle: 'Maruti Suzuki Swift', date: '2024-01-15', status: 'active' },
    { id: 2, action: 'Payment processed', vehicle: 'Hyundai i20', date: '2024-01-12', status: 'completed' },
    { id: 3, action: 'Vehicle inspection', vehicle: 'Tata Nexon', date: '2024-01-10', status: 'scheduled' },
    { id: 4, action: 'Contract renewed', vehicle: 'Mahindra Scorpio', date: '2024-01-08', status: 'active' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                    {stat.value}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.date}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.status === 'active' ? 'bg-green-100 text-green-800' :
                        activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                Search for Vehicles
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                View My Contracts
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                Contact Support
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CustomerOverview;