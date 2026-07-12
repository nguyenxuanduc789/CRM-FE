import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/lmsApi';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(form.password);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strength];
  const strengthColor = ['', '#e74c3c', '#f39c12', '#3498db', '#2ecc71'][strength];

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
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
      <div style={{ display: 'flex', width: '100%', maxWidth: '900px', gap: '0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        {/* Left Panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(160deg, #00B1B0 0%, #0f3460 100%)',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          minWidth: 0,
        }}
          className="register-left-panel"
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎓</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
            Tham gia Khitam LMS
          </h1>
          <p style={{ opacity: 0.85, lineHeight: '1.7', fontSize: '16px', marginBottom: '32px' }}>
            Mở khóa kho tàng kiến thức. Học mọi lúc, mọi nơi với hàng trăm khóa học chất lượng cao.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['✅ Hàng trăm khóa học đa lĩnh vực', '📱 Học mọi thiết bị, mọi nơi', '🏅 Chứng chỉ hoàn thành khóa học', '💬 Hỏi đáp trực tiếp với giảng viên'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', opacity: 0.9 }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '50px 40px',
          minWidth: 0,
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: 'white', fontSize: '26px', fontWeight: '700', margin: 0 }}>
              Tạo tài khoản
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '14px' }}>
              Điền thông tin để bắt đầu học ngay
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* FullName */}
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input name="fullName" type="text" value={form.fullName} onChange={handleChange}
                placeholder="Nguyễn Văn A" required style={inputStyle} />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="your@email.com" required style={inputStyle} />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Mật khẩu</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự" required style={inputStyle} />
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Xác nhận mật khẩu</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                placeholder="Nhập lại mật khẩu" required style={{
                  ...inputStyle,
                  borderColor: form.confirmPassword && form.password !== form.confirmPassword
                    ? 'rgba(231,76,60,0.6)' : 'rgba(255,255,255,0.15)',
                }} />
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>Bạn muốn tham gia với tư cách</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'student', label: '📚 Học viên', desc: 'Tôi muốn học' },
                  { value: 'trainer', label: '🎓 Giảng viên', desc: 'Tôi muốn dạy' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                    style={{
                      padding: '14px 12px',
                      border: `2px solid ${form.role === opt.value ? '#00B1B0' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: '10px',
                      background: form.role === opt.value ? 'rgba(0,177,176,0.2)' : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(231,76,60,0.2)',
                border: '1px solid rgba(231,76,60,0.4)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#ff8a80',
                fontSize: '14px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
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
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                marginTop: '4px',
              }}
            >
              {loading ? 'Đang đăng ký...' : 'Tạo tài khoản →'}
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ color: '#00B1B0', fontWeight: '600' }}>Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
