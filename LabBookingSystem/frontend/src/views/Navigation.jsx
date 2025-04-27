import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navigation.css';

const Navigation = () => {
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">Lab Equipment System</Link>
                </div>

                {/* Mobile menu toggle button */}
                <div className="mobile-toggle" onClick={toggleMobileMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>

                {/* Navigation links */}
                <ul className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
                    <li>
                        <Link to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>
                    </li>
                    <li>
                        <Link to="/equipment" onClick={() => setShowMobileMenu(false)}>Equipment</Link>
                    </li>

                    {currentUser ? (
                        // Links for authenticated users
                        <>
                            <li>
                                <Link to="/my-reservations" onClick={() => setShowMobileMenu(false)}>My Reservations</Link>
                            </li>

                            <li>
                                <Link to="/notifications" onClick={() => setShowMobileMenu(false)}>Notifications</Link>
                            </li>   

                            {/* Admin-only links */}
                            {isAdmin() && (
                                <>
                                    <li>
                                        <Link to="/admin/reservations" onClick={() => setShowMobileMenu(false)}>Manage Reservations</Link>
                                    </li>
                                    <li>
                                    <Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>Analytics Dashboard</Link>
                                    </li>
                                </>
                            )}

                            <li className="profile-dropdown">
                                <button className="dropdown-button">
                                    {currentUser.user_name || 'Profile'} <span className="dropdown-arrow">▼</span>
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link to="/profile" onClick={() => setShowMobileMenu(false)}>Profile Settings</Link>
                                    </li>
                                    <li>
                                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                                    </li>
                                </ul>
                            </li>
                        </>
                    ) : (
                        // Links for non-authenticated users
                        <>
                            <li>
                                <Link to="/login" onClick={() => setShowMobileMenu(false)}>Login</Link>
                            </li>
                            <li>
                                <Link to="/register" onClick={() => setShowMobileMenu(false)}>Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;