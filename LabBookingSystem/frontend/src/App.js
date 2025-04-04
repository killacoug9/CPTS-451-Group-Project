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
              </Route>

              {/* Admin-only routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/reservations" element={<AdminReservations />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;