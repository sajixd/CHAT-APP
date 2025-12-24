import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any stuck loading states on mount
    setActionLoading(null);
    fetchUsers();
  }, []);

  const handleSendRequest = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccessMessage('');

    // Safety timeout - clear loading after 10 seconds max
    const timeoutId = setTimeout(() => {
      console.warn('Request timeout - clearing loading state');
      setActionLoading(null);
    }, 10000);

    try {
      const response = await api.post('/friends/request', { toUserId: userId });
      console.log('Friend request response:', response.data);

      // Refresh users list
      await fetchUsers();

      // Show success message
      setSuccessMessage('Friend request sent successfully! ✓');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Friend request error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to send friend request';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      // Clear timeout and loading state
      clearTimeout(timeoutId);
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post(`/friends/accept/${requestId}`);
      console.log('Accept request response:', response.data);

      await fetchUsers();

      setSuccessMessage('Friend request accepted! You can now chat ✓');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Accept request error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to accept friend request';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post(`/friends/reject/${requestId}`);
      console.log('Reject request response:', response.data);

      await fetchUsers();

      setSuccessMessage('Friend request rejected');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Reject request error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to reject friend request';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = async (userId) => {
    try {
      const response = await api.get(`/conversations/with/${userId}`);
      navigate(`/chat/${response.data.conversationId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to open chat');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'friends':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">✓ Friends</span>;
      case 'request_sent':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">⏳ Request Sent</span>;
      case 'request_received':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">📩 Request Received</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">Not Friends</span>;
    }
  };

  const renderActionButton = (user) => {
    if (actionLoading && (actionLoading === user.id || actionLoading === user.requestId)) {
      return (
        <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2" disabled>
          <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </button>
      );
    }

    switch (user.status) {
      case 'friends':
        return (
          <button
            onClick={() => handleOpenChat(user.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            💬 Chat
          </button>
        );
      case 'request_sent':
        return (
          <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed" disabled>
            Pending...
          </button>
        );
      case 'request_received':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(user.requestId)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => handleRejectRequest(user.requestId)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              ✗ Reject
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => handleSendRequest(user.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            + Add Friend
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-xl text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">👥 Users</h2>
          <p className="text-gray-600 dark:text-gray-300">Send friend requests to start chatting</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">No other users found. Invite your friends to join!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-gray-700">
                    {user.profileEmoji || user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{user.username}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(user.status)}
                </div>

                <div className="mt-4">
                  {renderActionButton(user)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
