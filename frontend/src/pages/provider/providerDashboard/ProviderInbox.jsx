import React, { useState, useEffect } from 'react';

const ProviderInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/provider/login';
        return;
      }

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch conversations error:', err);
      if (!error) setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: messageInput })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessageInput('');
      await fetchMessages(selectedConversation._id);
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 absolute top-8 left-8">💬 Inbox</h1>

        {error && (
          <div className="absolute top-24 left-8 right-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-6 w-full pt-16">
          {/* Conversations List */}
          <div className="w-80 bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-center">No conversations yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation?._id === conv._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        {getInitials(conv.otherUser?.firstName, conv.otherUser?.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
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
            <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {getInitials(selectedConversation.otherUser?.firstName, selectedConversation.otherUser?.lastName)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedConversation.otherUser?.firstName} {selectedConversation.otherUser?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedConversation.otherUser?.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.senderId === selectedConversation.providerId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === selectedConversation.providerId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === selectedConversation.providerId ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-lg shadow-md flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderInbox;