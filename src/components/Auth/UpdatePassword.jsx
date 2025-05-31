import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put('/auth/password', formData)
      setMessage('Password updated successfully!')
      setError('')
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
      setMessage('')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Update Password</h1>
      If logged in via Google/Facebook (OAuth):
      🔗 Show a link like: "Change password in your Google Account or Facebook Settings".


      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Current Password:</label>
          <input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>New Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <button 
          type="submit"
          style={{ padding: '10px', cursor: 'pointer', marginRight: '10px' }}
        >
          Update Password
        </button>
        
        <button 
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default UpdatePassword