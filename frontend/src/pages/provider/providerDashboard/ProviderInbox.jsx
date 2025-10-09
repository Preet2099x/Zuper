import React, { useState } from 'react';

const ProviderInbox = () => {
  const [activeTab, setActiveTab] = useState('messages');

  // Static messages data for provider
  const messages = [
    {
      id: 1,
      type: 'booking',
      sender: 'John Doe',
      subject: 'Booking Request - Mercedes-Benz C-Class',
      message: 'Hi, I\'m interested in renting your Mercedes-Benz C-Class for a business trip next week. Is it available from Jan 20-25?',
      timestamp: '2024-01-15 14:30',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'notification',
      sender: 'Zuper Support',
      subject: 'Booking Confirmed',
      message: 'Your vehicle BMW X5 has been booked by Sarah Wilson. Pickup scheduled for tomorrow at 2:00 PM.',
      timestamp: '2024-01-14 09:15',
      read: true,
      priority: 'normal'
    },
    {
      id: 3,
      type: 'customer',
      sender: 'Emma Davis',
      subject: 'Question about Tesla Model Y',
      message: 'Does the Tesla come with supercharger access? Also, what\'s the range on a full charge?',
      timestamp: '2024-01-13 16:45',
      read: false,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'notification',
      sender: 'Zuper Support',
      subject: 'Payment Received',
      message: 'Payment of $630 has been received for your Tesla Model Y booking. Funds will be available in your account after the rental period.',
      timestamp: '2024-01-12 11:20',
      read: true,
      priority: 'normal'
    },
    {
      id: 5,
      type: 'system',
      sender: 'Zuper Platform',
      subject: 'Vehicle Verification Required',
      message: 'Please upload updated photos of your Volkswagen Golf for verification. This helps maintain trust with customers.',
      timestamp: '2024-01-11 08:30',
      read: false,
      priority: 'high'
    }
  ];

  // Static notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'John Doe wants to rent your Mercedes-Benz C-Class',
      timestamp: '2024-01-15 14:30',
      read: false
    },
    {
      id: 2,
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your bank account information for payouts',
      timestamp: '2024-01-14 12:00',
      read: true
    },
    {
      id: 3,
      type: 'promotion',
      title: 'New Feature Available',
      message: 'Try our new automated pricing feature to maximize earnings',
      timestamp: '2024-01-13 14:00',
      read: false
    },
    {
      id: 4,
      type: 'review',
      title: 'New Review Received',
      message: 'Mike Johnson left a 5-star review for your Audi A4',
      timestamp: '2024-01-12 09:00',
      read: true
    },
    {
      id: 5,
      type: 'system',
      title: 'Maintenance Reminder',
      message: 'Your Jeep Wrangler is due for scheduled maintenance',
      timestamp: '2024-01-11 10:00',
      read: false
    }
  ];

  const getMessageIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'notification':
        return '🔔';
      case 'customer':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'system':
        return '⚙️';
      case 'promotion':
        return '🎉';
      case 'review':
        return '⭐';
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
    <div className="p-8">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
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
                <div className="text-2xl mb-2">💬</div>
                <p className="font-medium text-gray-900">Compose Message</p>
                <p className="text-sm text-gray-600">Reply to customers</p>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <p className="font-medium text-gray-900">Manage Bookings</p>
                <p className="text-sm text-gray-600">View reservations</p>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="font-medium text-gray-900">Performance</p>
                <p className="text-sm text-gray-600">View analytics</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderInbox;