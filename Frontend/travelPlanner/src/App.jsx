import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardEnhanced from './pages/DashboardEnhanced';
import PreferencesQuestionnaireEnhanced from './components/PreferencesQuestionnaireEnhanced';
import PlanTripEnhanced from './pages/PlanTripEnhanced';

// Import CSS files
import './index.css';
import './components/Auth.css';
import './components/Navbar.css';  
import './components/Preferences.css';
import './pages/Dashboard.css';
import './pages/PlanTrip.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

// Route that checks if user needs preferences
const PreferenceAwareRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // If user hasn't completed preferences, redirect to preferences
  if (user && user.needsPreferences) {
    return <Navigate to="/preferences" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // If authenticated but needs preferences, go to preferences
    if (user && user.needsPreferences) {
      return <Navigate to="/preferences" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Welcome to TravelPlanner</h2>
          <p>Preparing your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Homepage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signin" 
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />

          {/* Protected Routes with Preference Checking */}
          <Route 
            path="/dashboard" 
            element={
              <PreferenceAwareRoute>
                <DashboardEnhanced />
              </PreferenceAwareRoute>
            } 
          />
          <Route 
            path="/preferences" 
            element={
              <ProtectedRoute>
                <PreferencesQuestionnaireEnhanced />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plan-trip" 
            element={
              <PreferenceAwareRoute>
                <PlanTripEnhanced />
              </PreferenceAwareRoute>
            } 
          />

          {/* Fallback route */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                (user?.needsPreferences ? <Navigate to="/preferences" replace /> : <Navigate to="/dashboard" replace />) : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </main>
    </>
  );
};

export default App;
