import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ active, setActive, user }) => (
  <aside className="w-72 bg-white rounded-xl shadow border border-gray-100 p-4 sticky top-6 h-[calc(100vh-48px)] overflow-auto">
    <div className="mb-6">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
        {user?.name ? user.name[0].toUpperCase() : "?"}
      </div>
      <div className="mt-3">
        <div className="font-semibold">{user?.name || "Guest User"}</div>
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
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 ${
            active === label ? 'bg-blue-50 border border-blue-100' : ''
          }`}
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // fallback dummy user
      setUser({ name: "Aarav Sharma", email: "aarav@example.com" });
    }
  }, []);

  const mock = {
    summary: { activeRentals: 2, upcomingPayments: 4500, loyaltyPoints: 120 },
    rentals: [
      { id: 'R-1001', vehicle: 'Honda City', emoji: '🚗', status: 'Active', until: 'Sep 18, 2025' },
      { id: 'R-1002', vehicle: 'Royal Enfield Classic 350', emoji: '🏍️', status: 'Active', until: 'Sep 22, 2025' },
    ],
    recentActivity: [
      { id: 1, text: '🚗 Rented Honda City for 3 days', when: '2 days ago' },
      { id: 2, text: '💸 Payment of ₹2,000 completed', when: '5 days ago' },
      { id: 3, text: '🏍️ Returned Royal Enfield Classic 350', when: '1 week ago' },
      { id: 4, text: '🎁 Earned 20 loyalty points', when: '2 weeks ago' },
    ],
    payments: [
      { id: 'P-2001', amount: 2000, status: 'Completed', date: 'Sep 08, 2025' },
      { id: 'P-2002', amount: 2500, status: 'Pending', date: 'Sep 15, 2025' },
    ],
    rewards: [
      { id: 'RW-1', points: 50, description: 'Signup bonus' },
      { id: 'RW-2', points: 70, description: 'Completed 3 rentals' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-lg font-semibold text-gray-700">Zuper Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Welcome back {user?.name?.split(" ")[0] || "👋"}</div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="px-4 py-2 rounded-lg bg-white border"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6"
      >
        <Sidebar active={active} setActive={setActive} user={user} />

        <main>
          {/* Active page changes based on sidebar */}
          {active === "Overview" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Overview</h1>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                  <h3 className="text-sm text-gray-500">Active Rentals</h3>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {mock.summary.activeRentals} 🚗
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                  <h3 className="text-sm text-gray-500">Upcoming Payments</h3>
                  <div className="text-3xl font-bold text-green-600 mt-2">
                    ₹{mock.summary.upcomingPayments} 💳
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                  <h3 className="text-sm text-gray-500">Loyalty Points</h3>
                  <div className="text-3xl font-bold text-yellow-500 mt-2">
                    {mock.summary.loyaltyPoints} 🎁
                  </div>
                </div>
              </div>
            </>
          )}

          {active === "Rentals" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Your Rentals</h1>
              <ul className="space-y-3">
                {mock.rentals.map(r => (
                  <li key={r.id} className="flex justify-between p-3 rounded-lg border bg-white">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{r.emoji}</div>
                      <div>
                        <div className="font-medium">{r.vehicle}</div>
                        <div className="text-xs text-gray-400">Reservation #{r.id}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{r.status} — until {r.until}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {active === "Payments" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Payments</h1>
              <table className="w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mock.payments.map(p => (
                    <tr key={p.id} className="border-t text-sm">
                      <td className="px-4 py-2">{p.id}</td>
                      <td className="px-4 py-2">₹{p.amount}</td>
                      <td className="px-4 py-2">{p.status}</td>
                      <td className="px-4 py-2">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {active === "Rewards" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Rewards</h1>
              <ul className="space-y-3">
                {mock.rewards.map(r => (
                  <li key={r.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="font-medium">{r.points} points</div>
                    <div className="text-xs text-gray-500">{r.description}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {active === "Settings" && (
            <h1 className="text-2xl font-bold">Settings (Coming Soon ⚙️)</h1>
          )}
        </main>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
