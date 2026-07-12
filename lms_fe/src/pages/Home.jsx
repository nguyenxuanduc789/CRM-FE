import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../utils/lmsApi';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Chào mừng đến với Khitam LMS</h1>
          <p>Nền tảng học tập trực tuyến chuyên nghiệp — Video, PDF, và lớp học Live qua Zoom.</p>
          <Link to="/dashboard" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
            Bắt đầu học
          </Link>
        </div>
      </section>

      <section className="container">
        <h2 style={{ marginTop: '40px', marginBottom: '10px' }}>Khóa học nổi bật</h2>
        {loading ? (
          <p style={{ padding: '40px 0', color: 'var(--text-light)' }}>Đang tải khóa học...</p>
        ) : courses.length === 0 ? (
          <p style={{ padding: '40px 0', color: 'var(--text-light)' }}>Chưa có khóa học nào được xuất bản.</p>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-image" style={{
                  backgroundImage: course.imageUrl
                    ? `url(${course.imageUrl})`
                    : 'linear-gradient(135deg, #2D3E50 0%, #00B1B0 100%)'
                }}></div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p style={{ color: 'var(--text-light)', marginBottom: '10px', fontSize: '14px' }}>
                    {course.description?.substring(0, 80)}...
                  </p>
                  <p style={{ fontWeight: '600', color: 'var(--secondary-color)', marginBottom: '15px' }}>
                    {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} ₫`}
                  </p>
                  <Link to={`/course/${course._id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                    Xem khóa học
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
