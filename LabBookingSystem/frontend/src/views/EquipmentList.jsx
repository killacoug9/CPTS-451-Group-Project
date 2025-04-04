import React, { useEffect, useState } from 'react';
import BookingModal from './BookingModal';
import './EquipmentList.css';

export default function EquipmentList() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const availability_string = 'available'

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            setUserId(currentUser.id);
        }

        // Fetch equipment data
        fetch('http://localhost:5000/api/equipment')
            .then(response => response.json())
            .then(data => {
                setEquipment(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching equipment:', error);
                setLoading(false);
            });
    }, []);

    const handleBookEquipment = (item) => {
        // Only allow booking equipment that's available
        if (item.equip_status === availability_string && item.total_quantity > 0) {
            setSelectedEquipment(item);
            setShowModal(true);
        } else {
            alert('Sorry, this equipment is not available for booking.');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedEquipment(null);
    };

    const handleBookingSuccess = () => {
        // Refresh the equipment list after successful booking
        fetch('http://localhost:5000/api/equipment')
            .then(response => response.json())
            .then(data => {
                setEquipment(data);
                setShowModal(false);
                setSelectedEquipment(null);
            })
            .catch(error => {
                console.error('Error refreshing equipment list:', error);
            });
    };

    return(
        <div className="equipment-container">
            <h2 className="equipment-heading">Available Lab Equipment</h2>
            {loading ? (
                <p className="loading">Loading equipment...</p>
            ) : (
                <table className="equipment-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {equipment.map(item => (
                        <tr key={item.id}>
                            <td>{item.equip_name}</td>
                            <td>{item.category}</td>
                            <td>{item.equip_status}</td>
                            <td>{item.total_quantity}</td>
                            <td>
                                <button
                                    className="book-button"
                                    onClick={() => handleBookEquipment(item)}
                                    disabled={item.equip_status !== availability_string || item.total_quantity <= 0}
                                >
                                    Book
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {showModal && selectedEquipment && (
                <BookingModal
                    equipment={selectedEquipment}
                    userId={userId}
                    onClose={handleModalClose}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
}