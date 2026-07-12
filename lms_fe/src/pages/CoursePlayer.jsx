import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails, markComplete, getProgress, saveVideoProgress } from '../utils/lmsApi';
import VideoPlayer from '../components/VideoPlayer';
import QuizComponent from '../components/QuizComponent';
import { useAuth } from '../contexts/AuthContext';

const getFullFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3056/api';
  const backendBase = apiUrl.replace(/\/api$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdminOrTrainer = user && (user.role === 'admin' || user.role === 'trainer');

  // Get flat list of all activities in the course
  const getAllActivities = () => {
    if (!course || !course.sections) return [];
    const list = [];
    course.sections.forEach(section => {
      if (section.activities) {
        list.push(...section.activities);
      }
    });
    return list;
  };
  
  // Track if current video is finished
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [completedActivities, setCompletedActivities] = useState({});
  const [activityProgressDb, setActivityProgressDb] = useState({});
  const [currentVideoProgress, setCurrentVideoProgress] = useState(null);
  const lastSavedTime = useRef(0);

  useEffect(() => {
    Promise.all([
      getCourseDetails(id),
      getProgress(id).catch(() => ({ data: { data: { completedActivities: [], activityDetails: [] } } }))
    ])
      .then(([courseRes, progRes]) => {
        const c = courseRes.data.data;
        const progressData = progRes.data?.data || {};
        
        // Map completed array
        const completedMap = {};
        (progressData.completedActivities || []).forEach(act => {
          completedMap[act._id || act] = true;
        });
        setCompletedActivities(completedMap);

        // Map detailed watch time
        const detailMap = {};
        (progressData.activityDetails || []).forEach(detail => {
          detailMap[detail.activity._id || detail.activity] = detail.watchTime || 0;
        });
        setActivityProgressDb(detailMap);

        setCourse(c);
        // Open first incomplete or just first
        const firstActivity = c.sections?.[0]?.activities?.[0];
        if (firstActivity) setActiveActivity(firstActivity);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Reset states when changing activity
  useEffect(() => {
    setIsVideoFinished(false);
    lastSavedTime.current = 0;
    setCurrentVideoProgress(null);
  }, [activeActivity]);

  const handleVideoProgress = (progress) => {
    setCurrentVideoProgress(progress);
    
    // Only save every 7 seconds to reduce API load
    if (Math.abs(progress.currentTime - lastSavedTime.current) >= 7) {
      lastSavedTime.current = progress.currentTime;
      saveVideoProgress(id, activeActivity._id, progress.currentTime, progress.duration)
        .catch(console.error);
    }
  };

  const handleMarkComplete = async (activityId) => {
    try {
      await markComplete(id, activityId);
      setCompletedActivities(prev => ({ ...prev, [activityId]: true }));
      alert('Đã đánh dấu hoàn thành bài học!');
      
      // Auto move to next lesson
      let foundCurrent = false;
      let nextActivity = null;
      for (const section of course.sections) {
        for (const act of section.activities) {
          if (foundCurrent) {
            nextActivity = act;
            break;
          }
          if (act._id === activityId) foundCurrent = true;
        }
        if (nextActivity) break;
      }
      
      if (nextActivity) {
        setActiveActivity(nextActivity);
      }
    } catch (e) {
      console.error(e);
      // Even if API fails (e.g. mock), allow progression
      setCompletedActivities(prev => ({ ...prev, [activityId]: true }));
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải khóa học...</div>;
  if (!course) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy khóa học.</div>;

  const isCurrentCompleted = completedActivities[activeActivity?._id];
  const canMarkComplete = activeActivity?.type !== 'video' || isVideoFinished || isCurrentCompleted;

  return (
    <div className="player-layout" style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      {/* Sidebar - Danh sách bài học */}
      <div className="player-sidebar" style={{ width: '300px', background: '#fff', borderRight: '1px solid #eee', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: 'var(--primary-color)' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '10px', fontSize: '14px' }}
          >
            ← Quay lại
          </button>
          <h3 style={{ fontSize: '16px', color: 'white', lineHeight: '1.4', margin: 0 }}>{course.title}</h3>
        </div>
        <div>
          {course.sections?.map((section, si) => (
            <div key={section._id}>
              <div style={{ padding: '12px 20px', background: '#f8fafc', fontWeight: '600', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #eee' }}>
                Phần {si + 1}: {section.title}
              </div>
              {section.activities?.map((activity) => {
                const isCompleted = completedActivities[activity._id];
                const isActive = activeActivity?._id === activity._id;
                
                // Determine if this activity is unlocked
                const allActivities = getAllActivities();
                const activityIndex = allActivities.findIndex(act => act._id === activity._id);
                let isUnlocked = true;
                if (!isAdminOrTrainer && activityIndex > 0) {
                  const prevActivity = allActivities[activityIndex - 1];
                  isUnlocked = !!completedActivities[prevActivity._id];
                }

                return (
                  <div
                    key={activity._id}
                    className={`lesson-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                    onClick={() => {
                      if (isUnlocked) {
                        setActiveActivity(activity);
                      } else {
                        alert('Bài học này đang bị khóa. Bạn cần hoàn thành bài học trước đó theo thứ tự!');
                      }
                    }}
                    style={{ 
                      padding: '12px 20px', 
                      cursor: isUnlocked ? 'pointer' : 'not-allowed', 
                      borderBottom: '1px solid #f1f5f9',
                      background: isActive ? '#f0fdfa' : 'white',
                      borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                      transition: 'all 0.2s',
                      opacity: isUnlocked ? 1 : 0.5
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', opacity: isActive ? 1 : 0.6 }}>
                        {!isUnlocked ? '🔒' : (activity.type === 'video' ? '▶' : activity.type === 'pdf' ? '📄' : activity.type === 'zoom_meeting' ? '📹' : '📝')}
                      </span>
                      <span style={{ fontSize: '14px', flex: 1, fontWeight: isActive ? '500' : '400', color: isActive ? 'var(--primary-color)' : '#334155' }}>
                        {activity.title}
                        {isActive && activity.type === 'video' && currentVideoProgress && !isCompleted && (
                          <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '6px', fontWeight: '500' }}>
                            ({Math.round(currentVideoProgress.percent)}%)
                          </span>
                        )}
                      </span>
                      {isCompleted && <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="player-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <div className="video-wrapper" style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeActivity ? (
            <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', color: 'white' }}>
              {activeActivity.type === 'video' && activeActivity.content?.videoUrl && (
                <VideoPlayer 
                  src={getFullFileUrl(activeActivity.content.videoUrl)}
                  autoPlay={true}
                  initialProgress={activityProgressDb[activeActivity._id] || 0}
                  onProgress={handleVideoProgress}
                  onComplete={() => setIsVideoFinished(true)}
                />
              )}
              {activeActivity.type === 'pdf' && (
                <iframe
                  src={getFullFileUrl(activeActivity.content?.pdfUrl)}
                  style={{ width: '100%', height: '75vh', borderRadius: '8px', border: 'none', background: 'white' }}
                  title={activeActivity.title}
                />
              )}
              {activeActivity.type === 'text' && (
                <div style={{ background: 'white', color: '#333', padding: '40px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  dangerouslySetInnerHTML={{ __html: activeActivity.content?.textContent || '' }}
                />
              )}
              {activeActivity.type === 'quiz' && (
                <div style={{ background: 'white', color: '#333', padding: '20px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <QuizComponent 
                    activityId={activeActivity._id} 
                    onComplete={() => setIsCurrentCompleted(true)} 
                  />
                </div>
              )}
              {activeActivity.type === 'zoom_meeting' && (
                <div style={{ textAlign: 'center', background: '#1e293b', padding: '60px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📹</div>
                  <h2 style={{ marginBottom: '15px', color: 'white' }}>Lớp học trực tiếp (Zoom)</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{activeActivity.title}</p>
                  <a
                    href={activeActivity.content?.zoomMeetingId?.joinUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '16px', padding: '14px 40px', borderRadius: '8px' }}
                  >
                    Tham gia phòng Zoom
                  </a>
                </div>
              )}
              {activeActivity.type === 'video' && !activeActivity.content?.videoUrl && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', height: '450px', background: '#1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '48px', opacity: 0.3, marginBottom: '20px' }}>▶</span>
                    <p style={{ color: '#94a3b8' }}>Video đang được xử lý hoặc không khả dụng</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'white', opacity: 0.5 }}>
              <h3>Chọn một bài học ở menu bên trái để bắt đầu</h3>
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        {activeActivity && (
          <div style={{ background: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px', color: '#0f172a', fontWeight: '600' }}>{activeActivity.title}</h2>
              <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>
                {activeActivity.type?.replace('_', ' ')}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {activeActivity.type === 'video' && !isCurrentCompleted && (
                <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>⚠️ Hãy xem hết video để hoàn thành bài học</span>
                  {currentVideoProgress && (
                    <span style={{ background: '#fef3c7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fde68a', color: '#d97706', fontSize: '12px', fontWeight: '600' }}>
                      Đã xem: {Math.round(currentVideoProgress.percent)}%
                    </span>
                  )}
                </span>
              )}
              
              <button
                className="btn btn-primary"
                onClick={() => handleMarkComplete(activeActivity._id)}
                disabled={!canMarkComplete}
                style={{ 
                  opacity: canMarkComplete ? 1 : 0.5, 
                  cursor: canMarkComplete ? 'pointer' : 'not-allowed',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  background: isCurrentCompleted ? '#10b981' : 'var(--primary-color)'
                }}
              >
                {isCurrentCompleted ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành & Tiếp tục'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
