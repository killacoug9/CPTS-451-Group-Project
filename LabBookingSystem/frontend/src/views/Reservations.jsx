import React, { useEffect, useState } from 'react';
import './Reservations.css';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [equipmentMap, setEquipmentMap] = useState({});

    const PENDING_STATUS = 'pending';
    const CANCELLED_STATUS = 'cancelled';

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            setUserId(currentUser.id);
        } else {
            setError('Please log in to view your reservations');
            setLoading(false);
            return;
        }

        // Fetch equipment data to display names
        fetch('http://localhost:5000/api/equipment')
            .then(response => response.json())
            .then(data => {
                // Create a map of equipment ID to name for easy lookup
                const equipMap = {};
                data.forEach(item => {
                    equipMap[item.id] = item.equip_name;
                });
                setEquipmentMap(equipMap);

                // Now fetch the user's reservations
                return fetch('http://localhost:5000/api/reservations');
            })
            .then(response => response.json())
            .then(data => {
                // Filter reservations for the current user
                const userReservations = data.filter(res => res.user_id === currentUser.id);
                setReservations(userReservations);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to load reservations');
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'status-approved';
            case 'pending': return 'status-pending';
            case 'rejected': return 'status-rejected';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const handleCancelReservation = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservation_status: CANCELLED_STATUS
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to cancel reservation');
            }

            // Update the reservation in the UI
            setReservations(reservations.map(res => {
                if (res.id === id) {
                    return { ...res, reservation_status: CANCELLED_STATUS };
                }
                return res;
            }));

            alert('Reservation cancelled successfully');
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            alert('Failed to cancel reservation');
        }
    };

    if (loading) {
        return <div className="reservations-container loading">Loading your reservations...</div>;
    }

    if (error) {
        return <div className="reservations-container error">{error}</div>;
    }

    return (
        <div className="reservations-container">
            <h2 className="page-title">My Reservations</h2>

            {reservations.length === 0 ? (
                <p className="no-reservations">You don't have any reservations yet.</p>
            ) : (
                <div className="reservations-list">
                    {reservations.map(reservation => (
                        <div key={reservation.id} className="reservation-card">
                            <div className="reservation-header">
                                <h3>{equipmentMap[reservation.equipment_id] || 'Unknown Equipment'}</h3>
                                <span className={`reservation-status ${getStatusClass(reservation.reservation_status)}`}>
                                    {reservation.reservation_status}
                                </span>
                            </div>

                            <div className="reservation-details">
                                <p><strong>Reservation ID:</strong> {reservation.id}</p>
                                <p><strong>Quantity:</strong> {reservation.reserved_quantity}</p>
                                <p><strong>Start Date:</strong> {formatDate(reservation.res_start_date)}</p>
                                <p><strong>End Date:</strong> {formatDate(reservation.res_end_date)}</p>
                                <p><strong>Request Date:</strong> {formatDate(reservation.res_request_date)}</p>
                            </div>

                            <div className="reservation-actions">
                                {reservation.reservation_status === PENDING_STATUS && (
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancelReservation(reservation.id)}
                                    >
                                        Cancel Reservation
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reservations;