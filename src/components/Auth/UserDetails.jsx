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
        navigate('/signin')
      }
    }
    fetchUserDetails()
  }, [navigate])

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Details</h1>
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
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}
      >
        Back to Dashboard
      </button>
    </div>
  )
}

export default UserDetails