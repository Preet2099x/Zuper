import React from 'react';

const ProviderOverview = () => {
  // Static dashboard data for provider
  const stats = [
    {
      title: 'Total Vehicles',
      value: '8',
      change: '+2',
      changeType: 'positive',
      emoji: '🚗',
      color: 'bg-cyan-300'
    },
    {
      title: 'Active Bookings',
      value: '12',
      change: '+15%',
      changeType: 'positive',
      emoji: '📅',
      color: 'bg-purple-300'
    },
    {
      title: 'Monthly Revenue',
      value: '₹1,25,000',
      change: '+12%',
      changeType: 'positive',
      emoji: '💰',
      color: 'bg-green-300'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      emoji: '⭐',
      color: 'bg-yellow-300'
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
        return 'bg-green-300';
      case 'upcoming':
        return 'bg-blue-300';
      case 'completed':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'upcoming':
        return '🔜';
      case 'completed':
        return '✔️';
      default:
        return '⚪';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="brutal-heading text-3xl mb-3">🚗 PROVIDER DASHBOARD</h1>
        <p className="font-bold text-sm text-gray-600 uppercase">Manage your fleet and track performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className={`brutal-card ${stat.color} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">{stat.emoji}</span>
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-black text-xl border-3 border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                {stat.value.length <= 2 ? stat.value : stat.value.charAt(0)}
              </div>
            </div>
            <p className="font-black uppercase text-xs mt-4 text-gray-800">{stat.title}</p>
            <p className="text-3xl font-black mt-3 mb-2">{stat.value}</p>
            <p className={`font-bold text-xs mt-2 ${
              stat.changeType === 'positive' ? 'text-green-800' : 'text-red-800'
            }`}>
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Recent Bookings - Takes 2 columns */}
        <div className="lg:col-span-2 brutal-card bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="brutal-heading text-xl">📋 RECENT BOOKINGS</h2>
            <button className="brutal-btn bg-purple-200 hover:bg-purple-300 text-black px-4 py-2 text-xs">
              VIEW ALL
            </button>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="brutal-card-sm bg-gray-50 p-5 hover:bg-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black uppercase text-sm">{booking.customer}</h3>
                  <span className={`brutal-badge ${getStatusColor(booking.status)} text-black text-xs px-3 py-1.5 border-2 border-black`}>
                    {getStatusEmoji(booking.status)} {booking.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-bold text-sm text-gray-700 mb-3">🚗 {booking.vehicle}</p>
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center space-x-4 text-xs font-bold text-gray-600">
                    <span>📅 {booking.pickupDate}</span>
                    <span>⏱️ {booking.duration}</span>
                  </div>
                  <span className="font-black text-sm text-green-700">{booking.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status - Takes 1 column */}
        <div className="brutal-card bg-white p-8">
          <h2 className="brutal-heading text-xl mb-6">🚦 FLEET STATUS</h2>
          <div className="space-y-5 mb-10">
            {vehicleStatus.map((status, index) => (
              <div key={index} className="brutal-card-sm p-5 bg-gray-50 hover:bg-purple-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 border-3 border-black ${status.color}`}></div>
                    <span className="font-black uppercase text-sm">{status.status}</span>
                  </div>
                  <span className="font-black text-4xl">{status.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t-3 border-black">
            <h3 className="brutal-heading text-sm mb-5">⚡ QUICK ACTIONS</h3>
            <div className="space-y-4">
              <button className="w-full brutal-btn bg-purple-300 hover:bg-purple-400 text-black py-4 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">➕</span>
                  <span className="font-black uppercase text-xs">Add Vehicle</span>
                </div>
              </button>
              <button className="w-full brutal-btn bg-cyan-300 hover:bg-cyan-400 text-black py-4 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">📊</span>
                  <span className="font-black uppercase text-xs">View Reports</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="brutal-card bg-white p-8">
        <h2 className="brutal-heading text-xl mb-6">📈 MONTHLY PERFORMANCE</h2>
        <div className="brutal-card-sm bg-gradient-to-br from-purple-100 to-cyan-100 p-12 text-center">
          <div className="text-7xl mb-8">📊</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="brutal-card-sm bg-white p-6">
              <p className="font-black uppercase text-xs text-gray-600 mb-3">Revenue</p>
              <p className="font-black text-3xl text-gray-900 mb-2">₹1,25,000</p>
              <p className="font-bold text-sm text-green-700">+12% ↑</p>
            </div>
            <div className="brutal-card-sm bg-white p-6">
              <p className="font-black uppercase text-xs text-gray-600 mb-3">Bookings</p>
              <p className="font-black text-3xl text-gray-900 mb-2">12</p>
              <p className="font-bold text-sm text-green-700">+15% ↑</p>
            </div>
            <div className="brutal-card-sm bg-white p-6">
              <p className="font-black uppercase text-xs text-gray-600 mb-3">Average Rating</p>
              <p className="font-black text-3xl text-gray-900 mb-2">4.8 ⭐</p>
              <p className="font-bold text-sm text-green-700">+0.2 ↑</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOverview;