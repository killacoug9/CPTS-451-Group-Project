import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // On mount, check if user is stored in localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                // If invalid JSON, clear localStorage
                localStorage.removeItem('currentUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, pwd: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user data in localStorage and state
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            setCurrentUser(data.user);
            return data.user;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userName, email, password, roleId = 3) => { // Default to student role
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName,
                    email,
                    pwd: password,
                    role_id: roleId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    };

    const isAdmin = () => {
        return currentUser && (currentUser.isAdmin || currentUser.role_id === 1);
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                loading,
                error,
                login,
                register,
                logout,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;