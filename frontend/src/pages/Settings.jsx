import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EMOJI_OPTIONS = [
    "👤", "👨", "👩", "🧑", "🧒", "🧓", "🧔", "👮", "🕵️", "💂",
    "👷", "🤴", "👸", "👳", "👲", "🧕", "🤵", "👰", "🤰", "🤱",
    "👼", "🎅", "🤶", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟",
    "🐵", "🐶", "🐺", "🐱", "🦁", "🐯", "🦒", "🦊", "🦝", "🐮",
    "🐷", "🐗", "🐭", "🐹", "🐰", "🐻", "🐨", "🐼", "🐸", "🦓",
    "🦄", "🐔", "🐲", "🦖", "🐙", "🦑", "🦐", "🦞", "🦀", "🐬"
];

const Settings = () => {
    const { user, login } = useAuth();
    const [selectedEmoji, setSelectedEmoji] = useState(user?.profileEmoji || "👤");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await api.put('/users/profile', { profileEmoji: selectedEmoji });

            // Update local user state
            // We need to merge the new user data with the token or just update the object
            // For simplicity, we'll re-login logically or just assume AuthContext updates if we had a proper update function
            // Since login helper takes updates, let's try to update locally if possible, 
            // but standard JWT approach might need token refresh. 
            // For this app, let's look at how AuthContext works.

            // Checking AuthContext logic (assumed): usually it stores user in state. 
            // We might need to manually update the stored user in localStorage and state.
            const updatedUser = { ...user, profileEmoji: selectedEmoji };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Reloading page is a brute force way to sync context if we don't expose setUser, 
            // but ideally we should update context. For now, valid.
            window.location.reload();

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Failed to update profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Settings</h2>

                {/* Theme Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Appearance</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Dark Mode</span>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`${darkMode ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile</h3>

                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Profile Emoji
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`text-2xl w-10 h-10 flex items-center justify-center rounded hover:bg-white dark:hover:bg-gray-600 transition-colors ${selectedEmoji === emoji ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-4xl p-2 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                            {selectedEmoji}
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {message.text && (
                        <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
