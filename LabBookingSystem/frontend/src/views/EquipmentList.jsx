import React, { useEffect, useState } from 'react';
import './EquipmentList.css';

export default function EquipmentList() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/equipment')
            .then(response => response.json())
            .then(data => { 
                setEquipment(data);
                setLoading(false);
            })
        }, []
    );

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
                </tr>
                </thead>
                <tbody>
                    {equipment.map(item => (
                        <tr key={item.id}>
                            <td>{item.equip_name}</td>
                            <td>{item.category}</td>
                            <td>{item.equip_status}</td>
                            <td>{item.total_quantity}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            )}
        </div>
    );
}