import React, { useEffect, useState } from 'react';
import './Reservations.css';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [equipmentMap, setEquipmentMap] = useState({});
    const [editReservationId, setEditReservationId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        res_start_date: '',
        res_end_date: '',
        reserved_quantity: 1
    });

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
            case 'denied': return 'status-denied';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const handleCancelReservation = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reservations/${id}/cancel`, {
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

    const handleEditClick = (reservation) => {
        setEditReservationId(reservation.id);
        setEditFormData({
            res_start_date: reservation.res_start_date.slice(0, 16),
            res_end_date: reservation.res_end_date.slice(0, 16),
            reserved_quantity: reservation.reserved_quantity
        });
    };
    
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleEditSave = async (id) => {
        const today = new Date();
        const startDate = new Date(editFormData.res_start_date);
        const endDate = new Date(editFormData.res_end_date);
    
    if (startDate < today.setHours(0, 0, 0, 0)) {
        alert('Start date cannot be in the past.');
        return;
    }

    if (endDate < startDate) {
        alert('End date cannot be before start date.');
        return;
    }

    const currentReservation = reservations.find(res => res.id === id);
    const equipmentId = currentReservation?.equipment_id;
    if (!equipmentId) {
        alert('Unable to validate equipment availability.');
        return;
    }

    try {
        const availabilityRes = await fetch('http://localhost:5000/api/equipment/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                equipment_id: equipmentId,
                start_date: editFormData.res_start_date,
                end_date: editFormData.res_end_date,
                quantity: editFormData.reserved_quantity
            })
        });

        const availabilityData = await availabilityRes.json();
        if (!availabilityData.available) {
            alert(availabilityData.message || 'Not enough equipment available.');
            return;
        }
    } catch (error) {
        console.error('Availability check failed:', error);
        alert('Could not check availability. Please try again.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editFormData)
        });

        if (!response.ok) {
            throw new Error('Failed to update reservation');
        }

        setReservations(reservations.map(res => {
            if (res.id === id) {
                return {
                    ...res,
                    ...editFormData,
                    res_start_date: new Date(editFormData.res_start_date).toISOString(),
                    res_end_date: new Date(editFormData.res_end_date).toISOString()
                };
            }
            return res;
        }));

        setEditReservationId(null);
        alert('Reservation updated successfully');
    } catch (error) {
        console.error('Error updating reservation:', error);
        alert('Failed to update reservation');
    }
};
    
    const handleCancelEdit = () => {
        setEditReservationId(null);
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
                                <>
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancelReservation(reservation.id)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditClick(reservation)}
                                    >
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>

                        {editReservationId === reservation.id && (
                            <div className="edit-form">
                                <p><strong>Modify your reservation:</strong></p>
                                <input
                                    type="datetime-local"
                                    name="res_start_date"
                                    value={editFormData.res_start_date}
                                    onChange={handleEditChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <input
                                    type="datetime-local"
                                    name="res_end_date"
                                    value={editFormData.res_end_date}
                                    onChange={handleEditChange}
                                />
                                <input
                                    type="number"
                                    name="reserved_quantity"
                                    value={editFormData.reserved_quantity}
                                    min="1"
                                    onChange={handleEditChange}
                                />
                                <div style={{ marginTop: '10px' }}>
                                    <button className="save-button" onClick={() => handleEditSave(reservation.id)}>
                                        Save Changes
                                    </button>
                                    <button className="cancel-edit-button" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reservations;