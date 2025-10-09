import React, { useState } from 'react';

const ProviderEarnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Static earnings data
  const earningsData = {
    month: {
      total: '₹1,25,000',
      change: '+12%',
      changeType: 'positive',
      bookings: 12,
      averageBooking: '₹10,417',
      period: 'January 2024'
    },
    quarter: {
      total: '₹3,75,000',
      change: '+18%',
      changeType: 'positive',
      bookings: 38,
      averageBooking: '₹9,868',
      period: 'Q1 2024'
    },
    year: {
      total: '₹14,25,000',
      change: '+25%',
      changeType: 'positive',
      bookings: 142,
      averageBooking: '₹10,035',
      period: '2024'
    }
  };

  const recentTransactions = [
    {
      id: 1,
      date: '2024-01-15',
      customer: 'Rajesh Kumar',
      vehicle: 'Maruti Suzuki Swift',
      amount: '₹8,550',
      status: 'completed',
      type: 'booking'
    },
    {
      id: 2,
      date: '2024-01-14',
      customer: 'Priya Sharma',
      amount: '₹750',
      status: 'completed',
      type: 'fee',
      description: 'Platform fee'
    },
    {
      id: 3,
      date: '2024-01-12',
      customer: 'Amit Singh',
      vehicle: 'Hyundai Creta',
      amount: '₹14,250',
      status: 'completed',
      type: 'booking'
    },
    {
      id: 4,
      date: '2024-01-10',
      customer: 'Kavita Patel',
      vehicle: 'Tata Nexon',
      amount: '₹18,900',
      status: 'pending',
      type: 'booking'
    },
    {
      id: 5,
      date: '2024-01-08',
      customer: 'Vikram Gupta',
      amount: '₹1,500',
      status: 'completed',
      type: 'fee',
      description: 'Insurance claim payout'
    }
  ];

  const monthlyBreakdown = [
    { month: 'Jan', earnings: 125000, bookings: 12 },
    { month: 'Dec', earnings: 112500, bookings: 11 },
    { month: 'Nov', earnings: 123000, bookings: 13 },
    { month: 'Oct', earnings: 109500, bookings: 10 },
    { month: 'Sep', earnings: 119000, bookings: 12 },
    { month: 'Aug', earnings: 105000, bookings: 9 }
  ];

  const currentData = earningsData[selectedPeriod];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return '💰';
      case 'fee':
        return '💳';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              Download Report
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              Export Data
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedPeriod === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Quarter
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedPeriod === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.total}</p>
                <p className={`text-sm font-medium ${
                  currentData.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentData.change} from last {selectedPeriod}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.bookings}</p>
                <p className="text-sm text-gray-600">{currentData.period}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average per Booking</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.averageBooking}</p>
                <p className="text-sm text-gray-600">Revenue per rental</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-3xl font-bold text-gray-900">$215</p>
                <p className="text-sm text-gray-600">5% of earnings</p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Earnings</h2>
            <div className="space-y-4">
              {monthlyBreakdown.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-700 w-12">{month.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(month.earnings / 4250) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">${month.earnings.toLocaleString()}</span>
                    <span className="text-sm text-gray-600 ml-2">({month.bookings} bookings)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type === 'booking' ? transaction.vehicle : transaction.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.customer} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{transaction.amount}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payout Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">🏦</div>
              <p className="font-medium text-gray-900">Bank Transfer</p>
              <p className="text-sm text-gray-600">Monthly payouts</p>
              <p className="text-sm font-medium text-green-600 mt-1">Next payout: Jan 31</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <p className="font-medium text-gray-900">$3,872.50</p>
              <p className="text-sm text-gray-600">Available for payout</p>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition duration-200">
                Request Payout
              </button>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-900">Tax Documents</p>
              <p className="text-sm text-gray-600">1099 form available</p>
              <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-1 px-3 rounded text-sm transition duration-200">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;