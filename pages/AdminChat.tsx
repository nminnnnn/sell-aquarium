import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Search } from 'lucide-react';
import { useApp } from '../context';
import { Message, User } from '../types';

const AdminChat = () => {
  const { auth } = useApp();
  const [conversations, setConversations] = useState<{ userId: string; userName: string; lastMessage: Message | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (!auth.user || auth.user.role !== 'admin') {
      console.log('AdminChat: useEffect - Not admin, skipping');
      return;
    }
    
    console.log('AdminChat: useEffect - Loading conversations');
    // Load immediately
    loadConversations();
    
    // Listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('chat_')) {
        console.log('AdminChat: Storage event detected:', e.key, e.newValue);
        loadConversations();
        if (selectedUserId && e.key === `chat_${selectedUserId}`) {
          loadMessages(selectedUserId);
        }
      }
    };
    
    // Also listen for custom storage events (for same-tab communication)
    const handleCustomStorage = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (storageEvent.key && storageEvent.key.startsWith('chat_')) {
        console.log('AdminChat: Custom storage event detected:', storageEvent.key);
        loadConversations();
        if (selectedUserId && storageEvent.key === `chat_${selectedUserId}`) {
          loadMessages(selectedUserId);
        }
      }
    };
    
    // Listen for BroadcastChannel messages
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('chat_messages');
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'message_saved' && event.data.key) {
          console.log('AdminChat: BroadcastChannel message received:', event.data.key);
          loadConversations();
          if (selectedUserId && event.data.key === `chat_${selectedUserId}`) {
            loadMessages(selectedUserId);
          }
        }
      };
    } catch (e) {
      console.log('AdminChat: BroadcastChannel not supported');
    }
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorage);
    
    // Auto-refresh conversations every 500ms to get new messages faster
    const interval = setInterval(() => {
      if (auth.user && auth.user.role === 'admin') {
        console.log('AdminChat: Auto-refresh - Loading conversations');
        loadConversations();
        if (selectedUserId) {
          loadMessages(selectedUserId);
        }
      }
    }, 500);
    
    return () => {
      console.log('AdminChat: Cleaning up interval and storage listener');
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [selectedUserId, auth.user?.id, auth.user?.role]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceFromBottom < 120);
  };

  const loadConversations = () => {
    if (!auth.user || auth.user.role !== 'admin') {
      console.log('AdminChat: Not admin or not authenticated');
      return;
    }
    
    // Get all conversations from localStorage
    const allKeys = Object.keys(localStorage);
    console.log('AdminChat: All localStorage keys:', allKeys);
    console.log('AdminChat: Current origin:', window.location.origin);
    const chatKeys = allKeys.filter(key => key.startsWith('chat_'));
    
    console.log('AdminChat: Found chat keys:', chatKeys);
    console.log('AdminChat: Admin user ID:', auth.user.id);
    
    // Debug: Check each chat key
    chatKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`AdminChat: Key ${key} has value:`, value ? JSON.parse(value) : 'null');
    });
    
    // Warning if no chat keys found but we expect some
    if (chatKeys.length === 0) {
      console.warn('AdminChat: WARNING - No chat keys found in localStorage!');
      console.warn('AdminChat: This might mean:');
      console.warn('  1. Customer and Admin are using different browsers');
      console.warn('  2. One is using incognito/private mode');
      console.warn('  3. Different origins (localhost vs 127.0.0.1)');
      console.warn('  4. Customer has not sent any messages yet');
      console.warn('AdminChat: Make sure both tabs are:');
      console.warn('  - Same browser (Chrome, Firefox, etc.)');
      console.warn('  - Same mode (both normal or both incognito)');
      console.warn('  - Same origin (both http://localhost:5173 or both http://127.0.0.1:5173)');
    }
    
    const convs: { userId: string; userName: string; lastMessage: Message | null }[] = [];
    
    chatKeys.forEach(key => {
      const userId = key.replace('chat_', '');
      // Skip if it's admin's own chat (admin shouldn't chat with themselves)
      // Compare as strings to avoid type mismatch
      if (String(userId) === String(auth.user?.id)) {
        console.log(`AdminChat: Skipping admin's own chat: ${key}`);
        return;
      }
      
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const msgs: Message[] = JSON.parse(stored);
          if (msgs && Array.isArray(msgs) && msgs.length > 0) {
            // Debug: Log messages to see what we're getting
            console.log(`AdminChat: Loading conversation ${key}:`, msgs);
            
            // Get user name from first customer message (not admin message)
            // Simply check if there's any message that's not from admin
            const customerMsg = msgs.find(m => {
              // Compare as strings to avoid type mismatch
              const isCustomer = m.senderRole === 'customer' || String(m.senderId) !== String(auth.user?.id);
              console.log(`AdminChat: Checking message ${m.id}: senderRole=${m.senderRole}, senderId=${m.senderId} (${typeof m.senderId}), adminId=${auth.user?.id} (${typeof auth.user?.id}), isCustomer=${isCustomer}`);
              return isCustomer;
            });
            
            // Only show conversations that have at least one customer message
            if (customerMsg) {
              const userName = customerMsg.senderName;
              const lastMsg = msgs[msgs.length - 1];
              console.log(`AdminChat: Adding conversation for user ${userId} (${userName})`);
              convs.push({ userId, userName, lastMessage: lastMsg });
            } else {
              // Debug: Log if no customer message found
              console.log(`AdminChat: No customer message found in ${key}, all messages:`, msgs.map(m => ({ 
                role: m.senderRole, 
                name: m.senderName, 
                senderId: m.senderId,
                adminId: auth.user?.id 
              })));
            }
          } else {
            console.log(`AdminChat: No messages in ${key}`);
          }
        } else {
          console.log(`AdminChat: No stored data for ${key}`);
        }
      } catch (error) {
        console.error(`AdminChat: Error loading conversation ${key}:`, error);
      }
    });

    // Sort by last message time
    convs.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    setConversations(convs);
    
    // Auto-select first conversation
    if (convs.length > 0 && !selectedUserId) {
      setSelectedUserId(convs[0].userId);
    }
  };

  const loadMessages = (userId: string) => {
    try {
      const stored = localStorage.getItem(`chat_${userId}`);
      if (stored) {
        const msgs: Message[] = JSON.parse(stored);
        const previousLength = messages.length;
        const prevLastId = messages[messages.length - 1]?.id;
        const nextLastId = msgs[msgs.length - 1]?.id;

        // Chỉ setMessages nếu có thay đổi (độ dài khác hoặc id tin nhắn cuối khác)
        const changed = previousLength !== msgs.length || prevLastId !== nextLastId;
        if (changed) {
          setMessages(msgs);
        }
        
        // Auto-scroll if new messages arrived
        if (changed && msgs.length > previousLength && isAtBottom) {
          setTimeout(() => scrollToBottom(), 100);
        }
        
        // Mark admin messages as read (but don't modify customer messages)
        const updatedMsgs = msgs.map(msg => ({
          ...msg,
          read: msg.senderRole === 'admin' ? true : msg.read
        }));
        localStorage.setItem(`chat_${userId}`, JSON.stringify(updatedMsgs));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(`Error loading messages for ${userId}:`, error);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || !auth.user) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedUserId,
      senderId: auth.user.id,
      senderName: auth.user.name,
      senderRole: 'admin',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${selectedUserId}`, JSON.stringify(updatedMessages));
    setNewMessage('');
    
    // Refresh conversations
    loadConversations();
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);
  const filteredConversations = conversations.filter(c =>
    c.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                      selectedUserId === conv.userId ? 'bg-brand-light border-l-4 border-l-brand-cyan' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{conv.userName}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.message}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-bold text-gray-900">
                    {selectedConversation?.userName || 'Customer'}
                  </h3>
                  <p className="text-sm text-gray-500">Customer ID: {selectedUserId}</p>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages in this conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-3 rounded-2xl ${
                              isOwn
                                ? 'bg-gradient-to-r from-brand-cyan to-brand-ocean text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            } shadow-sm`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1 opacity-80">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <form onSubmit={handleSend} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-brand-cyan to-brand-ocean text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default AdminChat;

