import React, { useEffect, useState } from 'react';
import { getRecordings } from '../utils/lmsApi';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecordings()
      .then(res => setRecordings(res.data.data || []))
      .catch(() => setRecordings([]))
      .finally(() => setLoading(false));
  }, []);

  // Nhóm các file recording theo cặp Meeting + Thời gian bắt đầu
  const groupedRecordings = recordings.reduce((acc, curr) => {
    const timeKey = new Date(curr.startTime || curr.createdAt).getTime();
    const key = `${curr.meetingId}_${timeKey}`;
    
    if (!acc[key]) {
      acc[key] = {
        meetingId: curr.meetingId,
        topic: curr.topic,
        duration: curr.duration,
        startTime: curr.startTime || curr.createdAt,
        files: []
      };
    }
    acc[key].files.push(curr);
    return acc;
  }, {});

  const groupedList = Object.values(groupedRecordings);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>🎬 Recordings</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
        Danh sách bản ghi từ các buổi học Zoom — Tự động lưu khi Zoom kết thúc.
      </p>

      {loading ? (
        <p>Đang tải...</p>
      ) : groupedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ color: 'var(--text-light)' }}>Chưa có recording nào</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px' }}>
            Khi buổi học Zoom kết thúc và có ghi hình, hệ thống sẽ tự động lưu vào đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groupedList.map((group, index) => {
            const startDate = new Date(group.startTime);
            const formattedTime = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const formattedDate = startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            return (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <h3 style={{ marginBottom: '6px', color: 'var(--primary-color)' }}>{group.topic || 'Không có tiêu đề'}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '4px 0' }}>
                    📅 Thời gian: {formattedDate} lúc <strong>{formattedTime}</strong> • Thời lượng: {Math.round((group.duration || 0) / 60)} phút
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
                    Meeting ID: {group.meetingId}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {group.files.map((file) => {
                    const isAudio = file.recordingType?.includes('audio');
                    const sizeMB = file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(1)} MB` : '';
                    
                    return (
                      <div key={file._id} style={{
                        background: '#f8f9fa',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        minWidth: '160px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: isAudio ? '#f39c12' : '#00B1B0' }}>
                          {isAudio ? '🎵 Audio Chỉ Nghe' : '📹 Video Ghi Hình'}
                        </span>
                        {sizeMB && <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Dung lượng: {sizeMB}</span>}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {file.playUrl && (
                            <a 
                              href={file.playUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                            >
                              Xem
                            </a>
                          )}
                          {file.downloadUrl && (
                            <a 
                              href={file.downloadUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                            >
                              Tải
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recordings;
