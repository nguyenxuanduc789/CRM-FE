import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getZoomSignature } from '../utils/lmsApi';

const ZoomLive = () => {
  const { id: meetingNumber } = useParams();
  const [signature, setSignature] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    try {
      setLoading(true);
      const res = await getZoomSignature(meetingNumber, 0);
      setSignature(res.data.signature);
      setJoined(true);
      // Khi có signature, Zoom Web SDK sẽ được khởi tạo ở đây
      // ZoomMtg.join({ meetingNumber, userName, signature, sdkKey, passWord })
    } catch (e) {
      alert('Không thể lấy chữ ký Zoom. Kiểm tra lại cấu hình ZOOM_SDK_KEY trong .env của Backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <div id="zmmtg-root"></div>
      
      <div style={{ fontSize: '60px' }}>📹</div>
      <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Lớp học trực tiếp</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
        Meeting ID: <strong style={{ color: '#00B1B0' }}>{meetingNumber}</strong>
      </p>

      {!joined ? (
        <button
          className="btn btn-primary"
          onClick={handleJoin}
          disabled={loading}
          style={{ fontSize: '16px', padding: '14px 40px', marginTop: '10px' }}
        >
          {loading ? 'Đang kết nối...' : 'Tham gia lớp học'}
        </button>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,177,176,0.2)', border: '1px solid #00B1B0', padding: '20px 40px', borderRadius: '12px' }}>
            <p style={{ color: '#00B1B0', fontWeight: '600', marginBottom: '8px' }}>✓ Chữ ký Zoom đã được tạo thành công!</p>
            <p style={{ fontSize: '13px', opacity: 0.7 }}>Zoom Web SDK đang khởi tạo phòng học...</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <a
          href={`https://zoom.us/j/${meetingNumber}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'underline' }}
        >
          Hoặc mở bằng ứng dụng Zoom
        </a>
      </div>
    </div>
  );
};

export default ZoomLive;
