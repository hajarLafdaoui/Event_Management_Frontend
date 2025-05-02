import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import EmailVerification from './components/Auth/EmailVerification';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './PrivateRoute';
import ResendVerification from './components/Auth/ResendVerification';
import UserDetails from './components/Auth/UserDetails';
import UpdatePassword from './components/Auth/UpdatePassword';
import UpdateProfile from './components/Auth/UpdateProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<Home/>} /> */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/email/verify/:id/:hash" element={<EmailVerification />} />

<Route path="/verify-email/:id/:hash" element={<EmailVerification />} />
<Route path="/resend-verification" element={<ResendVerification />} />
<Route path="/update-profile" element={<UpdateProfile />} />


        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/user-details" element={<UserDetails />} />          {/* Add other protected routes here */}
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;