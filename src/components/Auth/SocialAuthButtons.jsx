import React, { useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

const SocialAuthButtons = ({ type = 'signin' }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google/callback', {
        token: credentialResponse.credential
      });

      // Store the token
      localStorage.setItem('token', response.data.token);

      // Store user data if available
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert(error.response?.data?.message || 'Google login failed. Please try again.');
    }
  }, [navigate]);

  const handleFacebookResponse = useCallback(async (response) => {
    try {
      if (response.accessToken) {
        const authResponse = await api.post('/auth/facebook/callback', {
          accessToken: response.accessToken
        });

        localStorage.setItem('token', authResponse.data.access_token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Facebook authentication failed:', error);
      alert(error.response?.data?.message || 'Facebook login failed. Please try again.');
    }
  }, [navigate]);

  return (
    <div className="social-auth-container">
      <GoogleOAuthProvider
        clientId="534818652571-lfkrrjlu15agd04s9fvsr9k3o2pgje2c.apps.googleusercontent.com"
        onScriptLoadError={() => console.error("Google OAuth script failed to load")}
      >
        <div className="social-auth-button">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Google login failed');
              alert('Google login failed. Please try again.');
            }}
            useOneTap={type === 'signin'}
            text={type === 'signin' ? 'signin_with' : 'signup_with'}
            theme="filled_blue"
            size="large"
            ux_mode="popup"
            cookiePolicy="single_host_origin"
          />
        </div>
      </GoogleOAuthProvider>

      <div className="social-auth-button">
        <FacebookLogin
          appId="9035725106527424"
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          render={renderProps => (
            <button
              onClick={renderProps.onClick}
              className="facebook-login-btn"
              disabled={renderProps.isProcessing}
            >
              {type === 'signin' ? 'Continue with Facebook' : 'Sign up with Facebook'}
            </button>
          )}
          onFailure={(error) => {
            console.error('Facebook login failed:', error);
            alert('Facebook login failed. Please try again.');
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(SocialAuthButtons);