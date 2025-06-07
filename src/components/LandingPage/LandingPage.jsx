// src/components/LandingPage/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>Welcome to Our Application</h1>
      <div className="auth-buttons">
        <button onClick={() => navigate('/signin')}>Login</button>
        <button onClick={() => navigate('/signup')}>Register</button>
      </div>
    </div>
  );
};

export default LandingPage;