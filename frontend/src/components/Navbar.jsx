import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread/count');
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();

    // Socket listener for new messages to increment badge
    if (socket) {
      const handleNewMessage = (msg) => {
        // Only increment if not current user
        if (msg.sender._id !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, user.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">💬</span>
            <h1 className="text-2xl font-bold hidden sm:block">Chat App</h1>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Unread Badge (Optional feature requests usually imply notifications) */}
            <Link to="/notifications" className="relative hover:bg-blue-700 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/settings" className="flex items-center space-x-2 hover:bg-blue-700 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
              <span className="text-xl">{user?.profileEmoji || "👤"}</span>
              <span className="hidden sm:block text-sm">{user?.username}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
