import React, { useEffect, useState } from 'react';
import './Notifications.css';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            setError('Please log in to view notifications');
            setLoading(false);
            return;
        }

        fetch('http://localhost:5000/api/notifications')
            .then(res => res.json())
            .then(data => {
                const userNotifs = data.filter(n => n.user_id === currentUser.id);
                setNotifications(userNotifs);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching notifications:', err);
                setError('Failed to load notifications');
                setLoading(false);
            });
    }, []);

    return (
        <div className="notifications-container">
            <h2>My Notifications</h2>
            {loading ? (
                <p className="loading">Loading notifications...</p>
            ) : error ? (
                <div className="error">{error}</div>
            ) : notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <ul className="notification-list">
                    {notifications.map((notif) => (
                        <li key={notif.id} className="notification-item">
                            {notif.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}