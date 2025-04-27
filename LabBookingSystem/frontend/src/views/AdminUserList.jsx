import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminUserList.css';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <div className="user-list-container loading">Loading users...</div>;
    }

    if (error) {
        return <div className="user-list-container error">{error}</div>;
    }

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <h2>Lab System Users</h2>
                <Link to="/admin/dashboard" className="back-button">
                    Back to Dashboard
                </Link>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="user-grid">
                {filteredUsers.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-info">
                            <h3>{user.user_name}</h3>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {getRoleName(user.role_id)}</p>
                            <p><strong>Joined:</strong> {formatDate(user.created_at)}</p>
                        </div>
                        <div className="user-actions">
                            <Link to={`/admin/users/${user.id}`} className="view-button">
                                View Reservation History
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <p className="no-results">No users found matching "{searchTerm}"</p>
            )}
        </div>
    );
};

export default AdminUserList;