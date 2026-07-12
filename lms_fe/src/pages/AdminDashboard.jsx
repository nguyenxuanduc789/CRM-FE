import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getZoomMeetings, getCourses, createZoomMeeting, deleteZoomMeeting } from '../utils/lmsApi';

const ROLE_BADGE = {
  admin:   { label: '👑 Admin',     bg: '#e74c3c22', color: '#e74c3c', border: '#e74c3c66' },
  trainer: { label: '🎓 Đào Tạo',  bg: '#f39c1222', color: '#f39c12', border: '#f39c1266' },
  student: { label: '📚 Học Viên', bg: '#00B1B022', color: '#00B1B0', border: '#00B1B066' },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [topic, setTopic] = useState('Lớp học Live Yoga & Thiền Định');
  const [meetingId, setMeetingId] = useState('853' + Math.floor(10000000 + Math.random() * 90000000));
  const [passcode, setPasscode] = useState('123456');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)); // 10 mins from now
  const [duration, setDuration] = useState(60);
  const [courseId, setCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoCreate, setAutoCreate] = useState(false);

  const fetchMeetingsAndCourses = () => {
    setLoading(true);
    Promise.all([getZoomMeetings(), getCourses()])
      .then(([zoomRes, courseRes]) => {
        setMeetings(zoomRes.data.data || []);
        const fetchedCourses = courseRes.data.data || [];
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          const defaultCourse = fetchedCourses.find(c => 
            c.title?.toLowerCase().includes('200h') || 
            c.title?.toLowerCase().includes('200')
          ) || fetchedCourses[0];
          setCourseId(defaultCourse._id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetingsAndCourses();
  }, []);

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học trực tuyến này?')) return;
    try {
      await deleteZoomMeeting(id);
      alert('Xóa lớp học thành công!');
      fetchMeetingsAndCourses();
    } catch (err) {
      alert('Lỗi khi xóa lớp học: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) return alert('Vui lòng chọn 1 khóa học.');
    
    setSubmitting(true);
    const startUrl = autoCreate ? '' : `https://zoom.us/s/${meetingId}?zak=test_token`;
    const joinUrl = autoCreate ? '' : `https://zoom.us/j/${meetingId}?pwd=test_password`;

    try {
      await createZoomMeeting({
        topic,
        meetingId: autoCreate ? '' : meetingId,
        passcode,
        startUrl,
        joinUrl,
        startTime,
        duration: Number(duration),
        courseId,
        autoCreate
      });
      alert('Tạo lớp học trực tuyến thành công!');
      // Reset meetingId for next one
      setMeetingId('853' + Math.floor(10000000 + Math.random() * 90000000));
      fetchMeetingsAndCourses();
    } catch (err) {
      alert('Lỗi khi tạo lớp học: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>Trang Quản Trị</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>
        Xin chào, <strong>{user?.fullName}</strong>!
      </p>

      {/* Thẻ thống kê nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { icon: '📚', label: 'Tổng khóa học', value: courses.length.toString() },
          { icon: '👥', label: 'Học viên', value: '1' },
          { icon: '📹', label: 'Buổi Live', value: meetings.length.toString() },
          { icon: '🎬', label: 'Recordings', value: '2' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}>
            <span style={{ fontSize: '32px' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-color)' }}>{card.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', marginBottom: '40px', alignItems: 'start' }}>
        {/* Lịch học Zoom */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📹 Lịch Dạy Học Trực Tuyến (Zoom Live)
          </h3>
          
          {loading ? (
            <p style={{ color: 'var(--text-light)' }}>Đang tải lịch Zoom...</p>
          ) : meetings.length === 0 ? (
            <p style={{ color: 'var(--text-light)', margin: 0 }}>Chưa có lớp học trực tuyến nào được lên lịch.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-light)', fontSize: '14px' }}>Chủ đề</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-light)', fontSize: '14px' }}>Thời gian</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-light)', fontSize: '14px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting) => {
                    const startDate = new Date(meeting.startTime);
                    const formattedTime = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    const formattedDate = startDate.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    
                    return (
                      <tr key={meeting._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{meeting.topic}</div>
                          {meeting.course && (
                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>📖 {meeting.course.title}</div>
                          )}
                          <div style={{ fontSize: '11px', color: '#888' }}>Tên phòng: {meeting.meetingId}</div>
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                          <div>{formattedDate}</div>
                          <div style={{ color: 'var(--secondary-color)', fontWeight: '600' }}>{formattedTime} ({meeting.duration}p)</div>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link 
                              to={`/live/${meeting.meetingId}`}
                              className="btn btn-primary"
                              style={{ 
                                padding: '6px 10px', 
                                fontSize: '11px', 
                                textDecoration: 'none',
                                background: '#2ecc71',
                                borderColor: '#2ecc71'
                              }}
                            >
                              ▶ Vào Dạy (Web)
                            </Link>
                            <a 
                              href={meeting.startUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: '11px', textDecoration: 'none' }}
                            >
                              Mở rộng
                            </a>
                            <button 
                              onClick={() => handleDeleteMeeting(meeting._id)}
                              className="btn btn-outline"
                              style={{ 
                                padding: '6px 10px', 
                                fontSize: '11px', 
                                borderColor: '#e74c3c', 
                                color: '#e74c3c',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Tự Mở Lớp Học */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>➕ Tự mở lớp học Zoom</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Chủ đề bài học</label>
              <input 
                type="text" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Khóa học áp dụng</label>
              <select 
                value={courseId} 
                onChange={e => setCourseId(e.target.value)} 
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
              <input 
                type="checkbox" 
                id="autoCreate" 
                checked={autoCreate} 
                onChange={e => setAutoCreate(e.target.checked)} 
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <label htmlFor="autoCreate" style={{ fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Tự động tạo phòng Daily.co thật
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500', color: autoCreate ? '#aaa' : '#000' }}>Tên phòng (Room Name)</label>
                <input 
                  type="text" 
                  value={autoCreate ? 'Tự tạo...' : meetingId} 
                  onChange={e => setMeetingId(e.target.value)} 
                  required={!autoCreate} 
                  disabled={autoCreate}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: autoCreate ? '#f0f0f0' : '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mật mã</label>
                <input 
                  type="text" 
                  value={passcode} 
                  onChange={e => setPasscode(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bắt đầu</label>
                <input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Thời lượng (phút)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ width: '100%', padding: '10px', marginTop: '10px' }}
            >
              {submitting ? 'Đang tạo...' : 'Tạo & Phát Hành Lớp Học'}
            </button>
          </form>
        </div>
      </div>

      {/* Quản lý chung */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '16px' }}>Quản lý nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/" className="btn btn-outline">📚 Xem khóa học</Link>
            <Link to="/recordings" className="btn btn-outline">🎬 Xem Recordings</Link>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '16px' }}>Tài khoản của tôi</h3>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Email: </span>
            <span>{user?.email}</span>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Role: </span>
            <span style={{
              background: ROLE_BADGE[user?.role]?.bg,
              color: ROLE_BADGE[user?.role]?.color,
              border: `1px solid ${ROLE_BADGE[user?.role]?.border}`,
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {ROLE_BADGE[user?.role]?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
