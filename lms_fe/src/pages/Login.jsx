import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS = {
  admin:   { label: '👑 Admin',     color: '#e74c3c' },
  trainer: { label: '🎓 Đào Tạo',  color: '#f39c12' },
  student: { label: '📚 Học Viên', color: '#00B1B0' },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickFill = (role) => {
    const creds = {
      admin:   { email: 'admin@lms.com',   password: 'Admin@123' },
      trainer: { email: 'trainer@lms.com', password: 'Trainer@123' },
      student: { email: 'student@lms.com', password: 'Student@123' },
    };
    setForm(creds[role]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin' || user.role === 'trainer') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>Khitam LMS</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '14px' }}>
            Nền tảng học tập trực tuyến
          </p>
        </div>

        {/* Quick Role Buttons */}
        <div style={{ marginBottom: '25px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
            ĐĂNG NHẬP NHANH
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => (
              <button
                key={role}
                onClick={() => quickFill(role)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: `${color}22`,
                  border: `1px solid ${color}66`,
                  borderRadius: '10px',
                  color: color,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.target.style.background = `${color}44`}
                onMouseOut={e => e.target.style.background = `${color}22`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.2)',
              border: '1px solid rgba(231,76,60,0.4)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#ff8a80',
              fontSize: '14px',
              marginBottom: '18px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#555' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
