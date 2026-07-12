import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrollments, getZoomMeetings } from '../utils/lmsApi';

const Dashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyEnrollments(),
      getZoomMeetings()
    ])
      .then(([enrollRes, zoomRes]) => {
        setEnrollments(enrollRes.data.data || []);
        setMeetings(zoomRes.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '30px' }}>Dashboard của tôi</h2>

      {/* Lịch học Zoom trực tiếp */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📹 Lớp Học Trực Tuyến Live
        </h3>
        
        {meetings.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #2D3E50, #00B1B0)',
            color: 'white',
            padding: '30px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Không có lịch học trực tiếp</h3>
              <p style={{ opacity: 0.85, margin: 0 }}>Chưa có lớp học nào được lên lịch. Giáo viên sẽ thông báo khi có lịch học mới.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {meetings.map((meeting) => {
              const startDate = new Date(meeting.startTime);
              const formattedTime = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = startDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              
              return (
                <div key={meeting._id} style={{
                  background: 'white',
                  borderLeft: '5px solid var(--secondary-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div>
                    <span style={{
                      background: 'rgba(0, 177, 176, 0.1)',
                      color: 'var(--secondary-color)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      display: 'inline-block'
                    }}>
                      LỚP HỌC TRỰC TUYẾN
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0 8px 0', color: 'var(--primary-color)' }}>
                      {meeting.topic}
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: '4px 0' }}>
                      📅 {formattedDate} lúc <strong>{formattedTime}</strong> ({meeting.duration} phút)
                    </p>
                    {meeting.course && (
                      <p style={{ fontSize: '13px', color: 'var(--secondary-color)', margin: '4px 0 0 0', fontWeight: '500' }}>
                        📖 Thuộc khóa học: {meeting.course.title}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/live/${meeting.meetingId}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                      ⚡ Vào Học Ngay (Web)
                    </Link>
                    <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                      Mở rộng
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: '20px' }}>Khóa học của tôi</h3>
      {loading ? (
        <p style={{ color: 'var(--text-light)' }}>Đang tải...</p>
      ) : enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>Bạn chưa đăng ký khóa học nào.</p>
          <Link to="/" className="btn btn-primary">Khám phá khóa học</Link>
        </div>
      ) : (
        <div className="course-grid">
          {enrollments.map((item) => (
            <div key={item._id} className="course-card">
              <div className="course-image" style={{
                backgroundImage: item.course?.imageUrl
                  ? `url(${item.course.imageUrl})`
                  : 'linear-gradient(135deg, #2D3E50 0%, #00B1B0 100%)'
              }}></div>
              <div className="course-content">
                <h3 className="course-title">{item.course?.title}</h3>
                <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', margin: '12px 0' }}>
                  <div style={{
                    width: `${item.overallProgress || 0}%`,
                    height: '100%',
                    background: 'var(--secondary-color)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '15px' }}>
                  {item.overallProgress || 0}% Hoàn thành
                </p>
                <Link to={`/course/${item.course?._id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Tiếp tục học
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
