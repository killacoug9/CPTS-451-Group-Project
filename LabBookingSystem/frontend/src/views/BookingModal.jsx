import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ equipment, userId, onClose, onBookingSuccess }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate the max quantity that can be booked (cannot exceed total quantity)
    const maxQuantity = equipment.total_quantity;

    const PENDING_STATUS = 'pending';

    // Function to check equipment availability
    const checkAvailability = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/equipment/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    equipment_id: equipment.id,
                    start_date: startDate,
                    end_date: endDate,
                    quantity: quantity
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw new Error('Failed to check equipment availability');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate form
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            setLoading(false);
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('End date must be after start date');
            setLoading(false);
            return;
        }

        try {
            // First check availability
            const availabilityData = await checkAvailability();

            if (!availabilityData.available) {
                setError(availabilityData.message || 'Equipment not available for selected dates');
                setLoading(false);
                return;
            }

            // Create the reservation data
            const reservationData = {
                user_id: userId,
                equipment_id: equipment.id,
                res_start_date: startDate,
                res_end_date: endDate,
                reserved_quantity: quantity,
                reservation_status: PENDING_STATUS // Initial status
            };

            // Submit the reservation to the API
            const response = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create reservation');
            }

            // Notify parent component about successful booking
            onBookingSuccess();

            // Show success message
            alert('Equipment booked successfully! Your reservation is pending approval.');
        } catch (error) {
            setError(error.message || 'An error occurred while booking');
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Book Equipment: {equipment.equip_name}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="datetime-local"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantity">Quantity:</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                max={maxQuantity}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                required
                            />
                            <small>Available: {maxQuantity}</small>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading || !userId}
                            >
                                {loading ? 'Booking...' : 'Book Equipment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;