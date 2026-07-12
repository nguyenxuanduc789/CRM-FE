import axios from 'axios';

// Kết nối đúng port Backend (3056)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3056/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: tự động đính kèm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
