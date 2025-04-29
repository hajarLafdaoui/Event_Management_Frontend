import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

const Dashboard = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      console.log("Logout successful");
      
      navigate('/signin')

    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

 

  const updatePassword = () => {
    navigate('/update-password')
  }

  const viewDetails = () => {
    navigate('/user-details')
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Logout
        </button>
        
     
        <button 
          onClick={updatePassword}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Update Password
        </button>
        
        <button 
          onClick={viewDetails}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          See All Details
        </button>
      </div>
    </div>
  )
}

export default Dashboard