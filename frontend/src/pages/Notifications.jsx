import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/messages/notifications');
                setNotifications(response.data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationClick = (conversationId) => {
        navigate(`/chat/${conversationId}`);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
                    <div className="text-xl">Loading notifications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">🔔 Notifications</h2>

                {notifications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🔕</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No new notifications</h3>
                        <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                onClick={() => handleNotificationClick(notification.conversationId)}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-gray-600">
                                        {notification.sender.profileEmoji || notification.sender.username.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                {notification.sender.username}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                {notification.count} new message{notification.count > 1 ? 's' : ''}
                                            </span>
                                            : {notification.latestMessage.length > 50
                                                ? notification.latestMessage.substring(0, 50) + '...'
                                                : notification.latestMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
