import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

const Profile = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        navigate('/signin')
      }
    }
    fetchProfile()
  }, [navigate])

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Profile</h1>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
        <p><strong>Role:</strong> {user.role}</p>
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

export default Profile