import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Search } from 'lucide-react';
import { useApp } from '../context';
import { Message, User } from '../types';
import { chatService } from '../services/api';

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
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      if (selectedUserId) {
        loadMessages(selectedUserId);
      }
    }, 800);

    return () => clearInterval(interval);
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

  const loadConversations = async () => {
    if (!auth.user || auth.user.role !== 'admin') {
      console.log('AdminChat: Not admin or not authenticated');
      return;
    }
    
    const convs: { userId: string; userName: string; lastMessage: Message | null }[] = [];
    try {
      const msgs: Message[] = await chatService.getAllMessages();

      const grouped = msgs.reduce<Record<string, Message[]>>((acc, msg) => {
        if (!acc[msg.conversationId]) acc[msg.conversationId] = [];
        acc[msg.conversationId].push(msg);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([userId, list]) => {
        if (String(userId) === String(auth.user?.id)) return;
        const customerMsg = list.find(m => m.senderRole === 'customer');
        if (customerMsg) {
          const lastMsg = list[list.length - 1];
          convs.push({ userId, userName: customerMsg.senderName, lastMessage: lastMsg });
        }
      });
    } catch (error) {
      console.error('AdminChat: loadConversations failed', error);
    }

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

  const loadMessages = async (userId: string) => {
    try {
      const msgs: Message[] = await chatService.getMessages(userId);
      const previousLength = messages.length;
      const prevLastId = messages[messages.length - 1]?.id;
      const nextLastId = msgs[msgs.length - 1]?.id;

      const changed = previousLength !== msgs.length || prevLastId !== nextLastId;
      if (changed) {
        setMessages(msgs);
      }

      if (changed && msgs.length > previousLength && isAtBottom) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error(`Error loading messages for ${userId}:`, error);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || !auth.user) return;

    const payload = {
      conversationId: selectedUserId,
      senderId: auth.user.id,
      senderName: auth.user.name,
      senderRole: 'admin' as const,
      message: newMessage.trim()
    };

    try {
      const saved = await chatService.sendMessage(payload);
      const updatedMessages = [...messages, saved];
      setMessages(updatedMessages);
      setNewMessage('');
      loadConversations();
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('AdminChat: send failed', error);
    }
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

