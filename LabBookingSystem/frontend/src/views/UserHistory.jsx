import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserHistory.css';

const UserHistory = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user details
                const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch user's reservation history
                const reservationsResponse = await fetch(`http://localhost:5000/api/admin/users/${userId}/reservations`);
                if (!reservationsResponse.ok) {
                    throw new Error('Failed to fetch reservation history');
                }
                const reservationsData = await reservationsResponse.json();
                setReservations(reservationsData);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Get status class for styling
    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'status-approved';
            case 'pending':
                return 'status-pending';
            case 'denied':
                return 'status-denied';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    if (loading) {
        return <div className="user-history-container loading">Loading user data...</div>;
    }

    if (error) {
        return <div className="user-history-container error">{error}</div>;
    }

    if (!user) {
        return <div className="user-history-container error">User not found</div>;
    }

    // Get role name from role ID
    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1:
                return 'Admin';
            case 2:
                return 'Researcher';
            case 3:
                return 'Student';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="user-history-container">
            <div className="user-history-header">
                <h2>User Reservation History</h2>
                <Link to="/admin/users" className="back-button">
                    Back to Users
                </Link>
            </div>

            <div className="user-profile-card">
                <h3>{user.user_name}</h3>
                <div className="user-details">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {getRoleName(user.role_id)}</p>
                    <p><strong>Member Since:</strong> {user.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                </div>
            </div>

            <div className="history-section">
                <h3>Reservation History</h3>

                {reservations.length === 0 ? (
                    <p className="no-history">This user has no reservation history.</p>
                ) : (
                    <div className="reservation-history-table">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Equipment</th>
                                <th>Quantity</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Request Date</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reservations.map(reservation => (
                                <tr key={reservation.id}>
                                    <td>{reservation.id}</td>
                                    <td>{reservation.equipment_name}</td>
                                    <td>{reservation.quantity}</td>
                                    <td>{formatDate(reservation.start_date)}</td>
                                    <td>{formatDate(reservation.end_date)}</td>
                                    <td>{formatDate(reservation.request_date)}</td>
                                    <td className={getStatusClass(reservation.status)}>
                                        {reservation.status}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserHistory;