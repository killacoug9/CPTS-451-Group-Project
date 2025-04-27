import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './auth/AuthContext';

import Navigation from './views/Navigation';
import ProtectedRoute from './ProtectedRoute';

import Home from './views/Home';
import EquipmentList from './views/EquipmentList';
import Login from './auth/Login';
import Register from './auth/Register';
import UserProfile from './auth/UserProfile';
import Reservations from './views/Reservations';
import AdminReservations from './views/AdminReservations';
import AdminDashboard from './views/AdminDashboard';
import AdminUserList from './views/AdminUserList';
import UserHistory from './views/UserHistory';
import Notifications from './views/Notifications';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Navigation />
          <div className="app-container">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes (require login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/equipment" element={<EquipmentList />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/my-reservations" element={<Reservations />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/reservations" element={<AdminReservations />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUserList />} />
                <Route path="/admin/users/:userId" element={<UserHistory />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;