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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="brutal-heading text-3xl">💰 EARNINGS</h1>
          <div className="flex space-x-3">
            <button className="brutal-btn bg-green-300 text-xs">
              📥 DOWNLOAD REPORT
            </button>
            <button className="brutal-btn bg-purple-300 text-xs">
              📤 EXPORT DATA
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="brutal-card p-5 mb-6 bg-yellow-100">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`brutal-btn text-xs px-5 py-3 ${
                selectedPeriod === 'month'
                  ? 'bg-cyan-400'
                  : 'bg-white'
              }`}
            >
              📅 THIS MONTH
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`brutal-btn text-xs px-5 py-3 ${
                selectedPeriod === 'quarter'
                  ? 'bg-cyan-400'
                  : 'bg-white'
              }`}
            >
              📊 THIS QUARTER
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`brutal-btn text-xs px-5 py-3 ${
                selectedPeriod === 'year'
                  ? 'bg-cyan-400'
                  : 'bg-white'
              }`}
            >
              📈 THIS YEAR
            </button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="brutal-card p-4 bg-green-200">
            <p className="text-[10px] font-black uppercase mb-2">💰 TOTAL EARNINGS</p>
            <p className="text-3xl font-black mb-1">{currentData.total}</p>
            <p className={`text-xs font-bold ${
              currentData.changeType === 'positive' ? 'text-green-800' : 'text-red-800'
            }`}>
              {currentData.change} from last {selectedPeriod}
            </p>
          </div>

          <div className="brutal-card p-4 bg-blue-200">
            <p className="text-[10px] font-black uppercase mb-2">📅 TOTAL BOOKINGS</p>
            <p className="text-3xl font-black mb-1">{currentData.bookings}</p>
            <p className="text-xs font-bold">{currentData.period}</p>
          </div>

          <div className="brutal-card p-4 bg-purple-200">
            <p className="text-[10px] font-black uppercase mb-2">📊 AVG PER BOOKING</p>
            <p className="text-3xl font-black mb-1">{currentData.averageBooking}</p>
            <p className="text-xs font-bold">Revenue per rental</p>
          </div>

          <div className="brutal-card p-4 bg-red-200">
            <p className="text-[10px] font-black uppercase mb-2">💳 PLATFORM FEES</p>
            <p className="text-3xl font-black mb-1">$215</p>
            <p className="text-xs font-bold">5% of earnings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Chart */}
          <div className="brutal-card p-6 bg-cyan-100">
            <h2 className="brutal-heading text-xl mb-6">📈 MONTHLY EARNINGS</h2>
            <div className="space-y-4">
              {monthlyBreakdown.map((month, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="font-black text-xs w-10">{month.month}</span>
                  <div className="flex-1 bg-white border-2 border-black h-4 max-w-[200px]">
                    <div
                      className="bg-cyan-400 h-full"
                      style={{ width: `${Math.min((month.earnings / 125000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="font-black text-sm">${month.earnings.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] font-bold min-w-[30px]">({month.bookings})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="brutal-card p-6 bg-pink-100">
            <h2 className="brutal-heading text-xl mb-6">💸 RECENT TRANSACTIONS</h2>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="brutal-card-sm p-3 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-lg flex-shrink-0">{getTypeIcon(transaction.type)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-xs uppercase truncate">
                          {transaction.type === 'booking' ? transaction.vehicle : transaction.description}
                        </p>
                        <p className="text-[10px] font-bold truncate">
                          {transaction.customer} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-sm whitespace-nowrap">{transaction.amount}</p>
                      <span className={`brutal-badge ${transaction.status === 'completed' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payout Information */}
        <div className="brutal-card p-6 mt-6 bg-orange-100">
          <h2 className="brutal-heading text-xl mb-6">🏦 PAYOUT INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="brutal-card-sm p-4 bg-white text-center">
              <div className="text-2xl mb-3">🏦</div>
              <p className="font-black text-xs uppercase mb-2">Bank Transfer</p>
              <p className="text-[10px] font-bold mb-2">Monthly payouts</p>
              <p className="text-xs font-black text-green-800">Next: Jan 31</p>
            </div>
            <div className="brutal-card-sm p-4 bg-green-200 text-center">
              <div className="text-2xl mb-3">💰</div>
              <p className="font-black text-lg mb-2">$3,872.50</p>
              <p className="text-[10px] font-bold mb-3">Available for payout</p>
              <button className="brutal-btn bg-cyan-400 text-[10px]">
                💸 REQUEST PAYOUT
              </button>
            </div>
            <div className="brutal-card-sm p-4 bg-white text-center">
              <div className="text-2xl mb-3">📊</div>
              <p className="font-black text-xs uppercase mb-2">Tax Documents</p>
              <p className="text-[10px] font-bold mb-3">1099 form available</p>
              <button className="brutal-btn bg-purple-300 text-[10px]">
                📥 DOWNLOAD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;