import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerMessages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  console.log('CustomerMessages - location.state:', location.state);
  console.log('CustomerMessages - conversations count:', conversations.length);

  useEffect(() => {
    console.log('CustomerMessages - Initial mount, fetching conversations');
    fetchConversations();
  }, []);

  useEffect(() => {
    // Check if we need to create/open a conversation with a specific provider
    if (location.state?.providerId && conversations.length >= 0) {
      console.log('Detected provider ID in navigation state:', location.state.providerId);
      
      // First check if conversation already exists
      const existingConv = conversations.find(c => c.provider?._id === location.state.providerId);
      
      if (existingConv) {
        console.log('Found existing conversation, opening it');
        // Open existing conversation
        handleSelectConversation(existingConv);
      } else {
        console.log('No existing conversation, creating new one');
        // Create new conversation
        createOrOpenConversation(location.state.providerId);
      }
      
      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, conversations]);

  const fetchConversations = async () => {
    try {
      console.log('fetchConversations - Starting...');
      const token = localStorage.getItem('customerToken');
      console.log('fetchConversations - Token exists:', !!token);
      console.log('fetchConversations - API URL:', `${import.meta.env.VITE_API_BASE}/api/messages/conversations/customer`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/messages/conversations/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('fetchConversations - Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('fetchConversations - Error response:', errorData);
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      console.log('fetchConversations - Conversations received:', data);
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      setLoading(false);
    }
  };

  const createOrOpenConversation = async (providerId) => {
    try {
      console.log('Creating/opening conversation with provider:', providerId);
      setLoading(true);
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/messages/conversations/customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ providerId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create conversation:', errorData);
        throw new Error(errorData.message || 'Failed to create conversation');
      }

      const conversation = await response.json();
      console.log('Conversation created/retrieved:', conversation);
      
      // Refresh conversations list to include the new one
      await fetchConversations();
      
      // Select and open the conversation
      setSelectedConversation(conversation);
      await fetchMessages(conversation._id);
      
      setLoading(false);
    } catch (error) {
      console.error('Create conversation error:', error);
      alert('Failed to start conversation with provider: ' + error.message);
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    console.log('handleSelectConversation - Selecting conversation:', conv);
    setSelectedConversation(conv);
    await fetchMessages(conv._id);
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log('fetchMessages - Fetching messages for conversation:', conversationId);
      const token = localStorage.getItem('customerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/customer/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('fetchMessages - Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      console.log('fetchMessages - Messages received:', data);
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('image', selectedImage);

    const token = localStorage.getItem('customerToken');
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/messages/upload/customer`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }
    );

    if (!response.ok) throw new Error('Failed to upload image');

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedImage) || !selectedConversation) return;

    setSending(true);
    setUploadingImage(!!selectedImage);
    
    try {
      let imageUrl = null;
      
      // Upload image first if selected
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const token = localStorage.getItem('customerToken');
      const payload = imageUrl
        ? { messageType: 'image', imageUrl, content: messageInput.trim() || '' }
        : { messageType: 'text', content: messageInput.trim() };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/customer/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessageInput('');
      handleRemoveImage();
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getCurrentUserId = () => {
    // Get current user ID from localStorage or token
    return localStorage.getItem('userId');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="brutal-heading text-xl">LOADING MESSAGES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="brutal-heading text-3xl mb-6">💬 MESSAGES</h1>

      <div className="flex gap-4 h-[calc(100vh-150px)]">
        {/* Conversations List */}
        <div className="w-80 brutal-card bg-yellow-100 flex flex-col">
          <div className="p-5 border-b-3 border-black">
            <h2 className="brutal-heading text-lg">📨 CONVERSATIONS</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-6xl mb-3">📭</div>
              <p className="font-black uppercase text-xs text-center">NO CONVERSATIONS YET</p>
              <p className="font-bold text-xs text-center mt-2 text-gray-600">
                Start messaging providers from vehicle listings
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const provider = conv.provider;
                const displayName = provider?.businessName || `${provider?.name || 'Provider'}`;
                
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b-3 border-black text-left transition-all hover:bg-yellow-200 ${
                      selectedConversation?._id === conv._id ? 'bg-yellow-300' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-yellow-400 border-3 border-black flex items-center justify-center flex-shrink-0">
                        <span className="font-black text-xs">
                          {getInitials(provider?.name?.split(' ')[0] || 'P', provider?.name?.split(' ')[1] || 'R')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{displayName}</p>
                        <p className="text-xs font-bold text-gray-600 truncate mt-1">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        <p className="text-xs font-bold text-gray-500 mt-1">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 brutal-card bg-white flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="brutal-heading text-xl">SELECT A CONVERSATION</p>
              <p className="font-bold text-sm text-gray-600 mt-2">
                Choose a provider to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="p-5 border-b-3 border-black bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 border-3 border-black flex items-center justify-center">
                    <span className="font-black text-xs">
                      {getInitials(
                        selectedConversation.provider?.name?.split(' ')[0] || 'P',
                        selectedConversation.provider?.name?.split(' ')[1] || 'R'
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-lg">
                      {selectedConversation.provider?.businessName || selectedConversation.provider?.name || 'Provider'}
                    </p>
                    <p className="text-xs font-bold text-gray-600">
                      {selectedConversation.provider?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-yellow-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="font-black uppercase text-xs text-gray-600">NO MESSAGES YET</p>
                    <p className="font-bold text-xs text-gray-500 mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.senderModel === 'Customer';
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-4 border-3 border-black ${
                            isOwnMessage
                              ? 'bg-yellow-300 ml-auto'
                              : 'bg-white'
                          }`}
                        >
                          {msg.messageType === 'image' && msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Message attachment"
                              className="max-w-full h-auto border-2 border-black mb-2 cursor-pointer hover:opacity-90"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          )}
                          {msg.content && (
                            <p className="font-bold text-sm mb-2">{msg.content}</p>
                          )}
                          <p className="text-xs font-black text-gray-600">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-5 border-t-3 border-black bg-white">
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-auto border-3 border-black"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full border-2 border-black font-black text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="brutal-btn bg-blue-300 hover:bg-blue-400 px-4 py-3 font-black uppercase text-sm cursor-pointer"
                  >
                    📷
                  </label>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 border-3 border-black font-bold text-sm focus:outline-none focus:ring-3 focus:ring-yellow-400"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={(!messageInput.trim() && !selectedImage) || sending}
                    className="brutal-btn bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-black uppercase text-sm"
                  >
                    {uploadingImage ? '⏳' : '📤'} SEND
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;
