import React from "react";

const CustomerOverview = () => {
  const stats = [
    { title: "Active Contracts", value: "3", emoji: "📄", color: "bg-blue-400" },
    { title: "Vehicles Managed", value: "5", emoji: "🚗", color: "bg-green-400" },
    { title: "Total Spent", value: "₹1,25,000", emoji: "💰", color: "bg-yellow-400" },
    { title: "Pending Payments", value: "1", emoji: "⏰", color: "bg-red-400" },
  ];

  const recentActivity = [
    { id: 1, action: "New contract signed", vehicle: "Maruti Suzuki Swift", date: "2024-01-15", status: "active", emoji: "✅" },
    { id: 2, action: "Payment processed", vehicle: "Hyundai i20", date: "2024-01-12", status: "completed", emoji: "💳" },
    { id: 3, action: "Vehicle inspection", vehicle: "Tata Nexon", date: "2024-01-10", status: "scheduled", emoji: "🔍" },
    { id: 4, action: "Contract renewed", vehicle: "Mahindra Scorpio", date: "2024-01-08", status: "active", emoji: "🔄" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="brutal-heading text-3xl mb-5">DASHBOARD OVERVIEW 📊</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`brutal-card ${stat.color} p-4 transform ${index % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0 transition-transform`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.emoji}</span>
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-lg border-2 border-white">
                {stat.value.length <= 2 ? stat.value : stat.value.charAt(0)}
              </div>
            </div>
            <p className="font-black uppercase text-xs mt-3">{stat.title}</p>
            <p className="text-2xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="brutal-card bg-white p-5 mb-6">
        <h2 className="brutal-heading text-xl mb-4">RECENT ACTIVITY 📋</h2>
        <div className="space-y-2">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="brutal-card-sm bg-gray-50 p-3 flex items-center justify-between hover:bg-yellow-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.emoji}</span>
                <div>
                  <p className="font-black uppercase text-xs">{activity.action}</p>
                  <p className="font-bold text-xs text-gray-600">{activity.vehicle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xs text-gray-500">{activity.date}</p>
                <span className={`inline-flex px-2 py-0.5 mt-1 font-black uppercase text-xs border-2 border-black ${
                  activity.status === "active" ? "bg-green-300" :
                  activity.status === "completed" ? "bg-blue-300" :
                  "bg-yellow-300"
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="brutal-card bg-white p-5">
        <h2 className="brutal-heading text-xl mb-4">QUICK ACTIONS ⚡</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="brutal-btn bg-blue-500 hover:bg-blue-600 text-white py-3 px-4">
            <span className="font-black uppercase text-sm">🔍 Search Vehicles</span>
          </button>
          <button className="brutal-btn bg-green-500 hover:bg-green-600 text-white py-3 px-4">
            <span className="font-black uppercase text-sm">📄 My Contracts</span>
          </button>
          <button className="brutal-btn bg-purple-500 hover:bg-purple-600 text-white py-3 px-4">
            <span className="font-black uppercase text-sm">💬 Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
