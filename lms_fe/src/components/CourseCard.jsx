import React from 'react';
import './CourseCard.css';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, isEnrolled }) => {
  const navigate = useNavigate();

  return (
    <div className="course-card" onClick={() => navigate(`/course/${course._id}`)}>
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="thumbnail-placeholder">🎓</div>
        )}
        <div className="course-badge">{course.level || 'Beginner'}</div>
      </div>
      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">Giảng viên: {course.instructor?.fullName || 'Admin'}</p>
        
        <div className="course-stats">
          <span className="rating">⭐ {course.rating?.toFixed(1) || '5.0'}</span>
          <span className="students">👥 {course.totalStudents || 0} học viên</span>
        </div>

        <div className="course-footer">
          <div className="price">
            {course.price > 0 ? (
              <span className="price-amount">{course.price.toLocaleString()}đ</span>
            ) : (
              <span className="price-free">Miễn phí</span>
            )}
          </div>
          <button className={`btn-enroll ${isEnrolled ? 'enrolled' : ''}`}>
            {isEnrolled ? 'Tiếp tục học' : 'Xem chi tiết'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
