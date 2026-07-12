import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Tổng quan' },
    { path: '/admin/users', icon: '👥', label: 'Người dùng' },
    { path: '/admin/courses', icon: '📚', label: 'Khóa học' },
    { path: '/admin/categories', icon: '🏷️', label: 'Danh mục' },
    { path: '/admin/coupons', icon: '🎟️', label: 'Mã giảm giá' },
    { path: '/admin/orders', icon: '💳', label: 'Đơn hàng' },
    { path: '/admin/banners', icon: '🖼️', label: 'Banner' },
    { path: '/admin/certificates', icon: '🏅', label: 'Chứng chỉ' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Khitam Admin</h2>
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
            <div className="user-avatar">👑</div>
            <div>
              <p className="user-name">{user?.fullName}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="admin-main">
        <div className="admin-topbar">
          <h3>Bảng điều khiển quản trị</h3>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 16px' }}>Ra trang chủ</Link>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
