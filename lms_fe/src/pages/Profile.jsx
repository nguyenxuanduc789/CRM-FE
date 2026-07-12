import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword, getMyOrders } from '../utils/lmsApi';

const Profile = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    title: user?.title || '',
    phone: user?.phone || '',
    website: user?.website || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      getMyOrders().then(res => setOrders(res.data.data || [])).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setProfileMsg('');
    try {
      await updateProfile(profileForm);
      setProfileMsg('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      setProfileMsg('❌ ' + (err.response?.data?.message || 'Lỗi khi lưu.'));
    } finally {
      setLoading(false);
      setTimeout(() => setProfileMsg(''), 4000);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('❌ Mật khẩu xác nhận không khớp!'); return;
    }
    setPwLoading(true); setPwMsg('');
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('✅ Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.message || 'Lỗi khi đổi mật khẩu.'));
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(''), 4000);
    }
  };

  const tabs = [
    { id: 'profile', label: '👤 Thông tin' },
    { id: 'security', label: '🔐 Bảo mật' },
    { id: 'orders', label: '📦 Đơn hàng' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e0e8ef',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>
          Tài khoản của tôi
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Quản lý thông tin cá nhân và bảo mật tài khoản</p>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'linear-gradient(135deg, #00B1B0, #0f3460)',
                  margin: '0 auto 8px',
                  border: '3px solid #00B1B0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', color: '#fff',
                }} >
                  {!avatarPreview && (user?.fullName?.[0] || '?')}
                </div>
                <label style={{ position: 'absolute', bottom: '8px', right: '-4px', background: '#00B1B0', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' }}>
                  📷
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a2e' }}>{user?.fullName}</div>
              <div style={{ fontSize: '12px', color: '#00B1B0', fontWeight: '500' }}>{user?.email}</div>
            </div>

            {/* Nav */}
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: tab === t.id ? '#f0fdfc' : 'none',
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  fontSize: '14px', fontWeight: tab === t.id ? '700' : '500',
                  color: tab === t.id ? '#00B1B0' : '#555',
                  marginBottom: '4px', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {/* Profile Tab */}
            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>
                  Thông tin cá nhân
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Họ và tên *</label>
                    <input value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input value={user?.email} readOnly style={{ ...inputStyle, background: '#f5f5f5', color: '#999' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Chức danh</label>
                    <input value={profileForm.title} onChange={e => setProfileForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="VD: Senior Developer" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Số điện thoại</label>
                    <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+84..." style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Website</label>
                    <input value={profileForm.website} onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yourwebsite.com" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Giới thiệu bản thân</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Viết vài dòng về bản thân..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                    />
                  </div>
                </div>

                {profileMsg && (
                  <div style={{
                    marginTop: '16px', padding: '12px 16px', borderRadius: '8px',
                    background: profileMsg.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: profileMsg.startsWith('✅') ? '#155724' : '#721c24',
                    fontSize: '14px',
                  }}>
                    {profileMsg}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  marginTop: '24px', padding: '12px 32px',
                  background: loading ? '#aaa' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px',
                }}>
                  {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <form onSubmit={handleChangePw}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>
                  Đổi mật khẩu
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
                  {[
                    { name: 'currentPassword', label: 'Mật khẩu hiện tại' },
                    { name: 'newPassword', label: 'Mật khẩu mới' },
                    { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input
                        type="password"
                        value={pwForm[f.name]}
                        onChange={e => setPwForm(p => ({ ...p, [f.name]: e.target.value }))}
                        required style={inputStyle}
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                </div>

                {pwMsg && (
                  <div style={{
                    marginTop: '16px', padding: '12px 16px', borderRadius: '8px',
                    background: pwMsg.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: pwMsg.startsWith('✅') ? '#155724' : '#721c24',
                    fontSize: '14px', maxWidth: '440px',
                  }}>
                    {pwMsg}
                  </div>
                )}

                <button type="submit" disabled={pwLoading} style={{
                  marginTop: '24px', padding: '12px 32px',
                  background: pwLoading ? '#aaa' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontWeight: '700', cursor: pwLoading ? 'not-allowed' : 'pointer', fontSize: '15px',
                }}>
                  {pwLoading ? 'Đang đổi...' : '🔐 Đổi mật khẩu'}
                </button>
              </form>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>
                  Lịch sử đơn hàng
                </h2>
                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Đang tải...</div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                    <div>Chưa có đơn hàng nào</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                          {['Khóa học', 'Số tiền', 'Trạng thái', 'Ngày mua'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: '600' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                              {order.course?.title || '--'}
                            </td>
                            <td style={{ padding: '14px 12px', fontSize: '14px', color: '#00B1B0', fontWeight: '700' }}>
                              {order.amount?.toLocaleString('vi-VN')} ₫
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                                background: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                                color: order.status === 'completed' ? '#28a745' : '#856404',
                              }}>
                                {order.status === 'completed' ? '✓ Hoàn thành' : order.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#888' }}>
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
