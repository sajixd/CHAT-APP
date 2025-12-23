import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Chat = () => {
  const { conversationId } = useParams();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [typing, setTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation details and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch messages
        const messagesResponse = await api.get(`/messages/${conversationId}`);
        setMessages(messagesResponse.data);

        // Fetch conversations to get other user info
        const conversationsResponse = await api.get('/conversations');
        const conversation = conversationsResponse.data.find(
          conv => conv.id === conversationId
        );
        
        if (conversation) {
          setOtherUser(conversation.otherUser);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        alert('Failed to load conversation');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId, navigate]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Join conversation room
    socket.emit('join_conversation', conversationId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for typing indicators
    const handleUserTyping = ({ username }) => {
      setTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    };

    const handleUserStopTyping = () => {
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    // Cleanup
    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, connected, conversationId]);

  const handleTyping = () => {
    if (socket && connected) {
      socket.emit('typing', { conversationId, username: user.username });
    }
  };

  const handleStopTyping = () => {
    if (socket && connected) {
      socket.emit('stop_typing', conversationId);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    handleStopTyping();

    try {
      if (socket && connected) {
        socket.emit('send_message', {
          conversationId,
          text: newMessage.trim()
        });
        setNewMessage('');
      } else {
        throw new Error('Socket not connected');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-xl text-gray-600">Loading conversation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
          {otherUser?.username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold text-gray-800">{otherUser?.username}</h2>
          <p className="text-sm text-gray-500">{connected ? '🟢 Online' : '🔴 Offline'}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 text-lg">No messages yet</p>
              <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === user.id;
              return (
                <div
                  key={message._id || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{otherUser?.username} is typing...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !connected}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        {!connected && (
          <p className="text-red-500 text-sm mt-2">⚠️ Disconnected. Trying to reconnect...</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
