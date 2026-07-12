import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllCourses } from '../../utils/lmsApi';
import { useAuth } from '../../contexts/AuthContext';

const CoursesManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ideally we have a getInstructorCourses API, but we'll filter adminGetCourses for now
    adminGetAllCourses()
      .then(res => {
        const myCourses = res.data.data.filter(c => c.instructor?._id === user._id || c.instructor === user._id);
        setCourses(myCourses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Quản Lý Khóa Học</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/instructor/courses/new/edit')}
        >
          + Tạo Khóa Học Mới
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh bìa</th>
                <th>Tên khóa học</th>
                <th>Giá bán</th>
                <th>Học viên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td>
                    <img src={course.thumbnail || 'https://via.placeholder.com/50'} alt={course.title} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ fontWeight: '500' }}>{course.title}</td>
                  <td>{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}</td>
                  <td>{course.totalStudents || 0}</td>
                  <td>
                    <span style={{ 
                      background: course.isApproved ? '#dcfce7' : '#fef9c3', 
                      color: course.isApproved ? '#16a34a' : '#ca8a04', 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' 
                    }}>
                      {course.isApproved ? 'Đã xuất bản' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Bạn chưa tạo khóa học nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CoursesManager;
