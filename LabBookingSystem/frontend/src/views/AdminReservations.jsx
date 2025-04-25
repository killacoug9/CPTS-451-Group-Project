import React, { useEffect, useState } from 'react';
import './AdminReservations.css';

const AdminReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminId, setAdminId] = useState(null);
    const [users, setUsers] = useState({});
    const [equipment, setEquipment] = useState({});
    const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'denied'

    const APPROVED_STATUS = 'approved';
    const PENDING_STATUS = 'pending';
    const REJECTED_STATUS = 'denied';

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log(currentUser);
        if (currentUser && (currentUser.isAdmin || currentUser.role_id === 1)) {
            console.log(currentUser.id);
            setAdminId(currentUser.id);
        } else {
            setError('You must be an admin to view this page');
            setLoading(false);
            return;
        }

        // Fetch users
        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => {
                const userMap = {};
                data.forEach(user => {
                    userMap[user.id] = user;
                });
                setUsers(userMap);

                // Fetch equipment
                return fetch('http://localhost:5000/api/equipment');
            })
            .then(response => response.json())
            .then(data => {
                const equipMap = {};
                data.forEach(equip => {
                    equipMap[equip.id] = equip;
                });
                setEquipment(equipMap);

                // Fetch all reservations
                return fetch('http://localhost:5000/api/reservations');
            })
            .then(response => response.json())
            .then(data => {
                setReservations(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to load reservation data');
                setLoading(false);
            });
    }, []);

    const handleUpdateStatus = async (reservationId, newStatus) => {
        try {
            console.log("admin", adminId);
            const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    admin_id: adminId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update reservation status');
            }

            // Update the reservation in the UI
            setReservations(reservations.map(res => {
                if (res.id === reservationId) {
                    return { ...res, reservation_status: newStatus };
                }
                return res;
            }));

            alert(`Reservation ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Error updating reservation:', error);
            alert(error.message || 'Failed to update reservation status');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const filteredReservations = reservations.filter(res => {
        if (filter === 'all') return true;
        return res.reservation_status.toLowerCase() === filter;
    });

    if (loading) {
        return <div className="admin-container loading">Loading reservation data...</div>;
    }

    if (error) {
        return <div className="admin-container error">{error}</div>;
    }

    return (
        <div className="admin-container">
            <h2 className="admin-title">Manage Equipment Reservations</h2>

            <div className="filter-controls">
                <div className="filter-group">
                    <label>Filter by Status:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Reservations</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredReservations.length === 0 ? (
                <p className="no-data">No reservations found with the selected filter.</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Equipment</th>
                            <th>Quantity</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredReservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>{users[reservation.user_id]?.user_name || 'Unknown User'}</td>
                                <td>{equipment[reservation.equipment_id]?.equip_name || 'Unknown Equipment'}</td>
                                <td>{reservation.reserved_quantity}</td>
                                <td>{formatDate(reservation.res_start_date)}</td>
                                <td>{formatDate(reservation.res_end_date)}</td>
                                <td className={`status-cell status-${reservation.reservation_status.toLowerCase()}`}>
                                    {reservation.reservation_status}
                                </td>
                                <td>
                                    {reservation.reservation_status === PENDING_STATUS && (
                                        <div className="action-buttons">
                                            <button
                                                className="approve-btn"
                                                onClick={() => handleUpdateStatus(reservation.id, APPROVED_STATUS)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => handleUpdateStatus(reservation.id, REJECTED_STATUS)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminReservations;