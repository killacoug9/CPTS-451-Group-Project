import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './UserProfile.css';

const UserProfile = () => {
    const { currentUser } = useAuth();
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setUserName(currentUser.user_name || '');
            setEmail(currentUser.email || '');

            // Fetch user role name
            if (currentUser.role_id) {
                fetch(`http://localhost:5000/api/roles/${currentUser.role_id}`)
                    .then(response => response.json())
                    .then(data => {
                        setRole(data.role_name || 'Unknown');
                        setLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching role:', error);
                        setRole('Unknown');
                        setLoading(false);
                    });
            } else {
                setRole('Unknown');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName,
                    email
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update local storage with new data
            const updatedUser = { ...currentUser, user_name: userName, email };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            setSuccess('Profile updated successfully');
        } catch (error) {
            setError(error.message || 'An error occurred while updating your profile');
        }
    };

    if (loading) {
        return <div className="profile-container loading">Loading profile data...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>User Profile</h2>

                {error && <div className="profile-error">{error}</div>}
                {success && <div className="profile-success">{success}</div>}

                <div className="profile-info">
                    <div className="info-group">
                        <label>Role</label>
                        <p>{role}</p>
                    </div>

                    <div className="info-group">
                        <label>Member Since</label>
                        <p>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="userName">Name</label>
                        <input
                            type="text"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="profile-button">
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;