import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../admin/AdminLayout.css'; // Tái sử dụng CSS của Admin cho đồng nhất

const InstructorLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/instructor', icon: '📊', label: 'Tổng quan' },
    { path: '/instructor/courses', icon: '📚', label: 'Khóa học của tôi' },
    { path: '/instructor/students', icon: '👥', label: 'Học viên' },
    { path: '/instructor/revenue', icon: '💰', label: 'Doanh thu' },
    { path: '/instructor/qa', icon: '❓', label: 'Hỏi đáp (Q&A)' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ backgroundColor: '#0f172a' }}>
        <div className="sidebar-header">
          <h2 style={{ color: '#f59e0b' }}>Giảng Viên</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ background: '#f59e0b' }}>👨‍🏫</div>
            <div>
              <p className="user-name">{user?.fullName}</p>
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="admin-main">
        <div className="admin-topbar">
          <h3>Khu Vực Dành Cho Giảng Viên</h3>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 16px' }}>Ra trang chủ</Link>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;
