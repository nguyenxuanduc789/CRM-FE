import React, { useEffect, useState } from 'react';
import { getInstructorStats } from '../../utils/lmsApi';

const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstructorStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;

  const data = stats || {
    totalCourses: 5,
    totalStudents: 320,
    totalRevenue: 25000000,
    avgRating: 4.8,
    recentEnrollments: []
  };

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: 'var(--text-dark)' }}>Tổng Quan Giảng Dạy</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="admin-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Tổng Khóa Học</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#334155' }}>{data.totalCourses}</div>
        </div>
        
        <div className="admin-card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Học Viên Của Bạn</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{data.totalStudents}</div>
        </div>
        
        <div className="admin-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Doanh Thu (ước tính)</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{data.totalRevenue.toLocaleString()}đ</div>
        </div>

        <div className="admin-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Điểm Đánh Giá TB</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>⭐ {data.avgRating}</div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Học Viên Mới Nhất</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Khóa học</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chưa có dữ liệu</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorDashboard;
