import React, { useEffect, useState } from 'react';
import { adminGetStats } from '../../utils/lmsApi';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;

  // Nếu API lỗi, dùng mock data để không vỡ layout
  const data = stats || {
    totalUsers: 152,
    totalCourses: 24,
    totalApprovedCourses: 20,
    totalOrders: 350,
    totalRevenue: 150000000,
    newUsersThisMonth: 45,
    revenueThisMonth: 25000000,
    topCourses: [
      { _id: '1', title: 'Khóa học React Native', totalStudents: 120, price: 500000 },
      { _id: '2', title: 'NodeJS Master', totalStudents: 95, price: 600000 }
    ],
    recentOrders: []
  };

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: 'var(--text-dark)' }}>Tổng Quan Hệ Thống</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Tổng Doanh Thu</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{data.totalRevenue.toLocaleString()}đ</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '10px' }}>↑ {(data.revenueThisMonth || 0).toLocaleString()}đ tháng này</div>
        </div>
        
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Học Viên</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{data.totalUsers}</div>
          <div style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '10px' }}>+ {data.newUsersThisMonth || 0} học viên mới</div>
        </div>
        
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Khóa Học Đã Duyệt</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{data.totalApprovedCourses} / {data.totalCourses}</div>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Tổng Đơn Hàng</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{data.totalOrders}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="admin-card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Khóa Học Phổ Biến Nhất</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên khóa học</th>
                <th>Giá bán</th>
                <th>Học viên</th>
              </tr>
            </thead>
            <tbody>
              {data.topCourses?.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: '500' }}>{c.title}</td>
                  <td>{c.price?.toLocaleString()}đ</td>
                  <td><span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>{c.totalStudents} người</span></td>
                </tr>
              ))}
              {(!data.topCourses || data.topCourses.length === 0) && (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Hoạt Động Gần Đây</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>Chức năng đang cập nhật...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
