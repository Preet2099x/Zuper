import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ active, setActive }) => (
  <aside className="w-72 bg-white rounded-xl shadow border border-gray-100 p-4 sticky top-6 h-[calc(100vh-48px)] overflow-auto">
    <div className="mb-6">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">JD</div>
      <div className="mt-3">
        <div className="font-semibold">Jai Desai</div>
        <div className="text-xs text-gray-500">Member since 2023</div>
      </div>
    </div>

    <nav className="space-y-1 mt-4">
      {[
        ['Overview', '🏠'],
        ['Rentals', '🚗'],
        ['Payments', '💳'],
        ['Rewards', '🎁'],
        ['Settings', '⚙️'],
      ].map(([label, emoji]) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 ${active === label ? 'bg-blue-50 border border-blue-100' : ''}`}
        >
          <span className="text-xl">{emoji}</span>
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </nav>

    <div className="mt-6 pt-4 border-t text-sm text-gray-500">
      <div>Help: <button className="text-blue-600 underline">Chat support</button></div>
      <div className="mt-2">App version 1.2.0</div>
    </div>
  </aside>
);

const CustomerDashboard = () => {
  const [active, setActive] = useState('Overview');

  const mock = {
    summary: {
      activeRentals: 2,
      upcomingPayments: 4500,
      loyaltyPoints: 120,
    },
    recentActivity: [
      { id: 1, text: '🚗 Rented Honda City for 3 days', when: '2 days ago' },
      { id: 2, text: '💸 Payment of ₹2,000 completed', when: '5 days ago' },
      { id: 3, text: '🏍️ Returned Royal Enfield', when: '1 week ago' },
    ],
    rentals: [
      { id: 'R-1001', vehicle: 'Honda City', emoji: '🚗', status: 'Active', until: 'Sep 18, 2025' },
      { id: 'R-1002', vehicle: 'Royal Enfield Classic 350', emoji: '🏍️', status: 'Active', until: 'Sep 22, 2025' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <Sidebar active={active} setActive={setActive} />

        <main>
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{active} <span className="text-gray-400 text-sm">— Customer dashboard</span></h1>
              <p className="text-gray-500 mt-1">A concise snapshot of your bookings, payments and rewards. Emojis included because life needs flavor.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Welcome back 👋</div>
              <button className="px-4 py-2 rounded-lg bg-white border">Profile</button>
            </div>
          </header>

          {/* Summary cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm text-gray-500">Active Rentals</h3>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{mock.summary.activeRentals} <span className="text-xl">🚗</span></div>
                  <div className="text-xs text-gray-400 mt-1">Currently on the road</div>
                </div>
                <div className="text-sm text-gray-400">Details</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <h3 className="text-sm text-gray-500">Upcoming Payments</h3>
              <div className="text-3xl font-bold text-green-600 mt-2">₹{mock.summary.upcomingPayments} <span className="text-xl">💳</span></div>
              <div className="text-xs text-gray-400 mt-1">Due this month</div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <h3 className="text-sm text-gray-500">Loyalty Points</h3>
              <div className="text-3xl font-bold text-yellow-500 mt-2">{mock.summary.loyaltyPoints} <span className="text-xl">🎁</span></div>
              <div className="text-xs text-gray-400 mt-1">Redeemable on next booking</div>
            </div>
          </div>

          {/* Rentals table and recent activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Rentals</h2>
                <button className="text-sm text-blue-600">View all</button>
              </div>

              <ul className="space-y-3">
                {mock.rentals.map(r => (
                  <li key={r.id} className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{r.emoji}</div>
                      <div>
                        <div className="font-medium">{r.vehicle}</div>
                        <div className="text-xs text-gray-400">Reservation #{r.id}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs ${r.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>{r.status}</div>
                      <div className="text-xs text-gray-400 mt-1">Until {r.until}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                {mock.recentActivity.map(a => (
                  <li key={a.id} className="flex items-start justify-between">
                    <div>
                      <div className="text-sm">{a.text}</div>
                      <div className="text-xs text-gray-400 mt-1">{a.when}</div>
                    </div>
                    <div className="text-xs text-gray-400">ID {a.id}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 text-sm text-gray-400">Tip: You can reschedule a rental up to 24 hours before pickup.</div>
            </aside>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
