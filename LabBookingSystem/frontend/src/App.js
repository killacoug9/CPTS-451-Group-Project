import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './views/Home';
import EquipmentList from './views/EquipmentList';

function App() {
  return (
  <Router>
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/equipment">View Equipment</Link>
    </div>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipment" element={<EquipmentList />} />
      </Routes>
    </Router>
  );
}

export default App;