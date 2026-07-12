import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificate } from '../utils/lmsApi';

const Certificate = () => {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCertificate(courseId)
      .then(res => {
        if (!res.data.success) {
          setError(res.data.message);
        } else {
          setCert(res.data.data);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Bạn chưa đủ điều kiện nhận chứng chỉ hoặc có lỗi xảy ra.');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải chứng chỉ...</div>;
  if (error) return (
    <div style={{ padding: '60px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
      <h3 style={{ color: '#ef4444' }}>Chưa thể cấp chứng chỉ</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.history.back()} style={{ marginTop: '20px' }}>Quay lại bài học</button>
    </div>
  );

  return (
    <div style={{ background: '#cbd5e1', minHeight: '100vh', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ In / Tải PDF</button>
        <button className="btn btn-outline" style={{ background: 'white' }}>🔗 Chia sẻ liên kết</button>
      </div>

      <div 
        className="certificate-box print-area" 
        style={{ 
          width: '800px', 
          height: '560px', 
          background: 'white', 
          border: '15px solid #0f172a', 
          padding: '40px', 
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          fontFamily: "'Times New Roman', serif"
        }}
      >
        <div style={{ border: '2px solid #cbd5e1', height: '100%', padding: '30px', position: 'relative' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '42px', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '4px' }}>
            Giấy Chứng Nhận
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', fontStyle: 'italic', marginBottom: '30px' }}>
            Chứng nhận hoàn thành khóa học
          </p>
          
          <h2 style={{ fontSize: '36px', color: '#334155', marginBottom: '20px', fontWeight: 'bold' }}>
            {cert?.student?.fullName || 'Học Viên'}
          </h2>
          
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '15px' }}>Đã xuất sắc hoàn thành khóa học</p>
          
          <h3 style={{ fontSize: '28px', color: 'var(--primary-color)', marginBottom: '40px' }}>
            {cert?.course?.title || 'Tên Khóa Học'}
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px', padding: '0 40px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ borderBottom: '1px solid #333', width: '150px', margin: '0 auto 10px' }}></p>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Giảng viên</p>
            </div>
            
            <div style={{ width: '100px', height: '100px', background: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', border: '5px solid #e2e8f0', transform: 'rotate(-15deg)' }}>
              KHITAM<br/>VERIFIED
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>Ngày cấp: {new Date(cert?.issuedAt || Date.now()).toLocaleDateString('vi-VN')}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Mã: {cert?.certificateNumber}</p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; margin: 0; border: none; box-shadow: none; width: 100%; height: 100vh; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Certificate;
