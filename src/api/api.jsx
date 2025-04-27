// src/api/api.js                 

import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  },
});

// You can also add interceptors if needed (optional)
// For example, to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or wherever you store your token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
