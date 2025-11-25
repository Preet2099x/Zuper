import React, { useState } from 'react';

const CustomerInbox = () => {
  const [activeTab, setActiveTab] = useState('messages');

  // Static messages data
  const messages = [
    {
      id: 1,
      type: 'booking',
      sender: 'Delhi Premium Cars',
      subject: 'Booking Confirmation - Maruti Suzuki Swift',
      message: 'Your booking for Maruti Suzuki Swift has been confirmed. Pickup: Tomorrow 10:00 AM at Connaught Place Branch.',
      timestamp: '2024-01-15 14:30',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'notification',
      sender: 'Zuper Support',
      subject: 'Vehicle Maintenance Update',
      message: 'The Hyundai Creta you rented last week has completed its scheduled maintenance and is ready for your next booking.',
      timestamp: '2024-01-14 09:15',
      read: true,
      priority: 'normal'
    },
    {
      id: 3,
      type: 'provider',
      sender: 'Mumbai Wheels',
      subject: 'Special Offer: Weekend Discount',
      message: 'Enjoy 20% off on all SUV rentals this weekend! Book now and save on your next adventure.',
      timestamp: '2024-01-13 16:45',
      read: true,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'booking',
      sender: 'Bangalore EcoDrive',
      subject: 'Booking Reminder',
      message: 'Reminder: Your Tata Nexon rental starts in 2 hours. Please arrive 15 minutes early for check-in.',
      timestamp: '2024-01-12 11:20',
      read: false,
      priority: 'high'
    },
    {
      id: 5,
      type: 'notification',
      sender: 'Zuper Support',
      subject: 'Payment Processed',
      message: 'Your payment of $375.00 for booking #BK-2024-001 has been successfully processed.',
      timestamp: '2024-01-11 08:30',
      read: true,
      priority: 'normal'
    }
  ];

  // Static notifications data
  const notifications = [
    {
      id: 1,
      type: 'system',
      title: 'New Feature Available',
      message: 'Extended booking hours now available at select locations.',
      timestamp: '2024-01-15 10:00',
      read: false
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Winter Special',
      message: 'Get 15% off on all bookings made before February 1st.',
      timestamp: '2024-01-14 12:00',
      read: true
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Document Expiry',
      message: 'Your driver\'s license expires in 30 days. Please update your profile.',
      timestamp: '2024-01-13 14:00',
      read: false
    },
    {
      id: 4,
      type: 'system',
      title: 'App Update',
      message: 'New version 2.1.0 is available with improved booking flow.',
      timestamp: '2024-01-12 09:00',
      read: true
    }
  ];

  const getMessageIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'notification':
        return '🔔';
      case 'provider':
        return '🚗';
      default:
        return '💬';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system':
        return '⚙️';
      case 'promotion':
        return '🎉';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-200 border-red-600';
      case 'normal':
        return 'bg-white border-black';
      default:
        return 'bg-white border-black';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="brutal-heading text-3xl mb-5">INBOX 📬</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setActiveTab('messages')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'messages'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          💬 MESSAGES ({messages.filter(m => !m.read).length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'notifications'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🔔 NOTIFICATIONS ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`brutal-card-sm p-4 cursor-pointer ${getPriorityColor(message.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getMessageIcon(message.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="brutal-heading text-sm">{message.sender}</h3>
                    {!message.read && (
                      <span className="brutal-badge bg-cyan-300 border-cyan-600 text-xs">
                        NEW
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-xs uppercase mb-2">{message.subject}</h4>
                  <p className="text-xs font-bold mb-2">{message.message}</p>
                  <p className="text-xs font-bold opacity-60">🕐 {message.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`brutal-card-sm p-4 cursor-pointer ${!notification.read ? 'bg-cyan-100 border-cyan-600' : 'bg-white border-black'}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="brutal-heading text-sm">{notification.title}</h3>
                    {!notification.read && (
                      <span className="brutal-badge bg-yellow-300 border-yellow-600 text-xs">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold mb-2">{notification.message}</p>
                  <p className="text-xs font-bold opacity-60">🕐 {notification.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="brutal-card bg-white p-6 mt-5">
        <h2 className="brutal-heading text-xl mb-4">QUICK ACTIONS ⚡</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="brutal-btn bg-cyan-300 hover:bg-cyan-400 p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <p className="font-black uppercase text-sm">Compose</p>
              <p className="text-xs font-bold">Send to provider</p>
            </div>
          </button>
          <button className="brutal-btn bg-green-300 hover:bg-green-400 p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-black uppercase text-sm">Support</p>
              <p className="text-xs font-bold">Get help quickly</p>
            </div>
          </button>
          <button className="brutal-btn bg-purple-300 hover:bg-purple-400 p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="font-black uppercase text-sm">Bookings</p>
              <p className="text-xs font-bold">Manage reservations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerInbox;