import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import AddShop from './components/AddShop';
import EditShop from './components/EditShop';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-shop" element={<AddShop />} />
          <Route path="/edit-shop/:id" element={<EditShop />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 