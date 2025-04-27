import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [equipmentUsage, setEquipmentUsage] = useState([]);
    const [reservationTrends, setReservationTrends] = useState([]);
    const [popularEquipment, setPopularEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch equipment usage data
                const equipmentRes = await fetch('http://localhost:5000/api/admin/analytics/equipment-usage');
                const equipmentData = await equipmentRes.json();
                setEquipmentUsage(equipmentData);

                // Fetch reservation trends
                const trendsRes = await fetch('http://localhost:5000/api/admin/analytics/reservation-trends');
                const trendsData = await trendsRes.json();
                setReservationTrends(trendsData);

                // Fetch popular equipment
                const popularRes = await fetch('http://localhost:5000/api/admin/analytics/popular-equipment');
                const popularData = await popularRes.json();
                setPopularEquipment(popularData);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data');
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="dashboard-container loading">Loading analytics data...</div>;
    }

    if (error) {
        return <div className="dashboard-container error">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Admin Analytics Dashboard</h2>

            <div className="dashboard-grid">
                {/* Equipment Usage Stats */}
                <div className="dashboard-card">
                    <h3>Equipment Usage Statistics</h3>
                    <div className="table-container">
                        <table className="analytics-table">
                            <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Reservations</th>
                                <th>Usage Logs</th>
                                <th>Approved</th>
                                <th>Pending</th>
                                <th>Denied</th>
                            </tr>
                            </thead>
                            <tbody>
                            {equipmentUsage.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.reservation_count}</td>
                                    <td>{item.usage_count}</td>
                                    <td>{item.approved_count}</td>
                                    <td>{item.pending_count}</td>
                                    <td>{item.denied_count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reservation Trends */}
                <div className="dashboard-card">
                    <h3>Monthly Reservation Trends</h3>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {reservationTrends.map(month => (
                                <div
                                    key={month.month}
                                    className="bar-item"
                                    style={{
                                        height: `${Math.max(10, month.count * 10)}px`,
                                    }}
                                    title={`${month.month}: ${month.count} reservations`}
                                >
                                    <div className="bar-label">{month.count}</div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            {reservationTrends.map(month => (
                                <div key={month.month} className="month-label">
                                    {month.month.split('-')[1]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Equipment */}
                <div className="dashboard-card">
                    <h3>Most Popular Equipment</h3>
                    <div className="popular-list">
                        {popularEquipment.map((item, index) => (
                            <div key={item.id} className="popular-item">
                                <div className="rank">{index + 1}</div>
                                <div className="details">
                                    <h4>{item.name}</h4>
                                    <p>{item.category}</p>
                                    <p>{item.reservation_count} reservations</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Link to User Management */}
                <div className="dashboard-card">
                    <h3>User Management</h3>
                    <p>View detailed user reservation history</p>
                    <Link to="/admin/users" className="dashboard-button">
                        View Users
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;