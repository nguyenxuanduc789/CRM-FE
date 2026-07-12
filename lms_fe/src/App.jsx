import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import ZoomLive from './pages/ZoomLive';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Recordings from './pages/Recordings';

const ROLE_BADGE = {
  admin:   { label: '👑 Admin',    color: '#e74c3c' },
  trainer: { label: '🎓 Đào Tạo', color: '#f39c12' },
  student: { label: '📚 Học Viên',color: '#00B1B0' },
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">🎓 Khitam LMS</Link>
        <div className="nav-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/courses">Khóa học</Link>

          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'trainer') && (
                <Link to="/admin">Quản trị</Link>
              )}
              {(user.role === 'admin' || user.role === 'trainer') && (
                <Link to="/recordings">Recordings</Link>
              )}
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard">Khóa học của tôi</Link>
                  <Link to="/wishlist">❤️ Wishlist</Link>
                </>
              )}
              <span style={{
                background: `${ROLE_BADGE[user.role]?.color}22`,
                color: ROLE_BADGE[user.role]?.color,
                border: `1px solid ${ROLE_BADGE[user.role]?.color}66`,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {ROLE_BADGE[user.role]?.label} — {user.fullName}
              </span>
              <button
                className="btn btn-outline"
                onClick={logout}
                style={{ padding: '7px 18px', fontSize: '14px' }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Route bảo vệ: chưa đăng nhập → về Login
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Đang kiểm tra đăng nhập...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Checkout from './pages/Checkout';

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import InstructorLayout from './pages/instructor/InstructorLayout';
import InstructorDashboard from './pages/instructor/Dashboard';
import CoursesManager from './pages/instructor/CoursesManager';
import CourseEditor from './pages/instructor/CourseEditor';
import Wishlist from './pages/Wishlist';
import Certificate from './pages/Certificate';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminOrders from './pages/admin/Orders';
import AdminBanners from './pages/admin/Banners';
import AdminCertificates from './pages/admin/Certificates';
import InstructorStudents from './pages/instructor/Students';
import InstructorRevenue from './pages/instructor/Revenue';
import InstructorQA from './pages/instructor/QA';
import QuizEditor from './pages/instructor/QuizEditor';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/courses"  element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/checkout/:courseId" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/live/:id"   element={<PrivateRoute><ZoomLive /></PrivateRoute>} />
        <Route path="/wishlist"   element={<PrivateRoute><Wishlist /></PrivateRoute>} />
        <Route path="/certificate/:courseId" element={<PrivateRoute><Certificate /></PrivateRoute>} />

        <Route path="/dashboard" element={
          <PrivateRoute roles={['student']}>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:id/edit" element={<CourseEditor />} />
          <Route path="courses/:courseId/quiz/:activityId" element={<QuizEditor />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="*" element={<div style={{padding:'40px'}}>Trang quản trị đang xây dựng...</div>} />
        </Route>

        {/* Instructor Routes */}
        <Route path="/instructor" element={
          <PrivateRoute roles={['admin', 'trainer']}>
            <InstructorLayout />
          </PrivateRoute>
        }>
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<CoursesManager />} />
          <Route path="courses/:id/edit" element={<CourseEditor />} />
          <Route path="courses/:courseId/quiz/:activityId" element={<QuizEditor />} />
          <Route path="students" element={<InstructorStudents />} />
          <Route path="revenue" element={<InstructorRevenue />} />
          <Route path="qa" element={<InstructorQA />} />
          <Route path="*" element={<div style={{padding:'40px'}}>Trang giảng viên đang xây dựng...</div>} />
        </Route>

        <Route path="/recordings" element={
          <PrivateRoute roles={['admin', 'trainer']}>
            <Recordings />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
