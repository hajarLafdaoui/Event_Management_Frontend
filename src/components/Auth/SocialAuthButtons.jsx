import React, { useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
// import facebookIcon from '../../assets/icons/facebook.png'; // Make sure to import your Facebook icon

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
          accessToken: response.accessToken,
        });

        localStorage.setItem('token', authResponse.data.access_token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Facebook authentication failed:', error);
      alert(error.response?.data?.error || 'Facebook login failed. Please try again.');
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
            ux_mode="popup" // Change to popup

            text={type === 'signin' ? 'signin_with' : 'signup_with'}
            theme="filled_blue"
            size="large"
            cookiePolicy="single_host_origin"
          />
        </div>
      </GoogleOAuthProvider>

      <div className="social-auth-button">
        <FacebookLogin
          appId="9035725106527424" // Using your new Facebook app ID
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          cssClass="facebook-btn"
          disableMobileRedirect={true}  // Add this line

          textButton={
            <>
              {/* <img 
                src={facebookIcon} 
                alt="Facebook" 
                style={{ width: '20px', height: '20px', marginRight: '10px' }} 
              /> */}
              {type === 'signin' ? 'Login with Facebook' : 'Sign up with Facebook'}
            </>
          }
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