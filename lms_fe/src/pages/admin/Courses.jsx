import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllCourses, adminApproveCourse } from '../../utils/lmsApi';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    adminGetAllCourses()
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    if (window.confirm('Xác nhận xuất bản khóa học này?')) {
      try {
        await adminApproveCourse(id);
        alert('Đã duyệt khóa học!');
        fetchCourses();
      } catch (err) {
        alert('Lỗi: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Quản Lý Khóa Học</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/courses/new/edit')}
        >
          + Tạo Khóa Học Mới
        </button>
      </div>
      
      <div className="admin-card">
        {loading ? <p>Đang tải...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Giảng viên</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={course.thumbnail || 'https://via.placeholder.com/40'} alt="thumb" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontWeight: '500' }}>{course.title}</span>
                    </div>
                  </td>
                  <td>{course.instructor?.fullName || 'N/A'}</td>
                  <td>{course.price === 0 ? 'Free' : course.price?.toLocaleString()}đ</td>
                  <td>
                    <span style={{ 
                      background: course.isApproved ? '#dcfce7' : '#fef9c3', 
                      color: course.isApproved ? '#16a34a' : '#ca8a04', 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' 
                    }}>
                      {course.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td>
                    {!course.isApproved && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                        onClick={() => handleApprove(course._id)}
                      >
                        &check; Duyệt
                      </button>
                    )}
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>Không có khóa học nào</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
