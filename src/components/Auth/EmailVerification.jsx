// src/pages/EmailVerification.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const EmailVerification = () => {
  const { id, hash } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

 // src/pages/EmailVerification.jsx
useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/email/verify/${id}/${hash}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/signin'), 3000);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('User not found. Please register again.');
        } else {
          setError(err.response?.data?.message || 'Verification failed');
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    verifyEmail();
  }, [id, hash, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Email Verification</h2>
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 bg-red-100 rounded-lg">
            <p>{error}</p>
            <div className="flex justify-center mt-4 space-x-4">
              <button 
                onClick={() => navigate('/signin')}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Go to Sign In
              </button>
              <button 
                onClick={() => navigate('/resend-verification')}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Resend Verification
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-green-600 bg-green-100 rounded-lg">
            <p>{message}</p>
            <p className="mt-2 text-gray-600">You will be redirected to the login page shortly...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;