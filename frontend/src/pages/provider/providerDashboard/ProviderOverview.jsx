import React from 'react';

const ProviderOverview = () => {
  // Static dashboard data for provider
  const stats = [
    {
      title: 'Total Vehicles',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: '🚗'
    },
    {
      title: 'Active Bookings',
      value: '12',
      change: '+15%',
      changeType: 'positive',
      icon: '📅'
    },
    {
      title: 'Monthly Revenue',
      value: '₹1,25,000',
      change: '+12%',
      changeType: 'positive',
      icon: '💰'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: '⭐'
    }
  ];

  const recentBookings = [
    {
      id: 1,
      customer: 'Rajesh Kumar',
      vehicle: 'Maruti Suzuki Swift',
      duration: '3 days',
      amount: '₹8,550',
      status: 'active',
      pickupDate: '2024-01-15'
    },
    {
      id: 2,
      customer: 'Priya Sharma',
      vehicle: 'Hyundai Creta',
      duration: '5 days',
      amount: '₹14,250',
      status: 'upcoming',
      pickupDate: '2024-01-18'
    },
    {
      id: 3,
      customer: 'Amit Singh',
      vehicle: 'Tata Nexon',
      duration: '2 days',
      amount: '₹4,500',
      status: 'completed',
      pickupDate: '2024-01-10'
    },
    {
      id: 4,
      customer: 'Kavita Patel',
      vehicle: 'Mahindra Scorpio',
      duration: '7 days',
      amount: '₹18,900',
      status: 'active',
      pickupDate: '2024-01-12'
    }
  ];

  const vehicleStatus = [
    { status: 'Available', count: 5, color: 'bg-green-500' },
    { status: 'Rented', count: 3, color: 'bg-blue-500' },
    { status: 'Maintenance', count: 0, color: 'bg-yellow-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Provider Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{booking.customer}</h3>
                    <p className="text-sm text-gray-600">{booking.vehicle}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">📅 {booking.pickupDate}</span>
                      <span className="text-xs text-gray-500">⏱️ {booking.duration}</span>
                      <span className="text-xs font-medium text-green-600">{booking.amount}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Status</h2>
            <div className="space-y-4">
              {vehicleStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                    <span className="text-gray-700">{status.status}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                  <div className="text-center">
                    <div className="text-xl mb-1">➕</div>
                    <p className="text-sm font-medium text-gray-900">Add Vehicle</p>
                  </div>
                </button>
                <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                  <div className="text-center">
                    <div className="text-xl mb-1">📊</div>
                    <p className="text-sm font-medium text-gray-900">View Reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-gray-600">Revenue: $4,250 (+12%)</p>
              <p className="text-gray-600">Bookings: 12 (+15%)</p>
              <p className="text-gray-600">Average Rating: 4.8 (+0.2)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOverview;