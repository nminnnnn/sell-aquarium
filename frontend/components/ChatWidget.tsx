import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Sparkles } from 'lucide-react';
import { useApp } from '../context';
import { Message } from '../types';
import { chatService } from '../services/api';

const ChatWidget = () => {
  const { auth } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // Sticky scroll refs/state
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const conversationId = auth.user?.id || '';

  // Fetch messages function - defined outside useEffect so it can be reused
  const fetchMessages = React.useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await chatService.getMessages(conversationId);
      if (res.success && Array.isArray(res.data)) {
        // Remove duplicates by ID before setting
        const uniqueMessages = res.data.filter((msg, index, self) => 
          index === self.findIndex(m => m.id === msg.id)
        );
        setMessages(uniqueMessages);
      }
    } catch (e) {
      console.error('ChatWidget: fetch messages error', e);
    }
  }, [conversationId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isOpen && !isMinimized) {
      fetchMessages();
      // Poll every 5 seconds instead of 1.5s to reduce server load
      interval = setInterval(fetchMessages, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isMinimized, fetchMessages]);

  useEffect(() => {
    // Chỉ auto scroll khi user đang ở gần đáy (sticky scroll)
    if (isOpen && !isMinimized && isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isAtBottom]);

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
    // Consider “at bottom” nếu cách đáy < 120px
    setIsAtBottom(distanceFromBottom < 120);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.user) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    // Optimistic update: Add message to UI immediately (before API call)
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      conversationId: conversationId,
      senderId: auth.user.id,
      senderRole: (auth.user.role as Message['senderRole']) || 'customer',
      senderName: auth.user.name,
      message: messageToSend,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Scroll to bottom to show new message
    setTimeout(() => scrollToBottom(), 100);

    try {
      const payload = {
        userId: conversationId,
        senderId: auth.user.id,
        senderName: auth.user.name,
        senderRole: (auth.user.role as Message['senderRole']) || 'customer',
        message: messageToSend
      };
      const res = await chatService.sendMessage(payload);
      
      if (res.success && res.data) {
        // Replace optimistic message with real message from server
        setMessages(prev => {
          // Remove optimistic message and add real one
          const filtered = prev.filter(m => m.id !== optimisticMessage.id);
          // Check if real message already exists (from polling)
          const exists = filtered.some(m => m.id === res.data.id);
          if (exists) return filtered;
          return [...filtered, res.data];
        });
        
        // If AI responded, it will be added by polling or from response
        if (res.data.aiResponse) {
          setTimeout(() => {
            setMessages(prev => {
              // Check if AI message already exists
              const exists = prev.some(m => m.id === res.data.aiResponse.id);
              if (exists) return prev;
              return [...prev, res.data.aiResponse];
            });
            scrollToBottom();
          }, 500);
        }
        
        // Trigger immediate refresh to get any updates
        setTimeout(() => {
          fetchMessages();
        }, 500);
      }
    } catch (error) {
      console.error('ChatWidget: send message failed', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageToSend); // Restore message on error
      alert('Không gửi được tin nhắn. Vui lòng thử lại.');
    }
  };

  // Don't show widget if user is not authenticated or is admin
  if (!auth.isAuthenticated || auth.user?.role === 'admin') {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-brand-cyan to-brand-ocean text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
          {/* Notification badge if there are unread messages */}
          {messages.some(m => !m.read && m.senderRole === 'admin') && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-deep to-brand-ocean text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Chat with Admin</h3>
                <p className="text-xs text-white/80">
                  {messages.some(m => m.senderName === 'AI Assistant') 
                    ? 'AI Assistant • Type "admin" to talk to real admin'
                    : 'We\'ll reply as soon as possible'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  if (!isMinimized) {
                    setTimeout(() => scrollToBottom(), 100);
                  }
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                ref={messagesContainerRef}
                onScroll={handleScroll}
              >
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a conversation with our admin team!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === auth.user?.id;
                    const isAI = msg.senderName === 'AI Assistant' || (msg as any).isAI;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-brand-cyan to-brand-ocean text-white'
                              : isAI
                              ? 'bg-blue-50 text-gray-900 border-2 border-blue-200'
                              : 'bg-white text-gray-900 border border-gray-200'
                          } shadow-sm`}
                        >
                          {!isOwn && (
                            <div className="flex items-center gap-1 mb-1">
                              {isAI && <Sparkles className="h-3 w-3 text-blue-500" />}
                              <p className={`text-xs font-semibold ${isAI ? 'text-blue-600' : 'opacity-80'}`}>
                                {msg.senderName}
                              </p>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : isAI ? 'text-blue-500' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={messages.some(m => m.senderName === 'AI Assistant') 
                      ? "Type your message... (or 'admin' for real admin)"
                      : "Type your message..."}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                    disabled={!auth.user}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !auth.user}
                    className="bg-gradient-to-r from-brand-cyan to-brand-ocean text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                {/* Helper text when AI has responded */}
                {messages.length > 0 && messages.some(m => m.senderName === 'AI Assistant') && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    💡Không hài lòng? Gõ <strong>"admin"</strong> để liên hệ admin • Đã liên hệ admin? Gõ <strong>"ai"</strong> để quay lại AI
                  </p>
                )}
                {/* Helper text when user has requested admin */}
                {messages.length > 0 && !messages.some(m => m.senderName === 'AI Assistant') && messages.some(m => {
                  const msgLower = m.message.toLowerCase();
                  return msgLower.includes('admin') || msgLower.includes('người thật') || msgLower.includes('quản lý');
                }) && (
                  <p className="text-xs text-blue-500 mt-2 text-center">
                    💬 Đang chat với admin • Gõ <strong>"ai"</strong> hoặc <strong>"bot"</strong> để quay lại AI tư vấn tự động
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

