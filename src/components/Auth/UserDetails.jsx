import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

const UserDetails = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        // navigate('/signin')
      }
    }
    fetchUserDetails()
  }, [navigate])

  // Function to get initials from user's name
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : ''
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ''
    return `${firstInitial}${lastInitial}` || 'U' // Default to 'U' if no name
  }

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Details</h1>

      {/* Profile Picture or Initials */}
      {/* Profile Picture or Initials */}
           {/* Profile Picture or Initials */}
           <div style={{ 
        width: '100px', 
        height: '100px', 
        borderRadius: '50%', 
        backgroundColor: user.profile_picture ? 'transparent' : '#4CAF50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: user.profile_picture ? 'transparent' : 'white',
        fontSize: '36px',
        fontWeight: 'bold',
        margin: '20px auto',
        overflow: 'hidden'
      }}>
        {user.profile_picture ? (
          <img 
            src={`http://127.0.0.1:8000/storage/${user.profile_picture}`}
            alt="Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          getInitials(user.first_name, user.last_name)
        )}
      </div>


      <div style={{ marginTop: '20px' }}>
        <h2>Personal Information</h2>
        <p><strong>First Name:</strong> {user.first_name}</p>
        <p><strong>Last Name:</strong> {user.last_name}</p>
        <p><strong>Email:</strong> {user.email} {user.email_verified_at ? '(Verified)' : '(Not Verified)'}</p>
        <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>

        <h2>Account Information</h2>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Last Login:</strong> {new Date(user.last_login_at).toLocaleString()}</p>
        <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Back to Dashboard
        </button>

        <button
          onClick={() => navigate('/update-profile')}
          style={{
            padding: '10px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none'
          }}
        >
          Update Profile
        </button>
      </div>
    </div>
  )
}

export default UserDetails