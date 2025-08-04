import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import Homepage from './pages/Homepage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Import Styles
import './components/Auth.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            
            {/* Redirect /signup to /register for consistency */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            
            {/* Protected Routes - Will be added later */}
            <Route path="/dashboard" element={<div>Dashboard Coming Soon...</div>} />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
