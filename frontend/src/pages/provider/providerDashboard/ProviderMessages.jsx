import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ProviderMessages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchConversations();

    // Auto-refresh conversations every 10 seconds
    const conversationsInterval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(conversationsInterval);
  }, []);

  useEffect(() => {
    // Auto-refresh messages every 10 seconds when a conversation is selected
    if (selectedConversation?._id) {
      const messagesInterval = setInterval(() => {
        fetchMessages(selectedConversation._id);
      }, 10000);

      return () => clearInterval(messagesInterval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // If navigated with a customerId (from notification/contact button), open that conversation
    if (location.state?.customerId && conversations.length > 0) {
      const conv = conversations.find(c => c.customer._id === location.state.customerId);
      if (conv) {
        handleSelectConversation(conv);
      } else {
        // Create new conversation if it doesn't exist
        createOrOpenConversation(location.state.customerId);
      }
    }
  }, [location.state, conversations]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/provider`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrOpenConversation = async (customerId) => {
    try {
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/provider`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ customerId })
        }
      );

      if (!response.ok) throw new Error('Failed to create conversation');

      const conversation = await response.json();
      setSelectedConversation(conversation);
      fetchMessages(conversation._id);
      fetchConversations(); // Refresh conversations list
    } catch (error) {
      console.error('Create conversation error:', error);
      alert('Failed to create conversation');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/provider/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv._id);
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

    const token = localStorage.getItem('providerToken');
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/messages/upload/provider`,
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

      const token = localStorage.getItem('providerToken');
      const payload = imageUrl
        ? { messageType: 'image', imageUrl, content: messageInput.trim() || '' }
        : { messageType: 'text', content: messageInput.trim() };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/conversations/provider/${selectedConversation._id}/messages`,
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

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    const isOwnMessage = msg.senderModel === 'Provider';
    if (!isOwnMessage) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const canEdit = (msg) => {
    if (!msg.createdAt) return false;
    const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return timeDiff < fiveMinutes && !msg.deleted;
  };

  const handleEdit = () => {
    if (contextMenu?.message) {
      setEditingMessage(contextMenu.message);
      setEditContent(contextMenu.message.content || '');
    }
    closeContextMenu();
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim() || !editingMessage) return;

    try {
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/messages/provider/${editingMessage._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: editContent.trim() })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to edit message');
      }

      const updatedMessage = await response.json();
      setMessages(messages.map(m => m._id === updatedMessage._id ? updatedMessage : m));
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Edit message error:', error);
      alert(error.message || 'Failed to edit message');
    }
  };

  const handleDelete = async () => {
    if (!contextMenu?.message) return;

    if (!confirm('Are you sure you want to delete this message?')) {
      closeContextMenu();
      return;
    }

    try {
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/messages/messages/provider/${contextMenu.message._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete message');

      await fetchMessages(selectedConversation._id);
      closeContextMenu();
    } catch (error) {
      console.error('Delete message error:', error);
      alert('Failed to delete message');
    }
  };

  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
      <h1 className="brutal-heading text-3xl mb-6">📬 MESSAGES</h1>

      <div className="flex gap-4 h-[calc(100vh-150px)]">
        {/* Conversations List */}
        <div className="w-80 brutal-card bg-yellow-100 flex flex-col">
          <div className="p-5 border-b-3 border-black">
            <h2 className="brutal-heading text-lg">📨 MESSAGES</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-6xl mb-3">📭</div>
              <p className="font-black uppercase text-xs text-center">NO CONVERSATIONS YET</p>
              <p className="font-bold text-xs text-center mt-2 text-gray-600">
                Customers will message you about vehicle rentals
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const customer = conv.customer;
                const displayName = customer?.name || 'Customer';
                
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b-2 border-black hover:bg-white transition-colors text-left ${
                      selectedConversation?._id === conv._id ? 'bg-cyan-300 border-l-4 border-black' : 'bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-black bg-purple-400 text-white flex items-center justify-center font-black text-xs">
                        {getInitials(customer?.name?.split(' ')[0] || 'C', customer?.name?.split(' ')[1] || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs uppercase truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] font-bold truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
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
        {selectedConversation ? (
          <div className="flex-1 brutal-card bg-white/30 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="p-5 bg-cyan-300 border-b-3 border-black flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-black bg-purple-400 text-white flex items-center justify-center font-black text-xs">
                {getInitials(
                  selectedConversation.customer?.name?.split(' ')[0] || 'C',
                  selectedConversation.customer?.name?.split(' ')[1] || 'U'
                )}
              </div>
              <div>
                <p className="font-black text-sm uppercase">
                  {selectedConversation.customer?.name || 'Customer'}
                </p>
                <p className="text-[10px] font-bold">{selectedConversation.customer?.email || ''}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="font-black uppercase text-xs text-gray-600">NO MESSAGES YET</p>
                  <p className="font-bold text-xs text-gray-500 mt-1">Start a conversation with this customer</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderModel === 'Provider';
                  const isEditing = editingMessage?._id === msg._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                        className={`max-w-xs px-5 py-3 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                          isOwnMessage
                            ? 'bg-cyan-300'
                            : 'bg-pink-200'
                        } ${msg.deleted ? 'opacity-60 italic' : ''}`}
                      >
                        {msg.messageType === 'image' && msg.imageUrl && !msg.deleted && (
                          <img
                            src={msg.imageUrl}
                            alt="Message attachment"
                            className="max-w-full h-auto border-2 border-black mb-2 cursor-pointer hover:opacity-90"
                            onClick={() => window.open(msg.imageUrl, '_blank')}
                          />
                        )}
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border-2 border-black font-bold text-xs"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleEditSubmit}
                                className="brutal-btn bg-green-400 hover:bg-green-500 px-3 py-1 text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessage(null);
                                  setEditContent('');
                                }}
                                className="brutal-btn bg-gray-300 hover:bg-gray-400 px-3 py-1 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content && (
                              <p className="text-xs font-bold">{msg.content}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                              {msg.edited && <span className="text-[10px] opacity-70">(edited)</span>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-5 border-t-3 border-black bg-purple-100">
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
                  id="provider-image-upload"
                />
                <label
                  htmlFor="provider-image-upload"
                  className="brutal-btn bg-purple-400 hover:bg-purple-500 px-4 py-3 font-black uppercase text-xs cursor-pointer"
                >
                  📷
                </label>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-3 border-3 border-black font-bold text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 normal-case"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={(!messageInput.trim() && !selectedImage) || sending}
                  className="brutal-btn bg-cyan-400 text-xs px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? '⏳' : '🚀'} SEND
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border-3 border-black shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {canEdit(contextMenu.message) && (
            <button
              onClick={handleEdit}
              className="block w-full text-left px-4 py-2 font-bold text-sm hover:bg-purple-200 border-b-2 border-black"
            >
              ✏️ Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 font-bold text-sm hover:bg-red-200 text-red-600"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderMessages;