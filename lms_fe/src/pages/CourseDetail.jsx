import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails, getMyEnrollments, enrollCourse } from '../utils/lmsApi';
import { useAuth } from '../contexts/AuthContext';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCourseDetails(id);
      setCourse(res.data.data);

      if (user && user.role === 'student') {
        const myCoursesRes = await getMyEnrollments();
        const enrolled = myCoursesRes.data.data.some(e => e.course._id === id);
        setIsEnrolled(enrolled);
      } else if (user && (user.role === 'admin' || user.role === 'trainer')) {
        // Admin or Trainer can always view
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (course.price === 0) {
      try {
        await enrollCourse({ courseId: id, paymentAmount: 0, paymentMethod: 'free' });
        alert('Đăng ký thành công khóa học miễn phí!');
        setIsEnrolled(true);
        navigate(`/course/${id}`);
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  if (loading) return <div className="loading-spinner">Đang tải...</div>;
  if (!course) return <div className="error-message">Không tìm thấy khóa học</div>;

  return (
    <div className="course-detail-page">
      {/* Hero Section */}
      <div className="cd-hero">
        <div className="container cd-hero-inner">
          <div className="cd-hero-content">
            <span className="badge">{course.level || 'Beginner'}</span>
            <h1>{course.title}</h1>
            <p className="cd-desc">{course.description}</p>
            <div className="cd-meta">
              <span>⭐ {course.rating?.toFixed(1) || '5.0'} ({course.totalReviews || 0} đánh giá)</span>
              <span>👥 {course.totalStudents || 0} học viên</span>
              <span>👨‍🏫 {course.instructor?.fullName || 'Admin'}</span>
              <span>🌐 Tiếng Việt</span>
            </div>
          </div>
          <div className="cd-floating-card">
            <div className="card-thumbnail">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} />
              ) : (
                <div className="placeholder">🎓</div>
              )}
            </div>
            <div className="card-body">
              <div className="card-price">
                {course.price > 0 ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}
              </div>
              {isEnrolled ? (
                <button className="btn btn-primary btn-block" onClick={() => navigate(`/course/${id}`)}>
                  Tiếp tục học
                </button>
              ) : (
                <button className="btn btn-primary btn-block" onClick={handleEnrollClick}>
                  {course.price > 0 ? 'Mua ngay' : 'Đăng ký học'}
                </button>
              )}
              <div className="card-includes">
                <h4>Khóa học bao gồm:</h4>
                <ul>
                  <li>📺 {course.sections?.reduce((acc, sec) => acc + sec.activities.length, 0) || 0} bài học</li>
                  <li>📱 Truy cập trên mọi thiết bị</li>
                  <li>🏅 Cấp chứng chỉ hoàn thành</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container cd-main">
        <div className="cd-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Tổng quan</button>
          <button className={activeTab === 'curriculum' ? 'active' : ''} onClick={() => setActiveTab('curriculum')}>Nội dung</button>
        </div>

        <div className="cd-tab-content">
          {activeTab === 'overview' && (
            <div className="tab-overview">
              <h3>Mục tiêu khóa học</h3>
              <ul className="objectives-list">
                {course.objectives?.length > 0 ? course.objectives.map((obj, i) => (
                  <li key={i}>&check; {obj}</li>
                )) : (
                  <>
                    <li>&check; Nắm vững kiến thức cơ bản đến nâng cao</li>
                    <li>&check; Áp dụng thực tế ngay sau khóa học</li>
                  </>
                )}
              </ul>
              
              <h3>Yêu cầu</h3>
              <ul className="req-list">
                {course.requirements?.length > 0 ? course.requirements.map((req, i) => (
                  <li key={i}>&bull; {req}</li>
                )) : (
                  <>
                    <li>&bull; Có máy tính kết nối internet</li>
                    <li>&bull; Tinh thần ham học hỏi</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="tab-curriculum">
              {course.sections?.map((section, idx) => (
                <div key={section._id} className="curriculum-section">
                  <div className="section-header">
                    <h4>Phần {idx + 1}: {section.title}</h4>
                    <span>{section.activities?.length || 0} bài học</span>
                  </div>
                  <div className="section-body">
                    {section.activities?.map(act => (
                      <div key={act._id} className="activity-item">
                        <span className="act-icon">
                          {act.type === 'video' ? '▶' : act.type === 'pdf' ? '📄' : act.type === 'zoom_meeting' ? '📹' : '📝'}
                        </span>
                        <span className="act-title">{act.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
