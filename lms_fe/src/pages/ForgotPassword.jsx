import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../utils/lmsApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const darkInput = {
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

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi email. Kiểm tra lại địa chỉ email.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!'); return;
    }
    setLoading(true); setError('');
    try {
      await resetPassword({ email, otp: form.otp, newPassword: form.newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không đúng hoặc đã hết hạn.');
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
        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: s <= step ? '#00B1B0' : 'rgba(255,255,255,0.1)',
                color: s <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', transition: 'all 0.3s',
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ width: '30px', height: '2px', background: s < step ? '#00B1B0' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>Quên mật khẩu?</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '14px' }}>
                Nhập email để nhận mã OTP đặt lại mật khẩu
              </p>
            </div>
            <form onSubmit={handleStep1}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  Địa chỉ Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required style={darkInput}
                />
              </div>
              {error && (
                <div style={{ background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '8px', padding: '12px', color: '#ff8a80', fontSize: '14px', marginBottom: '16px' }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', background: loading ? '#555' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
                border: 'none', borderRadius: '10px', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
              }}>
                {loading ? 'Đang gửi...' : 'Gửi mã OTP →'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP + New Password */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>Đặt lại mật khẩu</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '14px' }}>
                Nhập mã OTP đã được gửi đến <strong style={{ color: '#00B1B0' }}>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Mã OTP</label>
                <input type="text" value={form.otp} onChange={e => setForm(p => ({ ...p, otp: e.target.value }))}
                  placeholder="Nhập mã 6 số" required style={darkInput} maxLength={6} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Mật khẩu mới</label>
                <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Tối thiểu 8 ký tự" required style={darkInput} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Xác nhận mật khẩu</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Nhập lại mật khẩu" required style={darkInput} />
              </div>
              {error && (
                <div style={{ background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '8px', padding: '12px', color: '#ff8a80', fontSize: '14px' }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', background: loading ? '#555' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
                border: 'none', borderRadius: '10px', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
              }}>
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu →'}
              </button>
              <button type="button" onClick={() => setStep(1)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px',
              }}>
                ← Quay lại
              </button>
            </form>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Đặt lại thành công!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
              Mật khẩu của bạn đã được đặt lại thành công. Hãy đăng nhập với mật khẩu mới.
            </p>
            <Link to="/login" style={{
              display: 'inline-block',
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #00B1B0, #0f3460)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '16px',
              textDecoration: 'none',
            }}>
              Đăng nhập ngay →
            </Link>
          </div>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '24px' }}>
            Nhớ mật khẩu? <Link to="/login" style={{ color: '#00B1B0', fontWeight: '600' }}>Đăng nhập</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
