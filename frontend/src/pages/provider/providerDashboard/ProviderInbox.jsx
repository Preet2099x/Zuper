import React, { useState } from 'react';

const ProviderInbox = () => {
  // Static data for conversations
  const staticConversations = [
    {
      _id: '1',
      otherUser: {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@email.com'
      },
      lastMessage: {
        message: 'Is the vehicle still available for next weekend?',
        createdAt: new Date('2025-11-26T10:30:00')
      }
    },
    {
      _id: '2',
      otherUser: {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@email.com'
      },
      lastMessage: {
        message: 'Thank you for the quick response!',
        createdAt: new Date('2025-11-25T15:45:00')
      }
    },
    {
      _id: '3',
      otherUser: {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@email.com'
      },
      lastMessage: {
        message: 'Can I extend my booking by 2 days?',
        createdAt: new Date('2025-11-24T09:20:00')
      }
    }
  ];

  // Static messages for each conversation
  const staticMessages = {
    '1': [
      {
        _id: 'm1',
        senderId: 'customer1',
        message: 'Hi, I am interested in renting your Swift for the weekend.',
        createdAt: new Date('2025-11-26T10:00:00')
      },
      {
        _id: 'm2',
        senderId: 'provider',
        message: 'Hello! Yes, the Swift is available. Which dates are you looking at?',
        createdAt: new Date('2025-11-26T10:15:00')
      },
      {
        _id: 'm3',
        senderId: 'customer1',
        message: 'Is the vehicle still available for next weekend?',
        createdAt: new Date('2025-11-26T10:30:00')
      }
    ],
    '2': [
      {
        _id: 'm4',
        senderId: 'customer2',
        message: 'Do you provide insurance with the rental?',
        createdAt: new Date('2025-11-25T15:00:00')
      },
      {
        _id: 'm5',
        senderId: 'provider',
        message: 'Yes, all our vehicles come with comprehensive insurance coverage.',
        createdAt: new Date('2025-11-25T15:30:00')
      },
      {
        _id: 'm6',
        senderId: 'customer2',
        message: 'Thank you for the quick response!',
        createdAt: new Date('2025-11-25T15:45:00')
      }
    ],
    '3': [
      {
        _id: 'm7',
        senderId: 'customer3',
        message: 'My booking is ending tomorrow. Can I extend my booking by 2 days?',
        createdAt: new Date('2025-11-24T09:20:00')
      },
      {
        _id: 'm8',
        senderId: 'provider',
        message: 'Let me check the availability and get back to you.',
        createdAt: new Date('2025-11-24T09:45:00')
      }
    ]
  };

  const [conversations] = useState(staticConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages(staticMessages[conv._id] || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      _id: `m${Date.now()}`,
      senderId: 'provider',
      message: messageInput,
      createdAt: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="p-6">
      <h1 className="brutal-heading text-3xl mb-6">💬 INBOX</h1>

      <div className="flex gap-4 h-[calc(100vh-150px)]">
        {/* Conversations List */}
        <div className="w-80 brutal-card bg-yellow-100 flex flex-col">
          <div className="p-5 border-b-3 border-black">
            <h2 className="brutal-heading text-lg">📨 MESSAGES</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-black uppercase text-xs">🚫 NO CONVERSATIONS</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 border-b-2 border-black hover:bg-white transition-colors text-left ${
                    selectedConversation?._id === conv._id ? 'bg-cyan-300 border-l-4 border-black' : 'bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-black bg-purple-400 text-white flex items-center justify-center font-black text-xs">
                      {getInitials(conv.otherUser?.firstName, conv.otherUser?.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase truncate">
                        {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                      </p>
                      <p className="text-[10px] font-bold truncate">
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        {selectedConversation ? (
          <div className="flex-1 brutal-card bg-white/30 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="p-5 bg-cyan-300 border-b-3 border-black flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-black bg-purple-400 text-white flex items-center justify-center font-black text-xs">
                {getInitials(selectedConversation.otherUser?.firstName, selectedConversation.otherUser?.lastName)}
              </div>
              <div>
                <p className="font-black text-sm uppercase">
                  {selectedConversation.otherUser?.firstName} {selectedConversation.otherUser?.lastName}
                </p>
                <p className="text-[10px] font-bold">{selectedConversation.otherUser?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-black uppercase text-xs">💭 NO MESSAGES YET</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === 'provider' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-5 py-3 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        msg.senderId === 'provider'
                          ? 'bg-cyan-300'
                          : 'bg-pink-200'
                      }`}
                    >
                      <p className="text-xs font-bold">{msg.message}</p>
                      <p className="text-[10px] font-bold mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-5 border-t-3 border-black bg-purple-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="TYPE YOUR MESSAGE..."
                  className="flex-1 px-5 py-3 border-3 border-black font-bold uppercase text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="brutal-btn bg-cyan-400 text-xs px-5 py-3"
                >
                  🚀 SEND
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 brutal-card bg-gray-100 flex items-center justify-center">
            <p className="font-black uppercase text-sm">👈 SELECT A CONVERSATION</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderInbox;