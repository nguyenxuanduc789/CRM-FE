import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi động: đọc token từ localStorage → xác thực với server
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (!token) { setLoading(false); return; }

    api.get('/lms/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('lms_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/lms/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('lms_token', token);   // Lưu token vĩnh viễn trong browser
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Inject token vào mọi request khi có user
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin', isTrainer: user?.role === 'trainer', isStudent: user?.role === 'student' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
