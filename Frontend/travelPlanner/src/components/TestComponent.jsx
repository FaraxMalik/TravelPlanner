import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>
        🎉 Frontend is Working! 🎉
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>
        React app is running successfully!
      </p>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        marginTop: '2rem',
        maxWidth: '500px',
        margin: '2rem auto'
      }}>
        <h2>Travel Planner Status</h2>
        <p>✅ React Components Loading</p>
        <p>✅ Styling Working</p>
        <p>🔄 Testing Complete</p>
      </div>
    </div>
  );
};

export default TestComponent;
