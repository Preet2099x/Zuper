import React, { useState } from 'react';
import CustomerSidebar from './CustomerSidebar';

const CustomerInbox = () => {
  const [activeTab, setActiveTab] = useState('messages');

  // Static messages data
  const messages = [
    {
      id: 1,
      type: 'booking',
      sender: 'Premium Cars Ltd',
      subject: 'Booking Confirmation - Mercedes-Benz C-Class',
      message: 'Your booking for Mercedes-Benz C-Class has been confirmed. Pickup: Tomorrow 10:00 AM at Downtown Branch.',
      timestamp: '2024-01-15 14:30',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'notification',
      sender: 'Zuper Support',
      subject: 'Vehicle Maintenance Update',
      message: 'The BMW 3 Series you rented last week has completed its scheduled maintenance and is ready for your next booking.',
      timestamp: '2024-01-14 09:15',
      read: true,
      priority: 'normal'
    },
    {
      id: 3,
      type: 'provider',
      sender: 'City Wheels',
      subject: 'Special Offer: Weekend Discount',
      message: 'Enjoy 20% off on all SUV rentals this weekend! Book now and save on your next adventure.',
      timestamp: '2024-01-13 16:45',
      read: true,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'booking',
      sender: 'EcoDrive',
      subject: 'Booking Reminder',
      message: 'Reminder: Your Tesla Model Y rental starts in 2 hours. Please arrive 15 minutes early for check-in.',
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
        return 'border-red-500 bg-red-50';
      case 'normal':
        return 'border-gray-300 bg-white';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CustomerSidebar logo="/zuper.png" />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Inbox</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === 'messages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Messages ({messages.filter(m => !m.read).length})
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === 'notifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Notifications ({notifications.filter(n => !n.read).length})
                </button>
              </nav>
            </div>

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${getPriorityColor(message.priority)} ${!message.read ? 'border-l-4' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{getMessageIcon(message.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{message.sender}</h3>
                            {!message.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>
                          <h4 className="text-md font-medium text-gray-800 mb-2">{message.subject}</h4>
                          <p className="text-gray-600 text-sm mb-2">{message.message}</p>
                          <p className="text-xs text-gray-500">{message.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M5 12h.01M5 12h.01M12 12h.01M12 12h.01M12 12h.01M19 12h.01M19 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${!notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M5 12h.01M5 12h.01M12 12h.01M12 12h.01M12 12h.01M19 12h.01M19 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">📧</div>
                  <p className="font-medium text-gray-900">Compose Message</p>
                  <p className="text-sm text-gray-600">Send to provider</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <p className="font-medium text-gray-900">Contact Support</p>
                  <p className="text-sm text-gray-600">Get help quickly</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="font-medium text-gray-900">View Bookings</p>
                  <p className="text-sm text-gray-600">Manage reservations</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInbox;